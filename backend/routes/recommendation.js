import express from 'express';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = express.Router();
const GEMINI_TEXT_MODEL = process.env.GEMINI_TEXT_MODEL || 'gemini-2.5-flash';

// Initialize Gemini only if API key is available
let genAI = null;
if (process.env.GEMINI_API_KEY) {
  try {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  } catch (error) {
    console.warn('Gemini AI initialization failed:', error.message);
  }
}

// Get personalized recommendations (optional auth - returns featured if not authenticated)
router.get('/personalized', async (req, res) => {
  try {
    // If user is not authenticated, return featured products
    if (!req.headers.authorization) {
      const featuredProducts = await Product.find({ isFeatured: true, isActive: true })
        .populate('category', 'name slug')
        .limit(10)
        .sort('-createdAt')
        .lean();
      
      return res.json({ products: featuredProducts || [] });
    }

    // Try to authenticate, but don't fail if token is invalid
    let user = null;
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (token) {
        const jwt = await import('jsonwebtoken');
        const decoded = jwt.default.verify(token, process.env.JWT_SECRET);
        const UserModel = await import('../models/User.js');
        user = await UserModel.default.findById(decoded.userId).select('-password');
      }
    } catch (authError) {
      // If auth fails, return featured products
      const featuredProducts = await Product.find({ isFeatured: true, isActive: true })
        .populate('category', 'name slug')
        .limit(10)
        .sort('-createdAt')
        .lean();
      
      return res.json({ products: featuredProducts || [] });
    }

    if (!user) {
      const featuredProducts = await Product.find({ isFeatured: true, isActive: true })
        .populate('category', 'name slug')
        .limit(10)
        .sort('-createdAt')
        .lean();
      
      return res.json({ products: featuredProducts || [] });
    }

    // Get user's order history
    const userOrders = await Order.find({ user: user._id })
      .populate('items.product', 'name category tags')
      .limit(10);

    // Extract categories and tags from order history
    const categories = new Set();
    const tags = new Set();

    userOrders.forEach(order => {
      order.items.forEach(item => {
        if (item.product?.category) {
          categories.add(item.product.category.toString());
        }
        if (item.product?.tags) {
          item.product.tags.forEach(tag => tags.add(tag));
        }
      });
    });

    // Get recommended products based on user's preferences
    let recommendedProducts = [];

    if (categories.size > 0) {
      recommendedProducts = await Product.find({
        category: { $in: Array.from(categories) },
        isActive: true,
        _id: { $nin: userOrders.flatMap(o => o.items.map(i => i.product._id)) }
      })
        .populate('category', 'name slug')
        .limit(10)
        .sort('-ratings.average');
    }

    // If not enough recommendations, add featured products
    if (recommendedProducts.length < 10) {
      const featured = await Product.find({
        isFeatured: true,
        isActive: true,
        _id: { $nin: recommendedProducts.map(p => p._id) }
      })
        .populate('category', 'name slug')
        .limit(10 - recommendedProducts.length);

      recommendedProducts = [...recommendedProducts, ...featured];
    }

    res.json({ products: recommendedProducts });
  } catch (error) {
    console.error('Recommendations error:', error);
    // Return featured products as fallback
    try {
      const featuredProducts = await Product.find({ isFeatured: true, isActive: true })
        .populate('category', 'name slug')
        .limit(10)
        .sort('-createdAt')
        .lean();
      
      res.json({ products: featuredProducts || [] });
    } catch (fallbackError) {
      res.json({ products: [] });
    }
  }
});

// Get AI-powered recommendations
router.get('/ai', authenticate, async (req, res) => {
  try {
    if (!genAI) {
      // Fallback to personalized recommendations if Gemini is not available
      const featuredProducts = await Product.find({ isFeatured: true, isActive: true })
        .populate('category', 'name slug')
        .limit(10)
        .sort('-createdAt')
        .lean();
      
      return res.json({ products: featuredProducts || [] });
    }

    const userOrders = await Order.find({ user: req.user._id })
      .populate('items.product', 'name description category tags')
      .limit(5);

    const allProducts = await Product.find({ isActive: true })
      .populate('category', 'name')
      .limit(50)
      .select('name description price category tags ratings');

    const model = genAI.getGenerativeModel({ model: GEMINI_TEXT_MODEL });

    const prompt = `
Based on the user's order history, recommend 5 products they might like.

User's Order History:
${userOrders.map(o => 
  o.items.map(i => `- ${i.product?.name || 'Product'}`).join('\n')
).join('\n')}

Available Products:
${allProducts.map(p => `- ${p.name}: ${p.description?.substring(0, 100)}... ($${p.price})`).join('\n')}

Return a JSON array of product names that would be good recommendations. Format: ["Product Name 1", "Product Name 2", ...]
`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    // Extract product names from response
    const productNames = response.match(/"([^"]+)"/g)?.map(name => name.replace(/"/g, '')) || [];

    const recommendedProducts = await Product.find({
      name: { $in: productNames },
      isActive: true
    })
      .populate('category', 'name slug')
      .limit(5);

    res.json({ products: recommendedProducts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get personalized offers
router.get('/offers', authenticate, async (req, res) => {
  try {
    // Get user's reward points
    const user = await User.findById(req.user._id);
    
    // Generate personalized offers based on user activity
    const offers = [
      {
        id: 1,
        title: 'Welcome Bonus',
        description: 'Get 10% off on your first order',
        discount: 10,
        type: 'percentage',
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    ];

    if (user.rewardPoints > 100) {
      offers.push({
        id: 2,
        title: 'Reward Points Bonus',
        description: `Use your ${user.rewardPoints} reward points for extra savings`,
        discount: Math.min(user.rewardPoints * 0.01, 50),
        type: 'points',
        validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
      });
    }

    res.json({ offers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

