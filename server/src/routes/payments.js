const router = require('express').Router();
const prisma = require('../lib/prisma');

let stripe;
try {
  if (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes('your_stripe')) {
    stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  }
} catch {}

router.post('/create-intent', async (req, res) => {
  if (!stripe) return res.status(503).json({ error: 'Payment processing not configured. Add your Stripe key to .env' });

  const { bookingId } = req.body;
  try {
    const booking = await prisma.booking.findUnique({ where: { id: bookingId }, include: { cart: true } });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    const intent = await stripe.paymentIntents.create({
      amount: Math.round(booking.deposit * 100),
      currency: 'usd',
      metadata: { bookingId: booking.id, cartName: booking.cart.name },
      description: `Deposit for ${booking.cart.name} rental - ${booking.guestName}`,
    });

    res.json({ clientSecret: intent.client_secret, amount: booking.deposit });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/confirm', async (req, res) => {
  const { bookingId, paymentIntentId } = req.body;
  try {
    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'confirmed', paymentId: paymentIntentId }
    });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
