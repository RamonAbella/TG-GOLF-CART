const router = require('express').Router();
const prisma = require('../lib/prisma');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const testimonials = await prisma.testimonial.findMany({
      where: { approved: true },
      orderBy: { date: 'desc' }
    });
    res.json(testimonials);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  const { name, rating, text, service } = req.body;
  if (!name || !rating || !text || !service) return res.status(400).json({ error: 'Missing required fields' });

  try {
    const testimonial = await prisma.testimonial.create({
      data: { name, rating: parseInt(rating), text, service, approved: false }
    });
    res.status(201).json(testimonial);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id/approve', authenticate, requireAdmin, async (req, res) => {
  try {
    const t = await prisma.testimonial.update({ where: { id: req.params.id }, data: { approved: true } });
    res.json(t);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
