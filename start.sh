#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting Typing Speed Test Application...${NC}"

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        return 0
    else
        return 1
    fi
}

# Function to wait for server to be ready
wait_for_server() {
    local port=$1
    local max_attempts=30
    local attempt=1
    
    echo -e "${YELLOW}⏳ Waiting for server on port $port...${NC}"
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s http://localhost:$port/health >/dev/null 2>&1; then
            echo -e "${GREEN}✅ Server on port $port is ready!${NC}"
            return 0
        fi
        
        echo -e "${YELLOW}Attempt $attempt/$max_attempts - Server not ready yet...${NC}"
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo -e "${RED}❌ Server on port $port failed to start within 60 seconds${NC}"
    return 1
}

# Check if backend server is already running
if check_port 3001; then
    echo -e "${GREEN}✅ Backend server is already running on port 3001${NC}"
else
    echo -e "${YELLOW}🔧 Starting backend server...${NC}"
    cd SERVER
    npm install --silent
    npm start &
    BACKEND_PID=$!
    cd ..
    
    # Wait for backend to be ready
    if ! wait_for_server 3001; then
        echo -e "${RED}❌ Backend server failed to start${NC}"
        exit 1
    fi
fi

# Check if frontend is already running
if check_port 5173; then
    echo -e "${GREEN}✅ Frontend is already running on port 5173${NC}"
else
    echo -e "${YELLOW}🔧 Starting frontend development server...${NC}"
    npm install --silent
    npm run dev &
    FRONTEND_PID=$!
    
    # Wait for frontend to be ready
    if ! wait_for_server 5173; then
        echo -e "${RED}❌ Frontend failed to start${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}🎉 Application is ready!${NC}"
echo -e "${GREEN}📱 Frontend: http://localhost:5173${NC}"
echo -e "${GREEN}🔧 Backend: http://localhost:3001${NC}"
echo -e "${YELLOW}💡 Press Ctrl+C to stop all servers${NC}"

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}🛑 Stopping servers...${NC}"
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
    fi
    echo -e "${GREEN}✅ Servers stopped${NC}"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Keep script running
wait