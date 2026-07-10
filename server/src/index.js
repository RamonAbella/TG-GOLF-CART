require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const cartRoutes = require('./routes/carts');
const bookingRoutes = require('./routes/bookings');
const serviceRoutes = require('./routes/services');
const marketplaceRoutes = require('./routes/marketplace');
const testimonialRoutes = require('./routes/testimonials');
const adminRoutes = require('./routes/admin');
const paymentRoutes = require('./routes/payments');
const uploadRoutes = require('./routes/upload');
const offeringRoutes = require('./routes/offerings');
const contentRoutes = require('./routes/content');
const leadsRoutes = require('./routes/leads');
const crmRoutes = require('./routes/crm');
const invoicesRoutes = require('./routes/invoices');
const expensesRoutes = require('./routes/expenses');
const emailTemplatesRoutes = require('./routes/email-templates');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/carts', cartRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/offerings', offeringRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/leads', leadsRoutes);
app.use('/api/crm', crmRoutes);
app.use('/api/invoices', invoicesRoutes);
app.use('/api/expenses', expensesRoutes);
app.use('/api/email-templates', emailTemplatesRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`TG Golf Carts server running on http://localhost:${PORT}`);
});
