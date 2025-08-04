#!/bin/bash

echo "🚀 Starting Multiplayer Typing Test Application..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing client dependencies..."
    npm install
fi

if [ ! -d "SERVER/node_modules" ]; then
    echo "📦 Installing server dependencies..."
    cd SERVER && npm install && cd ..
fi

# Check if port 3001 is already in use
if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Port 3001 is already in use. Stopping existing process..."
    pkill -f "node server.js" || true
    sleep 2
fi

echo "🔄 Starting server and client..."
npm run dev-full