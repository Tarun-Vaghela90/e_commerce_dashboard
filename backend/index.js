const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./models/Users');
const socketIO = require('socket.io');
const userRoutes = require('./routes/User'); // Your route file
const  productRoutes = require("./routes/Product")
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = socketIO(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

// 🔧 Fix: Make io globally accessible in routes
app.set('io', io);
// Middleware
app.use(cors());
app.use(express.json());

// Inject io into request for routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Mount routes
app.use('/users/api', userRoutes);
app.use('/products/api', productRoutes);

// MongoDB Connection
mongoose.connect('mongodb://127.0.0.1:27017/e_commerce', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Store connected users: Map<userId, socketId>
const connectedUsers = new Map(); // ✅ New: Map<userId, { socketId, realtimeEnabled }>
app.set('connectedUsers', connectedUsers); // ✅ expose it for routes


// Socket.IO handlers
io.on('connection', (socket) => {
  console.log('🟢 Socket connected:', socket.id);

  socket.on('user-connected', async (userId) => {
    try {
      const user = await User.findById(userId);
      if (!user) return;

      connectedUsers.set(userId.toString(), {
        socketId: socket.id,
        realtimeEnabled: user.realtimeEnabled === true
      });

      console.log('✅ User connected:', userId, 'Realtime:', user.realtimeEnabled);

      // You can emit this to admin if needed
      io.emit('connected-users', Array.from(connectedUsers.keys()));
    } catch (err) {
      console.error('Error fetching user in socket:', err.message);
    }
  });

  socket.on('disconnect', () => {
    for (const [userId, data] of connectedUsers.entries()) {
      if (data.socketId === socket.id) {
        connectedUsers.delete(userId);
        console.log('🔴 User disconnected:', userId);
        break;
      }
    }
    io.emit('connected-users', Array.from(connectedUsers.keys()));
  });
});


// Start server
const PORT = 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
