const express = require('express');
const prisma = require('../lib/prisma');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Public: get all content as key→value map
router.get('/', async (req, res) => {
  try {
    const rows = await prisma.siteContent.findMany();
    const map = {};
    for (const r of rows) map[r.key] = r.value;
    res.json(map);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: get all rows with metadata
router.get('/all', authenticate, requireAdmin, async (req, res) => {
  try {
    const rows = await prisma.siteContent.findMany({ orderBy: [{ section: 'asc' }, { key: 'asc' }] });
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: update a single content field
router.put('/:key', authenticate, requireAdmin, async (req, res) => {
  try {
    const { value } = req.body;
    const updated = await prisma.siteContent.update({
      where: { key: req.params.key },
      data: { value },
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
