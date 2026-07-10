const router = require('express').Router();
const prisma = require('../lib/prisma');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.post('/', async (req, res) => {
  const { type, customerName, customerEmail, customerPhone, cartMake, cartModel, cartYear, description } = req.body;
  if (!type || !customerName || !customerEmail || !customerPhone || !description) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const estimatedPrices = {
    battery_conversion: 1200,
    battery_sale: 800,
    installation: 200,
    maintenance: 150,
  };

  try {
    const request = await prisma.serviceRequest.create({
      data: {
        type, customerName, customerEmail, customerPhone,
        cartMake: cartMake || null,
        cartModel: cartModel || null,
        cartYear: cartYear ? parseInt(cartYear) : null,
        description,
        estimatedPrice: estimatedPrices[type] || null,
      }
    });
    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', authenticate, requireAdmin, async (req, res) => {
  const { status, type } = req.query;
  const where = {};
  if (status) where.status = status;
  if (type) where.type = type;

  try {
    const requests = await prisma.serviceRequest.findMany({
      where, orderBy: { createdAt: 'desc' }
    });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const request = await prisma.serviceRequest.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
