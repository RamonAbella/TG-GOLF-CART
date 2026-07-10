const router = require('express').Router();
const prisma = require('../lib/prisma');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const templates = await prisma.emailTemplate.findMany({ orderBy: { createdAt: 'asc' } });
    res.json(templates);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', authenticate, requireAdmin, async (req, res) => {
  const { name, subject, body } = req.body;
  if (!name) return res.status(400).json({ error: 'Name required' });
  try {
    const t = await prisma.emailTemplate.create({ data: { name, subject: subject || '', body: body || '' } });
    res.status(201).json(t);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const t = await prisma.emailTemplate.update({ where: { id: req.params.id }, data: req.body });
    res.json(t);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    await prisma.emailTemplate.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
