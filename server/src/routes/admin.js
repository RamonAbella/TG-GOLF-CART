const router = require('express').Router();
const prisma = require('../lib/prisma');
const { authenticate, requireAdmin } = require('../middleware/auth');
const XLSX = require('xlsx');
const emailService = require('../services/email');
const oauthService = require('../services/oauth');

// Public — Google redirects here after OAuth (no auth middleware)
router.get('/oauth/callback', async (req, res) => {
  const { code, error } = req.query;
  if (error || !code) return res.send(`<script>window.opener?.postMessage({type:'oauth_error',error:'${error||'cancelled'}'},'*');window.close();</script>`);
  try {
    const { email } = await oauthService.exchangeCode(code);
    res.send(`<script>window.opener?.postMessage({type:'oauth_success',email:'${email}'},'*');window.close();</script>`);
  } catch (err) {
    res.send(`<script>window.opener?.postMessage({type:'oauth_error',error:'${err.message}'},'*');window.close();</script>`);
  }
});

router.use(authenticate, requireAdmin);

router.get('/stats', async (req, res) => {
  const now = new Date();
  const year = now.getUTCFullYear();
  const mon = now.getUTCMonth();
  const monthStart = new Date(Date.UTC(year, mon, 1));
  try {
    const [totalCarts, totalBookings, pendingBookings, confirmedBookings,
      totalRevenue, totalListings, pendingServices, recentBookings,
      totalLeads, newLeads, totalCRMCustomers, paidInvoices, monthExpenses, allExpenses, recentInvoices] = await Promise.all([
      prisma.cart.count(),
      prisma.booking.count(),
      prisma.booking.count({ where: { status: 'pending' } }),
      prisma.booking.count({ where: { status: 'confirmed' } }),
      prisma.booking.aggregate({ _sum: { totalPrice: true }, where: { status: { in: ['confirmed', 'completed'] } } }),
      prisma.marketplaceListing.count({ where: { status: 'active' } }),
      prisma.serviceRequest.count({ where: { status: 'pending' } }),
      prisma.booking.findMany({ take: 5, orderBy: { createdAt: 'desc' }, include: { cart: true } }),
      prisma.lead.count(),
      prisma.lead.count({ where: { status: 'new' } }),
      prisma.cRMCustomer.count(),
      prisma.invoice.aggregate({ _sum: { total: true }, where: { status: 'paid' } }),
      prisma.expense.aggregate({ _sum: { amount: true }, where: { date: { gte: monthStart } } }),
      prisma.expense.aggregate({ _sum: { amount: true } }),
      prisma.invoice.findMany({ take: 5, orderBy: { createdAt: 'desc' }, select: { id: true, invoiceNum: true, customerName: true, total: true, status: true, createdAt: true } }),
    ]);

    const invoiceRevenue = paidInvoices._sum.total || 0;
    const expensesThisMonth = monthExpenses._sum.amount || 0;
    const expensesTotal = allExpenses._sum.amount || 0;

    res.json({
      totalCarts, totalBookings, pendingBookings, confirmedBookings,
      totalRevenue: totalRevenue._sum.totalPrice || 0,
      totalListings, pendingServices,
      recentBookings: recentBookings.map(b => ({
        ...b,
        cart: { ...b.cart, features: JSON.parse(b.cart.features), images: JSON.parse(b.cart.images) }
      })),
      totalLeads, newLeads, totalCRMCustomers,
      invoiceRevenue, expensesThisMonth, expensesTotal,
      netProfit: invoiceRevenue - expensesTotal,
      recentInvoices,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/testimonials', async (req, res) => {
  try {
    const testimonials = await prisma.testimonial.findMany({ orderBy: { date: 'desc' } });
    res.json(testimonials);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Google OAuth ──────────────────────────────────────────────
router.get('/oauth/status', async (req, res) => {
  try {
    const cfg = await oauthService.getOAuthConfig();
    res.json({ connected: !!(cfg.access_token), email: cfg.email || '', hasClientId: !!(cfg.client_id) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/oauth/credentials', async (req, res) => {
  const { clientId, clientSecret } = req.body;
  if (!clientId || !clientSecret) return res.status(400).json({ error: 'Client ID and Secret required' });
  try {
    await oauthService.saveConfig('client_id', clientId);
    await oauthService.saveConfig('client_secret', clientSecret);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/oauth/url', async (req, res) => {
  try {
    const cfg = await oauthService.getOAuthConfig();
    if (!cfg.client_id) return res.status(400).json({ error: 'Save Client ID first' });
    const url = await oauthService.getAuthUrl(cfg.client_id, cfg.client_secret);
    res.json({ url });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/oauth/disconnect', async (req, res) => {
  try {
    for (const k of ['access_token', 'refresh_token', 'email']) await oauthService.saveConfig(k, '');
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/oauth/send-email', async (req, res) => {
  const { to, subject, html } = req.body;
  if (!to || !subject) return res.status(400).json({ error: 'to and subject required' });
  try {
    await oauthService.sendEmail({ to, subject, html: html || subject });
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Legacy nodemailer config ───────────────────────────────────
router.get('/email-config', async (req, res) => {
  try {
    const { user } = await emailService.getEmailConfig();
    res.json({ user: user || '' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/email-config', async (req, res) => {
  const { user, pass } = req.body;
  if (!user || !pass) return res.status(400).json({ error: 'Email and app password required' });
  try {
    await emailService.saveEmailConfig(user, pass);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/email-test', async (req, res) => {
  try {
    await emailService.testConnection();
    res.json({ ok: true });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.post('/send-email', async (req, res) => {
  const { to, subject, html } = req.body;
  if (!to || !subject) return res.status(400).json({ error: 'to and subject required' });
  try {
    await emailService.sendEmail({ to, subject, html: html || subject });
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/backup', async (req, res) => {
  try {
    const [customers, invoices, expenses, leads, templates] = await Promise.all([
      prisma.cRMCustomer.findMany(),
      prisma.invoice.findMany(),
      prisma.expense.findMany(),
      prisma.lead.findMany(),
      prisma.emailTemplate.findMany(),
    ]);

    const wb = XLSX.utils.book_new();

    const toSheet = (rows) => {
      if (!rows.length) return XLSX.utils.aoa_to_sheet([[]]);
      return XLSX.utils.json_to_sheet(rows.map(r => {
        const out = {};
        Object.entries(r).forEach(([k, v]) => {
          out[k] = v instanceof Date ? v.toISOString() : v;
        });
        return out;
      }));
    };

    XLSX.utils.book_append_sheet(wb, toSheet(customers), 'customers');
    XLSX.utils.book_append_sheet(wb, toSheet(invoices), 'invoices');
    XLSX.utils.book_append_sheet(wb, toSheet(expenses), 'expenses');
    XLSX.utils.book_append_sheet(wb, toSheet(leads), 'leads');
    XLSX.utils.book_append_sheet(wb, toSheet(templates), 'email_templates');

    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Disposition', 'attachment; filename="tg-backup.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buf);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
