const router = require('express').Router();
const prisma = require('../lib/prisma');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.post('/track', async (req, res) => {
  const { path, referrer, sessionId } = req.body;
  if (!path || !sessionId) return res.status(400).json({ error: 'path and sessionId required' });
  try {
    await prisma.pageView.create({
      data: {
        path: String(path).slice(0, 500),
        referrer: referrer ? String(referrer).slice(0, 500) : null,
        sessionId: String(sessionId).slice(0, 100),
        userAgent: req.headers['user-agent']?.slice(0, 300) || null,
      },
    });
    res.status(201).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/stats', authenticate, requireAdmin, async (req, res) => {
  const days = Math.min(parseInt(req.query.days) || 30, 365);
  const since = new Date();
  since.setDate(since.getDate() - days);

  try {
    const views = await prisma.pageView.findMany({
      where: { createdAt: { gte: since } },
      select: { path: true, referrer: true, sessionId: true, createdAt: true },
    });

    const totalViews = views.length;
    const uniqueVisitors = new Set(views.map((v) => v.sessionId)).size;

    const byDay = {};
    for (let i = 0; i < days; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      byDay[d.toISOString().slice(0, 10)] = 0;
    }
    views.forEach((v) => {
      const key = v.createdAt.toISOString().slice(0, 10);
      if (key in byDay) byDay[key] += 1;
    });
    const viewsByDay = Object.entries(byDay).sort(([a], [b]) => a.localeCompare(b)).map(([date, count]) => ({ date, count }));

    const pathCounts = {};
    views.forEach((v) => { pathCounts[v.path] = (pathCounts[v.path] || 0) + 1; });
    const topPages = Object.entries(pathCounts).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([path, count]) => ({ path, count }));

    const referrerCounts = {};
    views.forEach((v) => {
      let label = 'Direct';
      if (v.referrer) {
        try { label = new URL(v.referrer).hostname.replace(/^www\./, ''); } catch { label = v.referrer.slice(0, 50); }
      }
      referrerCounts[label] = (referrerCounts[label] || 0) + 1;
    });
    const topReferrers = Object.entries(referrerCounts).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([referrer, count]) => ({ referrer, count }));

    res.json({ totalViews, uniqueVisitors, viewsByDay, topPages, topReferrers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
