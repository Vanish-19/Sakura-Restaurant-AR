import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
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
import careerApplicationRoutes from './routes/careerApplicationRoutes.js';
import staticPageContentRoutes from './routes/staticPageContentRoutes.js';
import articleRoutes from './routes/articleRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import { handleSepayWebhookEvent, buildSepayReturnRedirectUrl } from './services/sepayPaymentService.js';
import { ensureJwtConfig } from './services/tokenService.js';

// Khởi tạo Database MongoDB
connectDB();
ensureJwtConfig();

const app = express();
app.set('trust proxy', 1);
const httpServer = createServer(app);

function normalizeOrigin(origin) {
  return String(origin || '').trim().replace(/\/$/, '');
}

function getAllowedOrigins() {
  const configured = [
    process.env.FRONTEND_URL,
    ...(process.env.CORS_ORIGINS || '').split(','),
  ]
    .map(normalizeOrigin)
    .filter(Boolean);

  if (process.env.NODE_ENV !== 'production') {
    configured.push(
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:4173',
      'http://127.0.0.1:4173',
    );
  }

  return [...new Set(configured)];
}

const allowedOrigins = getAllowedOrigins();

function isOriginAllowed(origin) {
  if (!origin) return true;
  if (allowedOrigins.includes('*')) return true;
  return allowedOrigins.includes(normalizeOrigin(origin));
}

const corsOptions = {
  credentials: true,
  origin(origin, callback) {
    if (isOriginAllowed(origin)) return callback(null, true);
    return callback(new Error('CORS origin not allowed'), false);
  },
};

function buildLimiter({ windowMs, limit, message }) {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: {
      success: false,
      error: message,
      message,
    },
  });
}

const authLimiter = buildLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  message: 'Too many authentication attempts. Please try again later.',
});

const orderLimiter = buildLimiter({
  windowMs: 5 * 60 * 1000,
  limit: 80,
  message: 'Too many order requests. Please slow down.',
});

const uploadLimiter = buildLimiter({
  windowMs: 60 * 60 * 1000,
  limit: 30,
  message: 'Too many upload requests. Please try again later.',
});

const webhookLimiter = buildLimiter({
  windowMs: 60 * 1000,
  limit: 120,
  message: 'Too many webhook requests.',
});

// Setup Socket.io
const io = new Server(httpServer, {
  cors: {
    ...corsOptions,
    methods: ['GET', 'POST'],
  }
});

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors(corsOptions));

// Middleware to inject the Socket.io instance into requests
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

app.use('/api/v1/auth', authLimiter);
app.use('/api/v1/admin/auth', authLimiter);
app.use('/api/v1/tables/scan', orderLimiter);
app.use('/api/v1/orders', orderLimiter);
app.use('/api/v1/takeaway/orders', orderLimiter);
app.use('/api/v1/careers/applications', uploadLimiter);
app.use('/api/v1/admin/foods/upload-model', uploadLimiter);
app.use('/api/v1/payments/sepay/webhook', webhookLimiter);

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
app.use('/api/v1/careers', careerApplicationRoutes); // Career applications
app.use('/api/v1/static-pages', staticPageContentRoutes); // Static page content
app.use('/api/v1/articles', articleRoutes);      // Public blog articles
app.use('/api/v1/chat', chatRoutes);             // Chatbot AI

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
  let status = Number(error?.status || error?.statusCode || 500);
  let message = error?.message || 'Internal Server Error';
  let code = error?.code || 'INTERNAL_ERROR';
  let details = error?.details;

  if (message === 'CORS origin not allowed') {
    status = 403;
    code = 'CORS_ORIGIN_NOT_ALLOWED';
  }

  if (error?.name === 'CastError') {
    status = 400;
    code = 'INVALID_ID';
    message = 'Invalid resource id';
  }

  if (error?.name === 'ValidationError') {
    status = 400;
    code = 'VALIDATION_ERROR';
    details = Object.values(error.errors || {}).map((item) => item.message);
  }

  if (error?.code === 11000) {
    status = 409;
    code = 'DUPLICATE_KEY';
    message = 'Duplicate resource';
    details = error.keyValue;
  }

  if (status >= 500) {
    console.error('Unhandled error:', message, error?.stack || '');
  }

  return res.status(status).json({
    success: false,
    code,
    error: message,
    message,
    ...(details ? { details } : {}),
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
