import express from 'express';
import Product from '../models/Product.js';
import { authenticate } from '../middleware/auth.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { upload } from '../utils/cloudinary.js';
import axios from 'axios';

const router = express.Router();

// Initialize Gemini only if API key is available
const GEMINI_TEXT_MODEL = process.env.GEMINI_TEXT_MODEL || 'gemini-2.5-flash';
const GEMINI_VISION_MODEL = process.env.GEMINI_VISION_MODEL || GEMINI_TEXT_MODEL;

let genAI = null;
if (process.env.GEMINI_API_KEY) {
  try {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  } catch (error) {
    console.warn('Gemini AI initialization failed:', error.message);
  }
}

// Text search
router.get('/text', async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;

    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const products = await Product.find({
      $text: { $search: q },
      isActive: true
    })
      .populate('category', 'name slug')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Product.countDocuments({
      $text: { $search: q },
      isActive: true
    });

    res.json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
      query: q
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Visual search (image-based)
router.post('/visual', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Image is required' });
    }

    // Convert image to base64
    const imageBase64 = req.file.buffer.toString('base64');
    const imageData = {
      inlineData: {
        data: imageBase64,
        mimeType: req.file.mimetype
      }
    };

    // Use Gemini Vision API to analyze image
    let description = '';
    let keywords = '';
    
    if (!genAI) {
      // Fallback to basic search if Gemini is not available
      const products = await Product.find({ isActive: true })
        .populate('category', 'name slug')
        .limit(20);
      
      return res.json({
        products,
        description: 'Image analysis unavailable',
        keywords: '',
        total: products.length
      });
    }
    
    try {
      const model = genAI.getGenerativeModel({ model: GEMINI_VISION_MODEL });
      const prompt = "Describe this product in detail, including its type, color, style, and any distinctive features. Focus on what someone would search for to find a similar product.";

      const result = await model.generateContent([prompt, imageData]);
      description = result.response.text();

      // Extract keywords from description
      keywords = description.toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 3)
        .slice(0, 10)
        .join(' ');
    } catch (visionError) {
      console.error('Vision API error:', visionError);
      // Continue with empty keywords for fallback search
    }

    // Search products using extracted keywords
    let products = [];
    if (keywords) {
      products = await Product.find({
        $text: { $search: keywords },
        isActive: true
      })
        .populate('category', 'name slug')
        .limit(20);
    }
    
    // Fallback to all products if no keywords or no results
    if (products.length === 0) {
      products = await Product.find({ isActive: true })
        .populate('category', 'name slug')
        .limit(20);
    }

    res.json({
      products,
      description: description || 'Image analysis unavailable',
      keywords,
      total: products.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Voice search
router.post('/voice', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Audio file is required' });
    }

    // Convert audio to base64
    const audioBase64 = req.file.buffer.toString('base64');

    // Use Gemini to transcribe and understand voice query
    // Note: Gemini doesn't directly support audio, so we'd need a speech-to-text service
    // For now, we'll use a simple approach with Gemini's text understanding
    
    // In production, you'd use a speech-to-text API first, then process with Gemini
    // For demo purposes, we'll assume the audio is already transcribed
    // You can integrate with Google Speech-to-Text API or similar service

    if (!genAI) {
      // Fallback to basic search if Gemini is not available
      const products = await Product.find({ isActive: true })
        .populate('category', 'name slug')
        .limit(20);
      
      return res.json({
        products,
        query: req.body.transcription || 'product search',
        total: products.length
      });
    }

    const model = genAI.getGenerativeModel({ model: GEMINI_TEXT_MODEL });
    const prompt = `Extract the main search query from this voice transcription. Return only the key search terms: ${req.body.transcription || 'product search'}`;

    const result = await model.generateContent(prompt);
    const searchQuery = result.response.text().trim();

    // Search products
    const products = await Product.find({
      $text: { $search: searchQuery },
      isActive: true
    })
      .populate('category', 'name slug')
      .limit(20);

    res.json({
      products,
      query: searchQuery,
      total: products.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

