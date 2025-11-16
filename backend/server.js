// IMPORTANT: Load environment variables FIRST before any other imports
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env file from backend directory BEFORE any other imports
const envResult = dotenv.config({ path: join(__dirname, '.env') });

if (envResult.error) {
  console.warn('⚠️ Warning: Could not load .env file:', envResult.error.message);
} else {
  console.log('✅ Environment variables loaded from .env file');
  // Debug: Show key env vars are loaded
  console.log('   MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Missing');
  console.log('   EMAIL_USER:', process.env.EMAIL_USER ? 'Set' : 'Missing');
  console.log('   GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'Set' : 'Missing');
}

// Now import other modules AFTER env vars are loaded
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import productRoutes from './routes/product.js';
import categoryRoutes from './routes/category.js';
import orderRoutes from './routes/order.js';
import searchRoutes from './routes/search.js';
import chatbotRoutes from './routes/chatbot.js';
import notificationRoutes from './routes/notification.js';
import adminRoutes from './routes/admin.js';
import recommendationRoutes from './routes/recommendation.js';
import product3dRoutes from './routes/product3d.js';
import couponRoutes from './routes/coupon.js';

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/product3d', product3dRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/coupons', couponRoutes);

// Socket.io for real-time features
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', (userId) => {
    socket.join(`user-${userId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Make io available to routes
app.set('io', io);

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in .env file');
  console.error('Please create a .env file in the backend directory with MONGODB_URI');
  console.error('You can copy .env.example to .env and update the values');
  process.exit(1);
}

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => {
    console.error('❌ MongoDB Error:', err.message);
    process.exit(1);
  });

const PORT = process.env.PORT || 4000;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { io };

