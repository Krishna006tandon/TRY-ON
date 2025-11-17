import express from 'express';
import Product from '../models/Product.js';
import { authenticate, isAdmin } from '../middleware/auth.js';
import { upload, uploadToCloudinary } from '../utils/cloudinary.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Get all products
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, category, search, minPrice, maxPrice, sort = '-createdAt' } = req.query;
    const query = { isActive: true };

    if (category) query.category = category;
    if (search) {
      query.$text = { $search: search };
    }
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const products = await Product.find(query)
      .populate('category', 'name slug')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Product.countDocuments(query);

    res.json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get featured products
router.get('/featured', async (req, res) => {
  try {
    let products = await Product.find({ isFeatured: true, isActive: true })
      .populate('category', 'name slug')
      .limit(10)
      .sort('-createdAt')
      .lean();

    // If no featured products, return regular products
    if (!products || products.length === 0) {
      products = await Product.find({ isActive: true })
        .populate('category', 'name slug')
        .limit(10)
        .sort('-createdAt')
        .lean();
    }

    // Ensure products is always an array
    if (!Array.isArray(products)) {
      products = [];
    }

    res.json({ products });
  } catch (error) {
    console.error('Featured products error:', error);
    // Return empty array instead of error
    res.json({ products: [] });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category')
      .populate('reviews.user', 'name avatar');

    if (!product || !product.isActive) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create product (Admin only)
router.post('/', authenticate, isAdmin, [
  body('name').notEmpty().withMessage('Name is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('category').notEmpty().withMessage('Category is required'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const product = new Product(req.body);
    await product.save();

    res.status(201).json({ product, message: 'Product created successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update product (Admin only)
router.put('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ product, message: 'Product updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Upload product images (Admin only)
router.post('/:id/images', authenticate, isAdmin, upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No images uploaded' });
    }

    // Check if product exists
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const uploadPromises = req.files.map(file => 
      uploadToCloudinary(file.buffer, 'tryon/products')
    );
    const results = await Promise.all(uploadPromises);

    const images = results.map(result => ({
      url: result.secure_url,
      publicId: result.public_id
    }));

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { $push: { images: { $each: images } } },
      { new: true }
    );

    // Automatically trigger 3D model generation if product has images and 3D generation is enabled
    if (updatedProduct && updatedProduct.images && updatedProduct.images.length > 0) {
      try {
        const { generate3DModel } = await import('../utils/masterpiece.js');
        
        // Only generate if not already processing or completed
        if (!updatedProduct.model3d || (updatedProduct.model3d.status !== 'processing' && updatedProduct.model3d.status !== 'completed')) {
          // Start 3D generation in background (don't wait for it)
          const imageUrl = updatedProduct.images[0].url;
          
          updatedProduct.model3d = {
            status: 'processing',
            masterpieceId: null
          };
          await updatedProduct.save();

          generate3DModel(imageUrl, updatedProduct._id.toString())
            .then(async (result) => {
              const productToUpdate = await Product.findById(updatedProduct._id);
              if (productToUpdate) {
                productToUpdate.model3d = {
                  status: 'completed',
                  masterpieceId: result.generationId,
                  url: result.modelUrl
                };
                await productToUpdate.save();
              }
            })
            .catch(async (error) => {
              console.error('3D Generation Error:', error);
              const productToUpdate = await Product.findById(updatedProduct._id);
              if (productToUpdate) {
                productToUpdate.model3d = {
                  status: 'failed',
                  masterpieceId: null,
                  error: error.message
                };
                await productToUpdate.save();
              }
            });
        }
      } catch (modelError) {
        console.error('3D model generation setup error:', modelError);
        // Don't fail image upload if 3D generation setup fails
      }
    }

    res.json({ product: updatedProduct, message: 'Images uploaded successfully. 3D model generation started automatically.' });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ message: error.message || 'Failed to upload images' });
  }
});

// Add review
router.post('/:id/reviews', authenticate, [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.reviews.push({
      user: req.user._id,
      rating,
      comment
    });

    // Update average rating
    const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0);
    product.ratings.average = totalRating / product.reviews.length;
    product.ratings.count = product.reviews.length;

    await product.save();

    res.json({ product, message: 'Review added successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete product (Admin only)
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

