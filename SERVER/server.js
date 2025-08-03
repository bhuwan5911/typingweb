const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.static('public'));

const rooms = new Map();
const sampleTexts = [
    "The quick brown fox jumps over the lazy dog near the riverbank where children often play during summer afternoons.",
    "Technology has revolutionized the way we communicate, work, and live our daily lives, bringing incredible opportunities.",
    "In the heart of the bustling city, where skyscrapers reach toward the clouds and people move with purpose through streets."
];

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('create-room', ({ playerName }) => {
        console.log('Creating room for player:', playerName);
        const newRoomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        const room = {
            players: {
                [socket.id]: {
                    name: playerName,
                    progress: 0,
                    wpm: 0,
                    socketId: socket.id
                }
            },
            gameStarted: false,
            currentText: ''
        };

        rooms.set(newRoomCode, room);
        socket.join(newRoomCode);

        console.log('Room created:', newRoomCode, 'Players:', room.players);
        socket.emit('room-created', { roomCode: newRoomCode, playerId: socket.id });
        io.to(newRoomCode).emit('players-update', room.players);
    });

    socket.on('join-room', ({ roomCode, playerName }) => {
        console.log('Joining room:', roomCode, 'Player:', playerName);
        const room = rooms.get(roomCode);
        if (!room) {
            console.log('Room not found:', roomCode);
            socket.emit('room-error', { message: 'Room not found' });
            return;
        }

        // Add player to room
        room.players[socket.id] = {
            name: playerName,
            progress: 0,
            wpm: 0,
            socketId: socket.id
        };
        socket.join(roomCode);

        console.log('Player joined room:', roomCode, 'All players:', room.players);
        socket.emit('room-joined', { roomCode, playerId: socket.id });
        io.to(roomCode).emit('players-update', room.players);

        // Start game if enough players and not already started
        if (Object.keys(room.players).length >= 2 && !room.gameStarted) {
            room.gameStarted = true;
            const text = sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
            room.currentText = text;
            io.to(roomCode).emit('game-start', { text });
        }
    });

    socket.on('player-progress', ({ progress, wpm }) => {
        const roomCode = Array.from(socket.rooms).find(code => code !== socket.id);
        const room = rooms.get(roomCode);
        if (!room || !room.players[socket.id]) return;

        room.players[socket.id].progress = progress;
        room.players[socket.id].wpm = wpm;

        socket.to(roomCode).emit('player-progress', {
            playerId: socket.id,
            progress,
            wpm
        });

        // Game ends when any player finishes the text
        if (progress >= room.currentText.length) {
            const results = Object.values(room.players)
                .sort((a, b) => b.wpm - a.wpm)
                .map(p => ({ name: p.name, wpm: p.wpm }));

            io.to(roomCode).emit('game-end', results);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        rooms.forEach((room, roomCode) => {
            if (room.players[socket.id]) {
                delete room.players[socket.id];
                if (Object.keys(room.players).length === 0) {
                    rooms.delete(roomCode);
                } else {
                    io.to(roomCode).emit('players-update', room.players);
                }
            }
        });
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
