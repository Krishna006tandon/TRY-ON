import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { authenticate } from '../middleware/auth.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

const router = express.Router();

// Initialize Gemini only if API key is available
// Use lazy initialization to ensure env vars are loaded
let genAI = null;
let genAIInitialized = false;

function initializeGemini() {
  if (genAIInitialized) return genAI;
  
  genAIInitialized = true;
  
  if (process.env.GEMINI_API_KEY) {
    try {
      genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      console.log('✅ Gemini AI initialized');
    } catch (error) {
      console.warn('⚠️ Gemini AI initialization failed:', error.message);
      genAI = null;
    }
  } else {
    console.warn('⚠️ GEMINI_API_KEY not found. Chatbot features will be disabled.');
    console.log('   GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'Set (' + process.env.GEMINI_API_KEY.substring(0, 15) + '...)' : 'Missing');
  }
  
  return genAI;
}

// Don't initialize at module load - wait until first use
// This ensures dotenv.config() has run first

// Chatbot endpoint
router.post('/', authenticate, async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    // Ensure Gemini is initialized
    const geminiAI = initializeGemini();
    
    if (!geminiAI) {
      return res.status(503).json({ 
        message: 'Chatbot service is currently unavailable. Please configure GEMINI_API_KEY in your environment variables.' 
      });
    }

    const model = geminiAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Get user context
    const userOrders = await Order.find({ user: req.user._id })
      .populate('items.product', 'name')
      .limit(5)
      .sort('-createdAt');

    const recentProducts = await Product.find({ isActive: true })
      .limit(10)
      .select('name description price');

    // Build context for the chatbot
    const context = `
You are a helpful shopping assistant for TRY-ON, an e-commerce platform.

User Information:
- Name: ${req.user.name}
- Email: ${req.user.email}
- Reward Points: ${req.user.rewardPoints}

Recent Orders: ${userOrders.length > 0 ? userOrders.map(o => `Order #${o._id} - ${o.items.length} items`).join(', ') : 'No recent orders'}

Available Products: ${recentProducts.map(p => `${p.name} - $${p.price}`).join(', ')}

Your role is to:
1. Help users find products
2. Answer questions about orders
3. Provide product recommendations
4. Assist with account-related queries
5. Be friendly and helpful

Conversation History:
${conversationHistory.map((msg, i) => `${i % 2 === 0 ? 'User' : 'Assistant'}: ${msg.content}`).join('\n')}

User: ${message}
Assistant:`;

    const result = await model.generateContent(context);
    const response = result.response.text();

    // Check if user is asking about products
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('product') || lowerMessage.includes('buy') || lowerMessage.includes('show')) {
      // Try to extract product search terms
      const searchTerms = message.split(/\s+/).filter(word => 
        !['show', 'me', 'find', 'search', 'for', 'product', 'products', 'buy', 'want'].includes(word.toLowerCase())
      ).join(' ');

      if (searchTerms) {
        const products = await Product.find({
          $text: { $search: searchTerms },
          isActive: true
        })
          .limit(5)
          .select('name price images category')
          .populate('category', 'name');

        if (products.length > 0) {
          return res.json({
            response,
            suggestions: products.map(p => ({
              id: p._id,
              name: p.name,
              price: p.price,
              image: p.images[0]?.url,
              category: p.category?.name
            }))
          });
        }
      }
    }

    res.json({ response });
  } catch (error) {
    console.error('Chatbot error:', error);
    // Return a helpful error message instead of crashing
    res.status(500).json({ 
      message: error.message || 'Sorry, I encountered an error. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

export default router;

