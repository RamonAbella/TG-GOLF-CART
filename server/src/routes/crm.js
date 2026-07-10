const router = require('express').Router();
const prisma = require('../lib/prisma');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.get('/', authenticate, requireAdmin, async (req, res) => {
  const { status, voltage, q } = req.query;
  const where = {};
  if (status) where.status = status;
  if (voltage) where.voltage = voltage;
  if (q) where.OR = [
    { name: { contains: q } },
    { phone: { contains: q } },
    { city: { contains: q } },
  ];
  try {
    const customers = await prisma.cRMCustomer.findMany({ where, orderBy: { createdAt: 'desc' }, include: { invoices: { select: { id: true, total: true, status: true } } } });
    res.json(customers);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const c = await prisma.cRMCustomer.findUnique({ where: { id: req.params.id }, include: { invoices: true } });
    if (!c) return res.status(404).json({ error: 'Not found' });
    res.json(c);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', authenticate, requireAdmin, async (req, res) => {
  const { name, phone, email, city, cartModel, voltage, status, notes, installDate, warrantyEnd, source } = req.body;
  if (!name) return res.status(400).json({ error: 'Name required' });
  try {
    const customer = await prisma.cRMCustomer.create({ data: { name, phone, email, city, cartModel, voltage, status: status || 'lead', notes, installDate, warrantyEnd, source } });
    res.status(201).json(customer);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  const { name, phone, email, city, cartModel, voltage, status, notes, installDate, warrantyEnd, source } = req.body;
  try {
    const customer = await prisma.cRMCustomer.update({
      where: { id: req.params.id },
      data: { name, phone, email, city, cartModel, voltage, status, notes, installDate, warrantyEnd, source }
    });
    res.json(customer);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    await prisma.invoice.deleteMany({ where: { customerId: req.params.id } });
    await prisma.cRMCustomer.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
