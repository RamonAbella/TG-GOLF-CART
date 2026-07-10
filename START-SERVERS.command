#!/bin/bash
# TG Golf Carts — Start Both Servers
# Double-click this file in Finder to start the website

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "======================================"
echo "  TG Golf Carts Website"
echo "======================================"
echo ""

# Kill any existing servers on these ports
echo "Stopping any existing servers..."
lsof -ti:3001 | xargs kill -9 2>/dev/null
lsof -ti:5173 | xargs kill -9 2>/dev/null
sleep 1

# Start backend
echo "Starting backend server (port 3001)..."
cd "$DIR/server"
node src/index.js >> "$DIR/server.log" 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

sleep 2

# Start frontend
echo "Starting frontend (port 5173)..."
cd "$DIR/client"
npm run dev >> "$DIR/client.log" 2>&1 &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

sleep 3

echo ""
echo "======================================"
echo "  SERVERS ARE RUNNING"
echo ""
echo "  Website:  http://localhost:5173"
echo "  Admin:    http://localhost:5173/admin"
echo "  Backend:  http://localhost:3001"
echo ""
echo "  Close this window to STOP servers"
echo "======================================"
echo ""

# Keep window open and wait
wait $BACKEND_PID $FRONTEND_PID
