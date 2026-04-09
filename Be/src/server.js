import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { connectDB } from './config/db.js';

// Routes
import orderRoutes from './routes/orderRoutes.js';
import menuRoutes from './routes/menuRoutes.js';
import tableRoutes from './routes/tableRoutes.js';
import adminAuthRoutes from './routes/adminAuthRoutes.js';
import adminOrderRoutes from './routes/adminOrderRoutes.js';
import adminTableRoutes from './routes/adminTableRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import takeawayRoutes from './routes/takeawayRoutes.js';

// Khởi tạo Database MongoDB
connectDB();

const app = express();
const httpServer = createServer(app);

// Setup Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: '*', // In production, replace with your frontend URL
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// Middleware to inject the Socket.io instance into requests
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`User connected to socket: ${socket.id}`);

  socket.on('join_admin', () => {
    socket.join('admin');
    console.log(`Socket ${socket.id} joined the 'admin' room`);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// ========== Public Routes ==========
app.use('/api/v1/orders', orderRoutes);         // Dine-in ordering (table session)
app.use('/api/v1/menu', menuRoutes);             // Menu browsing
app.use('/api/v1/tables', tableRoutes);          // QR scan
app.use('/api/v1/takeaway', takeawayRoutes);     // Takeaway/Delivery ordering

// ========== Admin Routes ==========
app.use('/api/v1/admin/auth', adminAuthRoutes);       // Login/Register
app.use('/api/v1/admin/orders', adminOrderRoutes);    // Order management
app.use('/api/v1/admin/tables', adminTableRoutes);    // Table management
app.use('/api/v1/admin/payments', paymentRoutes);     // Payment management

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
