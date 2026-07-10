const router = require('express').Router();
const prisma = require('../lib/prisma');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.get('/', authenticate, requireAdmin, async (req, res) => {
  const { status } = req.query;
  const where = status && status !== 'all' ? { status } : {};
  try {
    const leads = await prisma.lead.findMany({ where, orderBy: { createdAt: 'desc' } });
    res.json(leads);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', authenticate, requireAdmin, async (req, res) => {
  const { name, phone, email, service, notes, preferredDate, status, source } = req.body;
  if (!name) return res.status(400).json({ error: 'Name required' });
  try {
    const lead = await prisma.lead.create({ data: { name, phone, email, service: service || 'rental', notes, preferredDate, status: status || 'new', source } });
    res.status(201).json(lead);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const lead = await prisma.lead.update({ where: { id: req.params.id }, data: req.body });
    res.json(lead);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    await prisma.lead.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
