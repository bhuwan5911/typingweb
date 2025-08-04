# Multiplayer Typing Test

A real-time multiplayer typing test application built with React, TypeScript, and Socket.IO.

## Features

- Real-time multiplayer typing races
- Room-based gameplay
- Live progress tracking
- WPM (Words Per Minute) calculation
- Modern UI with dark/light mode support

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Installation

1. Clone the repository
2. Install dependencies for both client and server:

```bash
# Install client dependencies
npm install

# Install server dependencies
cd SERVER
npm install
cd ..
```

## Running the Application

### Option 1: Run both client and server together (Recommended)
```bash
npm run dev-full
```

This will start both the server (on port 3001) and the client (on port 5173) simultaneously.

### Option 2: Run separately

**Start the server first:**
```bash
npm run start-server
```

**In a new terminal, start the client:**
```bash
npm run dev
```

## Troubleshooting

### Connection Issues

If you see connection errors in the browser console:

1. **Make sure the server is running** - The server must be started before the client
2. **Check port 3001** - Ensure no other application is using port 3001
3. **Restart both client and server** - Sometimes a fresh start resolves connection issues

### Common Error: "socket.off is not a function"

This error occurs when the socket connection fails. The application now includes:
- Better error handling for socket connections
- Automatic reconnection attempts
- Visual connection status indicator
- Graceful fallback when server is unavailable

### Server Not Starting

If the server fails to start:
1. Check if port 3001 is already in use
2. Ensure all server dependencies are installed: `cd SERVER && npm install`
3. Check the server logs for specific error messages

## Development

- **Client**: React + TypeScript + Vite
- **Server**: Node.js + Express + Socket.IO
- **Styling**: Tailwind CSS

## Project Structure

```
├── src/                    # Client source code
│   ├── components/        # React components
│   ├── services/         # API and socket services
│   └── App.tsx          # Main application component
├── SERVER/               # Server source code
│   ├── server.js        # Express + Socket.IO server
│   └── package.json     # Server dependencies
└── package.json         # Client dependencies
```

## Available Scripts

- `npm run dev` - Start client development server
- `npm run start-server` - Start the Socket.IO server
- `npm run dev-full` - Start both client and server together
- `npm run build` - Build the client for production
- `npm run preview` - Preview the production build