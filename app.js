const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // your frontend URL
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('a user connected:', socket.id);

  socket.on('chat message', (msg) => {
    // Broadcast to all clients including sender
    io.emit('chat message', msg);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
