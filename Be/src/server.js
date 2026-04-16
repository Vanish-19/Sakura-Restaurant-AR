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
import adminFoodRoutes from './routes/adminFoodRoutes.js';
import adminFoodCategoryRoutes from './routes/adminFoodCategoryRoutes.js';
import adminArticleRoutes from './routes/adminArticleRoutes.js';
import adminUserRoutes from './routes/adminUserRoutes.js';
import adminAccountRoutes from './routes/adminAccountRoutes.js';
import adminDashboardRoutes from './routes/adminDashboardRoutes.js';
import userAuthRoutes from './routes/userAuthRoutes.js';
import userOrderRoutes from './routes/userOrderRoutes.js';
import { handleSepayWebhookEvent, buildSepayReturnRedirectUrl } from './services/sepayPaymentService.js';
import { ensureJwtConfig } from './services/tokenService.js';

// Khởi tạo Database MongoDB
connectDB();
ensureJwtConfig();

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

// Middleware to inject the Socket.io instance into requests
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use(express.json());

app.get('/api/v1/payments/sepay/return', async (req, res) => {
  try {
    const redirectUrl = buildSepayReturnRedirectUrl(req.query);
    return res.redirect(302, redirectUrl);
  } catch (error) {
    console.error('SePay return error:', error.message);
    return res.redirect(302, 'http://localhost:5173/cart?payment=cancelled');
  }
});

app.post('/api/v1/payments/sepay/webhook', async (req, res) => {
  try {
    const authorization = req.headers.authorization || '';
    const result = await handleSepayWebhookEvent(req.body || {}, authorization);

    if (req.io && result?.payment) {
      req.io.to('admin').emit('payment_completed', result.payment);
    }

    return res.status(result.handled ? 200 : 400).json({
      success: Boolean(result.handled),
      code: result.rspCode || '00',
      message: result.message || 'Confirm Success',
    });
  } catch (error) {
    console.error('SePay webhook error:', error.message);
    return res.status(200).json({ success: false, code: '99', message: error.message || 'Unknown error' });
  }
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
app.use('/api/v1/auth', userAuthRoutes);         // Customer auth
app.use('/api/v1/user/orders', userOrderRoutes); // Customer order history

// ========== Admin Routes ==========
app.use('/api/v1/admin/auth', adminAuthRoutes);       // Login/Register
app.use('/api/v1/admin/orders', adminOrderRoutes);    // Order management
app.use('/api/v1/admin/tables', adminTableRoutes);    // Table management
app.use('/api/v1/admin/payments', paymentRoutes);     // Payment management
app.use('/api/v1/admin/foods', adminFoodRoutes);      // Food/Menu management
app.use('/api/v1/admin/food-categories', adminFoodCategoryRoutes); // Food category management
app.use('/api/v1/admin/articles', adminArticleRoutes); // Content management
app.use('/api/v1/admin/users', adminUserRoutes);      // Customer management
app.use('/api/v1/admin/accounts', adminAccountRoutes);   // Admin account management
app.use('/api/v1/admin/dashboard', adminDashboardRoutes); // Dashboard stats

app.use((error, _req, res, _next) => {
  const status = Number(error?.status || error?.statusCode || 500);
  const message = error?.message || 'Internal Server Error';

  if (status >= 500) {
    console.error('Unhandled error:', message);
  }

  return res.status(status).json({
    success: false,
    error: message,
    message,
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
