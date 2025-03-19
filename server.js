// server.js
const express = require('express');
const connectDB = require('./config/db');
const http = require('http');
const { Server } = require('socket.io');
const Category = require('./models/category.model');
require('dotenv').config();

const app = express();

// Create HTTP Server
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(express.json());

// Seed Default Categories
const seedCategories = async () => {
  const categories = ['Electrical', 'Plumbing', 'Carpentry', 'Painting'];
  try {
    for (const name of categories) {
      const existingCategory = await Category.findOne({ name });
      if (!existingCategory) {
        await new Category({ name }).save();
        console.log(`Category ${name} added.`);
      }
    }
  } catch (err) {
    console.error('Error seeding categories:', err.message);
  }
};

// Connect Database and Seed Categories
const startServer = async () => {
  await connectDB();
  await seedCategories();

  // Start Server after DB and Seeding
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

// Socket.io Connection for Chat and Notifications
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Chat Events
  socket.on('join_room', (room) => {
    socket.join(room);
    console.log(`User joined room: ${room}`);
  });

  socket.on('send_message', (data) => {
    io.to(data.room).emit('receive_message', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });

  // Notification Events
  socket.on('join_notifications', (userId) => {
    socket.join(userId);
    console.log(`User joined notifications room: ${userId}`);
  });

  socket.on('send_notification', (data) => {
    io.to(data.userId).emit('receive_notification', data);
  });
});

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/technicians', require('./routes/technician.routes'));
app.use('/api/addresses', require('./routes/address.routes'));
app.use('/api/categories', require('./routes/category.routes'));
app.use('/api/gigs', require('./routes/gig.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/quotes', require('./routes/quote.routes'));
app.use('/api/bookings', require('./routes/booking.routes'));
app.use('/api/chats', require('./routes/chat.routes'));
app.use('/api/reviews', require('./routes/review.routes'));
app.use('/api/notifications', require('./routes/notification.routes'));

// Serve Static Files
app.use('/uploads', express.static('uploads'));

// Start the Server
startServer();