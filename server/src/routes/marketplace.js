const router = require('express').Router();
const prisma = require('../lib/prisma');
const { authenticate, requireAdmin, optionalAuth } = require('../middleware/auth');

router.get('/', async (req, res) => {
  const { make, condition, minPrice, maxPrice, status = 'active' } = req.query;
  const where = { status };
  if (make) where.make = { contains: make };
  if (condition) where.condition = condition;
  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = parseFloat(minPrice);
    if (maxPrice) where.price.lte = parseFloat(maxPrice);
  }

  try {
    const listings = await prisma.marketplaceListing.findMany({
      where, orderBy: { createdAt: 'desc' }
    });
    const parsed = listings.map(l => ({
      ...l,
      features: JSON.parse(l.features || '[]'),
      images: JSON.parse(l.images || '[]'),
    }));
    res.json(parsed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const listing = await prisma.marketplaceListing.findUnique({ where: { id: req.params.id } });
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    res.json({ ...listing, features: JSON.parse(listing.features || '[]'), images: JSON.parse(listing.images || '[]') });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', optionalAuth, async (req, res) => {
  const { title, make, model, year, condition, price, description, features, images, location, sellerName, sellerEmail, sellerPhone } = req.body;
  if (!title || !make || !model || !year || !condition || !price || !sellerName || !sellerEmail || !sellerPhone) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const listing = await prisma.marketplaceListing.create({
      data: {
        title, make, model,
        year: parseInt(year),
        condition,
        price: parseFloat(price),
        description: description || '',
        features: JSON.stringify(features || []),
        images: JSON.stringify(images || []),
        location: location || 'Key Biscayne, FL',
        sellerName, sellerEmail, sellerPhone,
        userId: req.user?.id || null,
        status: 'pending',
      }
    });
    res.status(201).json({ ...listing, features: JSON.parse(listing.features), images: JSON.parse(listing.images) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: create listing directly as active
router.post('/admin', authenticate, requireAdmin, async (req, res) => {
  const { title, make, model, year, condition, price, description, features, images, location, sellerName, sellerEmail, sellerPhone } = req.body;
  if (!title || !make || !model || !year || !condition || !price || !sellerName || !sellerEmail || !sellerPhone) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    const listing = await prisma.marketplaceListing.create({
      data: {
        title, make, model,
        year: parseInt(year),
        condition,
        price: parseFloat(price),
        description: description || '',
        features: JSON.stringify(features || []),
        images: JSON.stringify(images || []),
        location: location || 'Key Biscayne, FL',
        sellerName, sellerEmail, sellerPhone,
        userId: req.user.id,
        status: 'active',
      }
    });
    res.status(201).json({ ...listing, features: JSON.parse(listing.features), images: JSON.parse(listing.images) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: update listing
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  const { features, images, year, price, ...rest } = req.body;
  try {
    const listing = await prisma.marketplaceListing.update({
      where: { id: req.params.id },
      data: {
        ...rest,
        ...(year !== undefined && { year: parseInt(year) }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(features !== undefined && { features: JSON.stringify(features) }),
        ...(images !== undefined && { images: JSON.stringify(images) }),
      }
    });
    res.json({ ...listing, features: JSON.parse(listing.features), images: JSON.parse(listing.images) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id/status', authenticate, requireAdmin, async (req, res) => {
  const { status } = req.body;
  try {
    const listing = await prisma.marketplaceListing.update({
      where: { id: req.params.id },
      data: { status }
    });
    res.json(listing);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    await prisma.marketplaceListing.delete({ where: { id: req.params.id } });
    res.json({ message: 'Listing deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
