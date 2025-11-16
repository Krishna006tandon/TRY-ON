import express from 'express';
import Category from '../models/Category.js';
import { authenticate, isAdmin } from '../middleware/auth.js';
import { upload, uploadToCloudinary } from '../utils/cloudinary.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .populate('parent', 'name slug')
      .sort('name');

    res.json({ categories });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single category
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)
      .populate('parent', 'name slug');

    if (!category || !category.isActive) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json({ category });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create category (Admin only)
router.post('/', authenticate, isAdmin, [
  body('name').notEmpty().withMessage('Name is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const category = new Category(req.body);
    await category.save();

    res.status(201).json({ category, message: 'Category created successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update category (Admin only)
router.put('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json({ category, message: 'Category updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Upload category image (Admin only)
router.post('/:id/image', authenticate, isAdmin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }

    const result = await uploadToCloudinary(req.file.buffer, 'tryon/categories');
    
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { 
        image: {
          url: result.secure_url,
          publicId: result.public_id
        }
      },
      { new: true }
    );

    res.json({ category, message: 'Image uploaded successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete category (Admin only)
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

