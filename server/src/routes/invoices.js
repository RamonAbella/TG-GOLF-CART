const router = require('express').Router();
const prisma = require('../lib/prisma');
const { authenticate, requireAdmin } = require('../middleware/auth');

const parse = (inv) => ({ ...inv, lineItems: JSON.parse(inv.lineItems || '[]') });

router.get('/', authenticate, requireAdmin, async (req, res) => {
  const { status } = req.query;
  const where = status ? { status } : {};
  try {
    const invoices = await prisma.invoice.findMany({ where, orderBy: { createdAt: 'desc' } });
    res.json(invoices.map(parse));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/next-num', authenticate, requireAdmin, async (req, res) => {
  try {
    const last = await prisma.invoice.findFirst({ orderBy: { invoiceNum: 'desc' } });
    let next = 1;
    if (last) {
      const num = parseInt(last.invoiceNum.replace(/[^0-9]/g, ''));
      if (!isNaN(num)) next = num + 1;
    }
    res.json({ invoiceNum: `TGC-${String(next).padStart(4, '0')}` });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const inv = await prisma.invoice.findUnique({ where: { id: req.params.id } });
    if (!inv) return res.status(404).json({ error: 'Not found' });
    res.json(parse(inv));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', authenticate, requireAdmin, async (req, res) => {
  const { invoiceNum, customerId, customerName, customerEmail, date, dueDate, status, subtotal, taxRate, taxAmount, total, notes, lineItems } = req.body;
  if (!invoiceNum || !customerName) return res.status(400).json({ error: 'Invoice number and customer name required' });
  try {
    const inv = await prisma.invoice.create({
      data: { invoiceNum, customerId: customerId || null, customerName, customerEmail, date: date ? new Date(date) : new Date(), dueDate: dueDate ? new Date(dueDate) : null, status: status || 'draft', subtotal: subtotal || 0, taxRate: taxRate || 0, taxAmount: taxAmount || 0, total: total || 0, notes, lineItems: JSON.stringify(lineItems || []) }
    });
    res.status(201).json(parse(inv));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  const { invoiceNum, customerId, customerName, customerEmail, status, subtotal, taxRate, taxAmount, total, notes, taxEnabled, lineItems, date, dueDate } = req.body;
  try {
    const inv = await prisma.invoice.update({
      where: { id: req.params.id },
      data: {
        ...(invoiceNum !== undefined && { invoiceNum }),
        ...(customerId !== undefined && { customerId: customerId || null }),
        ...(customerName !== undefined && { customerName }),
        ...(customerEmail !== undefined && { customerEmail }),
        ...(status !== undefined && { status }),
        ...(subtotal !== undefined && { subtotal }),
        ...(taxRate !== undefined && { taxRate }),
        ...(taxAmount !== undefined && { taxAmount }),
        ...(total !== undefined && { total }),
        ...(notes !== undefined && { notes }),
        ...(taxEnabled !== undefined && { taxEnabled }),
        ...(lineItems !== undefined && { lineItems: JSON.stringify(lineItems) }),
        ...(date && { date: new Date(date) }),
        ...(dueDate ? { dueDate: new Date(dueDate) } : { dueDate: null }),
      }
    });
    res.json(parse(inv));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    await prisma.invoice.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
