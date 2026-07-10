const express = require('express');
const prisma = require('../lib/prisma');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

const parse = (o) => ({ ...o, benefits: JSON.parse(o.benefits || '[]') });

// Public: get active service offerings
router.get('/', async (req, res) => {
  try {
    const offerings = await prisma.serviceOffering.findMany({
      where: { isActive: true },
      orderBy: { orderIndex: 'asc' },
    });
    res.json(offerings.map(parse));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: get all
router.get('/all', authenticate, requireAdmin, async (req, res) => {
  try {
    const offerings = await prisma.serviceOffering.findMany({ orderBy: { orderIndex: 'asc' } });
    res.json(offerings.map(parse));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: create offering
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { benefits, ...rest } = req.body;
    const created = await prisma.serviceOffering.create({
      data: { ...rest, benefits: JSON.stringify(benefits || []) },
    });
    res.json(parse(created));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: update offering
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { benefits, ...rest } = req.body;
    const updated = await prisma.serviceOffering.update({
      where: { id: req.params.id },
      data: { ...rest, benefits: JSON.stringify(benefits || []) },
    });
    res.json(parse(updated));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: delete offering
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    await prisma.serviceOffering.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
