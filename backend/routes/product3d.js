import express from 'express';
import Product from '../models/Product.js';
import { authenticate, isAdmin } from '../middleware/auth.js';
import { generate3DModel, checkGenerationStatus } from '../utils/masterpiece.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';

const router = express.Router();

// Generate 3D model for a product
router.post('/:productId/generate', authenticate, isAdmin, async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (!product.images || product.images.length === 0) {
      return res.status(400).json({ message: 'Product must have at least one image' });
    }

    // Update product status
    product.model3d = {
      status: 'processing',
      masterpieceId: null
    };
    await product.save();

    // Start 3D generation in background
    const imageUrl = product.images[0].url;
    
    generate3DModel(imageUrl, productId)
      .then(async (result) => {
        product.model3d = {
          status: 'completed',
          masterpieceId: result.generationId,
          url: result.modelUrl
        };
        await product.save();
      })
      .catch(async (error) => {
        console.error('3D Generation Error:', error);
        product.model3d = {
          status: 'failed',
          masterpieceId: null,
          error: error.message
        };
        await product.save();
      });

    res.json({
      message: '3D model generation started',
      productId,
      status: 'processing'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Check 3D model generation status
router.get('/:productId/status', async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId).select('model3d');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (!product.model3d || !product.model3d.masterpieceId) {
      return res.json({
        status: product.model3d?.status || 'pending',
        modelUrl: null
      });
    }

    // Check status from Masterpiece X API
    try {
      const status = await checkGenerationStatus(product.model3d.masterpieceId);
      
      // Update product if status changed
      if (status.status === 'completed' && status.modelUrl) {
        product.model3d = {
          status: 'completed',
          masterpieceId: product.model3d.masterpieceId,
          url: status.modelUrl
        };
        await product.save();
      } else if (status.status === 'failed') {
        product.model3d.status = 'failed';
        await product.save();
      }

      res.json({
        status: product.model3d.status,
        modelUrl: product.model3d.url || null
      });
    } catch (apiError) {
      // Return current status from database if API check fails
      res.json({
        status: product.model3d.status,
        modelUrl: product.model3d.url || null
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get 3D model URL for a product
router.get('/:productId/model', async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId).select('model3d name');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (!product.model3d || product.model3d.status !== 'completed') {
      return res.status(404).json({ 
        message: '3D model not available',
        status: product.model3d?.status || 'pending'
      });
    }

    res.json({
      modelUrl: product.model3d.url,
      status: product.model3d.status,
      productName: product.name
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

