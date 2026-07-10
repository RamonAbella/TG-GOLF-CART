# TG Golf Carts — Full-Stack Website

Key Biscayne's premier golf cart rental, lithium battery conversion, and marketplace platform.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, TailwindCSS, React Router v6 |
| Backend | Node.js, Express, Prisma ORM |
| Database | SQLite (dev) — swap to PostgreSQL for production |
| Auth | JWT (JSON Web Tokens) |
| Payment | Stripe (integration ready) |
| State | Zustand |

## Prerequisites

- **Node.js 18+** — Download from [nodejs.org](https://nodejs.org)

## Quick Start

```bash
# 1. Run the setup script
chmod +x setup.sh && ./setup.sh

# 2. Start both servers (two separate terminals)
cd server && npm run dev      # Backend on :5000
cd client && npm run dev      # Frontend on :5173
```

Visit **http://localhost:5173**

## Login Credentials (Demo)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@tggolfcarts.com | admin123 |
| Customer | customer@example.com | customer123 |

## Project Structure

```
├── client/                    # React frontend
│   └── src/
│       ├── pages/
│       │   ├── Home.jsx       # Landing page
│       │   ├── Rentals.jsx    # Browse & book carts
│       │   ├── Services.jsx   # Battery conversions, maintenance
│       │   ├── Marketplace.jsx# Buy/sell carts
│       │   ├── ListCart.jsx   # Sell your cart form
│       │   ├── Login.jsx      # Auth
│       │   └── admin/
│       │       ├── Dashboard.jsx    # Stats overview
│       │       ├── Inventory.jsx    # Cart CRUD
│       │       ├── Bookings.jsx     # Manage bookings
│       │       ├── Services.jsx     # Service requests
│       │       └── Marketplace.jsx  # Listing moderation
│       └── components/
│           ├── Navbar.jsx
│           ├── Footer.jsx
│           ├── CartCard.jsx
│           ├── BookingModal.jsx   # 3-step booking flow
│           └── AdminLayout.jsx
│
└── server/                    # Express backend
    ├── src/
    │   ├── index.js           # Server entry point
    │   ├── routes/            # All API routes
    │   │   ├── auth.js
    │   │   ├── carts.js
    │   │   ├── bookings.js
    │   │   ├── services.js
    │   │   ├── marketplace.js
    │   │   ├── testimonials.js
    │   │   ├── admin.js
    │   │   └── payments.js
    │   ├── middleware/auth.js
    │   └── seed.js            # Demo data
    └── prisma/schema.prisma
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/carts | List all carts (filter: status, type, capacity) |
| GET | /api/carts/:id/availability | Check cart availability |
| POST | /api/bookings | Create a booking |
| POST | /api/bookings/calculate | Calculate pricing |
| GET | /api/marketplace | Browse listings |
| POST | /api/marketplace | Submit a listing |
| POST | /api/services | Submit service request |
| GET | /api/testimonials | Get approved testimonials |
| GET | /api/admin/stats | Dashboard stats (admin) |
| PATCH | /api/bookings/:id/status | Update booking status (admin) |

## Features

### Customer-Facing
- **Homepage** — Hero, featured fleet, services, pricing comparison vs KB Green, testimonials
- **Rental Booking** — Browse fleet, filter by type/capacity/availability, 3-step booking modal with date picker, pricing calculator, and confirmation
- **Services** — Lithium battery conversions, battery sales, installation, maintenance with request form
- **Marketplace** — Browse/search pre-owned carts, contact sellers directly, list your own cart
- **Auth** — Register/login with JWT, persistent sessions

### Admin Dashboard (`/admin`)
- **Stats** — Revenue, bookings, pending requests at a glance
- **Inventory** — Full CRUD for cart fleet (add, edit, delete, status)
- **Bookings** — View all bookings, confirm/cancel/complete actions
- **Services** — Manage service requests, update statuses
- **Marketplace** — Moderate listings, approve/reject/mark sold

## Payment Setup (Stripe)

Add your Stripe keys to `server/.env`:

```env
STRIPE_SECRET_KEY=sk_live_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_secret
```

The payment flow:
1. Customer books → creates booking with `pending` status
2. Call `/api/payments/create-intent` → returns Stripe `clientSecret`
3. Frontend collects card (Stripe Elements)
4. Call `/api/payments/confirm` → updates booking to `confirmed`

## Production Deployment

1. Switch database to PostgreSQL in `server/prisma/schema.prisma`
2. Update `DATABASE_URL` in environment
3. Set `JWT_SECRET` to a strong random string
4. Build frontend: `cd client && npm run build`
5. Serve `client/dist` statically from Express or CDN

## Competitive Pricing Strategy

This site is built to undercut KB Green:
- Daily from $65 (vs ~$89)
- Weekly packages with ~20% savings over daily
- Monthly rates for residents and snowbirds
- Lithium conversions from $1,200 (vs ~$1,800 elsewhere)
