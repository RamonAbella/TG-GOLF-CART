const router = require('express').Router();
const prisma = require('../lib/prisma');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.get('/', authenticate, requireAdmin, async (req, res) => {
  const { month } = req.query;
  let where = {};
  if (month) {
    const [year, mon] = month.split('-').map(Number);
    const start = new Date(Date.UTC(year, mon - 1, 1));
    const end = new Date(Date.UTC(year, mon, 0, 23, 59, 59, 999));
    where.date = { gte: start, lte: end };
  }
  try {
    const expenses = await prisma.expense.findMany({ where, orderBy: { date: 'desc' } });
    res.json(expenses);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', authenticate, requireAdmin, async (req, res) => {
  const { date, category, description, vendor, amount, receiptUrl, customerId, notes } = req.body;
  if (!description || !amount) return res.status(400).json({ error: 'Description and amount required' });
  try {
    const expense = await prisma.expense.create({
      data: { date: date ? new Date(date) : new Date(), category: category || 'other', description, vendor, amount: parseFloat(amount), receiptUrl, customerId, notes }
    });
    res.status(201).json(expense);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  const { date, category, description, vendor, amount, receiptUrl, customerId, notes } = req.body;
  console.log('[EXPENSE PUT] received date:', date, '| parsed:', date ? new Date(date).toISOString() : 'no date');
  try {
    const expense = await prisma.expense.update({
      where: { id: req.params.id },
      data: {
        ...(date && { date: new Date(date) }),
        ...(category !== undefined && { category }),
        ...(description !== undefined && { description }),
        ...(vendor !== undefined && { vendor }),
        ...(amount !== undefined && { amount: parseFloat(amount) }),
        ...(receiptUrl !== undefined && { receiptUrl }),
        ...(customerId !== undefined && { customerId: customerId || null }),
        ...(notes !== undefined && { notes }),
      }
    });
    console.log('[EXPENSE PUT] saved date:', expense.date);
    res.json(expense);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    await prisma.expense.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
