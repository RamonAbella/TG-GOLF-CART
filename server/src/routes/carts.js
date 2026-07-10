const router = require('express').Router();
const prisma = require('../lib/prisma');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.get('/', async (req, res) => {
  const { status, type, capacity } = req.query;
  const where = {};
  if (status) where.status = status;
  if (type) where.type = type;
  if (capacity) where.capacity = { gte: parseInt(capacity) };

  try {
    const carts = await prisma.cart.findMany({ where, orderBy: { createdAt: 'desc' } });
    const parsed = carts.map(c => ({
      ...c,
      features: JSON.parse(c.features || '[]'),
      images: JSON.parse(c.images || '[]'),
    }));
    res.json(parsed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const cart = await prisma.cart.findUnique({ where: { id: req.params.id } });
    if (!cart) return res.status(404).json({ error: 'Cart not found' });
    res.json({ ...cart, features: JSON.parse(cart.features || '[]'), images: JSON.parse(cart.images || '[]') });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/availability', async (req, res) => {
  const { startDate, endDate } = req.query;
  try {
    const overlapping = await prisma.booking.findFirst({
      where: {
        cartId: req.params.id,
        status: { in: ['pending', 'confirmed'] },
        OR: [
          { startDate: { lte: new Date(endDate) }, endDate: { gte: new Date(startDate) } }
        ]
      }
    });
    res.json({ available: !overlapping });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authenticate, requireAdmin, async (req, res) => {
  const { name, model, year, capacity, type, color, description, features, images, dailyRate, weeklyRate, monthlyRate } = req.body;
  try {
    const cart = await prisma.cart.create({
      data: {
        name, model, year: parseInt(year), capacity: parseInt(capacity),
        type, color, description,
        features: JSON.stringify(features || []),
        images: JSON.stringify(images || []),
        dailyRate: parseFloat(dailyRate),
        weeklyRate: parseFloat(weeklyRate),
        monthlyRate: parseFloat(monthlyRate),
      }
    });
    res.status(201).json({ ...cart, features: JSON.parse(cart.features), images: JSON.parse(cart.images) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  const { features, images, year, capacity, dailyRate, weeklyRate, monthlyRate, ...rest } = req.body;
  try {
    const cart = await prisma.cart.update({
      where: { id: req.params.id },
      data: {
        ...rest,
        ...(year !== undefined && { year: parseInt(year) }),
        ...(capacity !== undefined && { capacity: parseInt(capacity) }),
        ...(dailyRate !== undefined && { dailyRate: parseFloat(dailyRate) }),
        ...(weeklyRate !== undefined && { weeklyRate: parseFloat(weeklyRate) }),
        ...(monthlyRate !== undefined && { monthlyRate: parseFloat(monthlyRate) }),
        ...(features !== undefined && { features: JSON.stringify(features) }),
        ...(images !== undefined && { images: JSON.stringify(images) }),
      }
    });
    res.json({ ...cart, features: JSON.parse(cart.features), images: JSON.parse(cart.images) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    // Remove bookings first to satisfy the foreign key constraint
    await prisma.booking.deleteMany({ where: { cartId: req.params.id } });
    await prisma.cart.delete({ where: { id: req.params.id } });
    res.json({ message: 'Cart deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
