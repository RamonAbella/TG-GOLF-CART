const router = require('express').Router();
const prisma = require('../lib/prisma');
const { authenticate, requireAdmin, optionalAuth } = require('../middleware/auth');

const calculatePrice = (cart, startDate, endDate) => {
  const days = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);

  let total, durationType;
  if (months >= 1) {
    total = months * cart.monthlyRate + (days % 30) * cart.dailyRate;
    durationType = 'monthly';
  } else if (weeks >= 1) {
    total = weeks * cart.weeklyRate + (days % 7) * cart.dailyRate;
    durationType = 'weekly';
  } else {
    total = days * cart.dailyRate;
    durationType = 'daily';
  }
  return { total: Math.round(total * 100) / 100, days, durationType };
};

router.post('/calculate', async (req, res) => {
  const { cartId, startDate, endDate } = req.body;
  try {
    const cart = await prisma.cart.findUnique({ where: { id: cartId } });
    if (!cart) return res.status(404).json({ error: 'Cart not found' });
    const pricing = calculatePrice(cart, startDate, endDate);
    res.json({ ...pricing, deposit: Math.round(pricing.total * 0.3 * 100) / 100 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', optionalAuth, async (req, res) => {
  const { cartId, guestName, guestEmail, guestPhone, startDate, endDate, notes } = req.body;
  if (!cartId || !guestName || !guestEmail || !guestPhone || !startDate || !endDate) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const cart = await prisma.cart.findUnique({ where: { id: cartId } });
    if (!cart) return res.status(404).json({ error: 'Cart not found' });
    if (cart.status === 'maintenance') return res.status(400).json({ error: 'Cart not available' });

    const overlapping = await prisma.booking.findFirst({
      where: {
        cartId,
        status: { in: ['pending', 'confirmed'] },
        OR: [{ startDate: { lte: new Date(endDate) }, endDate: { gte: new Date(startDate) } }]
      }
    });
    if (overlapping) return res.status(400).json({ error: 'Cart not available for selected dates' });

    const { total, days, durationType } = calculatePrice(cart, startDate, endDate);
    const deposit = Math.round(total * 0.3 * 100) / 100;

    const booking = await prisma.booking.create({
      data: {
        cartId,
        userId: req.user?.id || null,
        guestName, guestEmail, guestPhone,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        duration: days,
        durationType,
        totalPrice: total,
        deposit,
        notes: notes || null,
      },
      include: { cart: true }
    });

    res.status(201).json({
      ...booking,
      cart: { ...booking.cart, features: JSON.parse(booking.cart.features), images: JSON.parse(booking.cart.images) }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/my', authenticate, async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { userId: req.user.id },
      include: { cart: true },
      orderBy: { createdAt: 'desc' }
    });
    const parsed = bookings.map(b => ({
      ...b,
      cart: { ...b.cart, features: JSON.parse(b.cart.features), images: JSON.parse(b.cart.images) }
    }));
    res.json(parsed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', authenticate, requireAdmin, async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const where = status ? { status } : {};
  try {
    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where, include: { cart: true },
        orderBy: { createdAt: 'desc' },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit)
      }),
      prisma.booking.count({ where })
    ]);
    const parsed = bookings.map(b => ({
      ...b,
      cart: { ...b.cart, features: JSON.parse(b.cart.features), images: JSON.parse(b.cart.images) }
    }));
    res.json({ bookings: parsed, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id/status', authenticate, requireAdmin, async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
  if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Invalid status' });

  try {
    const booking = await prisma.booking.update({
      where: { id: req.params.id },
      data: { status },
      include: { cart: true }
    });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
