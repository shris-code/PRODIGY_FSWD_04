// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.static('public'));

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*'},
});

// In-memory storage (resets when server restarts)
const rooms = new Map(); // roomName -> {users: Map<socketId, username>, history: []}

function ensureRoom(room) {
  if (!rooms.has(room)) {
    rooms.set(room, { users: new Map(), history: [] });
  }
  return rooms.get(room);
}

io.on('connection', (socket) => {
  // When a user joins, they send username and room
  socket.on('join', ({ username, room }) => {
    username = (username || 'Anonymous').trim();
    room = (room || 'general').trim();
    const r = ensureRoom(room);
    socket.join(room);
    socket.data.username = username;
    socket.data.room = room;
    r.users.set(socket.id, username);

    // Send chat history and current users
    socket.emit('history', r.history);
    io.to(room).emit('users', Array.from(r.users.values()));

    // Announce join
    const systemMsg = { system: true, text: `${username} joined`, ts: Date.now() };
    r.history.push(systemMsg);
    if (r.history.length > 200) r.history.shift();
    socket.to(room).emit('message', systemMsg);
  });

  socket.on('message', (text) => {
    const username = socket.data.username || 'Anonymous';
    const room = socket.data.room || 'general';
    const r = ensureRoom(room);
    const msg = { username, text: String(text).slice(0, 2000), ts: Date.now() };
    r.history.push(msg);
    if (r.history.length > 200) r.history.shift();
    io.to(room).emit('message', msg);
  });

  socket.on('typing', (isTyping) => {
    const username = socket.data.username || 'Someone';
    const room = socket.data.room || 'general';
    socket.to(room).emit('typing', { username, isTyping: !!isTyping });
  });

  socket.on('disconnect', () => {
    const room = socket.data.room;
    const username = socket.data.username;
    if (!room) return;
    const r = ensureRoom(room);
    r.users.delete(socket.id);
    io.to(room).emit('users', Array.from(r.users.values()));
    const systemMsg = { system: true, text: `${username || 'Someone'} left`, ts: Date.now() };
    r.history.push(systemMsg);
    if (r.history.length > 200) r.history.shift();
    socket.to(room).emit('message', systemMsg);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
