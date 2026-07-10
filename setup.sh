#!/bin/bash
# TG Golf Carts — One-Command Setup Script

set -e
echo "🌴 Setting up TG Golf Carts..."

# Check Node.js
if ! command -v node &> /dev/null; then
  echo "❌ Node.js not found. Install from https://nodejs.org (LTS version)"
  exit 1
fi

echo "✅ Node $(node --version) detected"

# Install server dependencies
echo "📦 Installing server dependencies..."
cd server && npm install

# Generate Prisma client and push schema
echo "🗄️  Setting up database..."
npx prisma generate
npx prisma db push

# Seed with demo data
echo "🌱 Seeding database..."
node src/seed.js

cd ..

# Install client dependencies
echo "📦 Installing client dependencies..."
cd client && npm install

cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "🚀 To start the app:"
echo "   Terminal 1: cd server && npm run dev"
echo "   Terminal 2: cd client && npm run dev"
echo ""
echo "🌐 Frontend: http://localhost:5173"
echo "⚙️  Backend:  http://localhost:5000"
echo ""
echo "👤 Admin login: admin@tggolfcarts.com / admin123"
echo "👤 Test user:   customer@example.com / customer123"
