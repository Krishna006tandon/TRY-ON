import express from 'express';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Category from '../models/Category.js';
import Notification from '../models/Notification.js';
import { authenticate, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// All routes require admin authentication
router.use(authenticate);
router.use(isAdmin);

// Dashboard stats
router.get('/dashboard', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments({ isActive: true });
    const totalOrders = await Order.countDocuments();
    const totalRevenueResult = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$finalAmount' } } }
    ]);
    const totalRevenue = totalRevenueResult[0]?.total || 0;

    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .populate('items.product', 'name images')
      .sort('-createdAt')
      .limit(10)
      .lean();

    const topProductsResult = await Product.aggregate([
      { $match: { isActive: true } },
      { $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'items.product',
          as: 'orders'
        }
      },
      { $unwind: { path: '$orders', preserveNullAndEmptyArrays: true } },
      { $unwind: { path: '$orders.items', preserveNullAndEmptyArrays: true } },
      { $match: { 'orders.items.product': { $exists: true } } },
      { $group: {
          _id: '$_id',
          name: { $first: '$name' },
          totalSold: { $sum: '$orders.items.quantity' },
          revenue: { $sum: { $multiply: ['$orders.items.price', '$orders.items.quantity'] } }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      stats: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue
      },
      recentOrders,
      topProducts: topProductsResult
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// User management
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const users = await User.find()
      .select('-password -otp')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort('-createdAt');

    const total = await User.countDocuments();

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password -otp');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user, message: 'User role updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Analytics
router.get('/analytics', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const matchStage = {};

    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = new Date(startDate);
      if (endDate) matchStage.createdAt.$lte = new Date(endDate);
    }

    const salesData = await Order.aggregate([
      { $match: { ...matchStage, status: { $ne: 'cancelled' } } },
      { $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          totalSales: { $sum: '$finalAmount' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const categorySales = await Order.aggregate([
      { $match: { ...matchStage, status: { $ne: 'cancelled' } } },
      { $unwind: '$items' },
      { $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      { $lookup: {
          from: 'categories',
          localField: 'product.category',
          foreignField: '_id',
          as: 'category'
        }
      },
      { $unwind: '$category' },
      { $group: {
          _id: '$category.name',
          totalSales: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { totalSales: -1 } }
    ]);

    res.json({
      salesData,
      categorySales
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Send notification to all users
router.post('/notifications/broadcast', async (req, res) => {
  try {
    const { title, message, type = 'system' } = req.body;

    const users = await User.find();
    const notifications = users.map(user => ({
      user: user._id,
      title,
      message,
      type
    }));

    await Notification.insertMany(notifications);

    // Emit socket event to all users
    const io = req.app.get('io');
    if (io) {
      io.emit('notification', { title, message, type });
    }

    res.json({ message: 'Notification broadcasted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

