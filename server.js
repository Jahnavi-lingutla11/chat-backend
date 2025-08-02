const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Message = require('./models/Message');
const messageRoutes = require('./routes/messages');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Base Route
app.get('/', (req, res) => {
  res.send('💬 Chat API is running...');
});

// Routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes); // ✅ Message history endpoint

// HTTP Server + Socket.IO setup
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log('🟢 User connected:', socket.id);

  // Join
  socket.on('join', (username) => {
    onlineUsers.set(socket.id, username);
    io.emit('online users', Array.from(onlineUsers.values()));
  });

  // Typing events
  socket.on('typing', (data) => {
    socket.broadcast.emit('typing', data);
  });

  socket.on('stop typing', (data) => {
    socket.broadcast.emit('stop typing', data);
  });

  // Chat message
  socket.on('chat message', (msg) => {
  const savedMessage = new Message({
    text: msg.text,
    sender: msg.sender,
    timestamp: new Date()
  });

  // Emit immediately (faster experience)
  io.emit('chat message', savedMessage);

  // Save in background (non-blocking)
  savedMessage.save().catch((err) =>
    console.error('❌ Error saving message:', err.message)
  );
});


  // Disconnect
  socket.on('disconnect', () => {
    console.log('🔴 User disconnected:', socket.id);
    onlineUsers.delete(socket.id);
    io.emit('online users', Array.from(onlineUsers.values()));
  });
});

// Connect to MongoDB and start server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
  });
