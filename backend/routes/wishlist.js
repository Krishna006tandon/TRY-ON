import express from 'express';
import Wishlist from '../models/Wishlist.js';
import Product from '../models/Product.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get user's wishlist
router.get('/', authenticate, async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id })
      .populate('products.product', 'name price images category isActive originalPrice');

    if (!wishlist) {
      wishlist = new Wishlist({ user: req.user._id, products: [] });
      await wishlist.save();
    }

    // Filter out inactive products
    wishlist.products = wishlist.products.filter(
      item => item.product && item.product.isActive
    );

    res.json({ wishlist });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add product to wishlist
router.post('/:productId', authenticate, async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    let wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      wishlist = new Wishlist({ user: req.user._id, products: [] });
    }

    // Check if product already in wishlist
    const existingProduct = wishlist.products.find(
      item => item.product.toString() === productId
    );

    if (existingProduct) {
      return res.status(400).json({ message: 'Product already in wishlist' });
    }

    wishlist.products.push({ product: productId });
    await wishlist.save();

    await wishlist.populate('products.product', 'name price images category');

    res.json({ 
      message: 'Product added to wishlist',
      wishlist 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Remove product from wishlist
router.delete('/:productId', authenticate, async (req, res) => {
  try {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    wishlist.products = wishlist.products.filter(
      item => item.product.toString() !== productId
    );

    await wishlist.save();

    await wishlist.populate('products.product', 'name price images category');

    res.json({ 
      message: 'Product removed from wishlist',
      wishlist 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Check if product is in wishlist
router.get('/check/:productId', authenticate, async (req, res) => {
  try {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      return res.json({ isInWishlist: false });
    }

    const isInWishlist = wishlist.products.some(
      item => item.product.toString() === productId
    );

    res.json({ isInWishlist });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

