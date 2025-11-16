import express from 'express';
import Coupon from '../models/Coupon.js';
import { authenticate, isAdmin } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Get all coupons (Admin only)
router.get('/admin', authenticate, isAdmin, async (req, res) => {
  try {
    const coupons = await Coupon.find()
      .populate('applicableCategories', 'name')
      .populate('applicableProducts', 'name')
      .sort('-createdAt');
    
    res.json({ coupons });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create coupon (Admin only)
router.post('/admin', authenticate, isAdmin, [
  body('code').notEmpty().withMessage('Code is required'),
  body('discountType').isIn(['percentage', 'fixed']).withMessage('Invalid discount type'),
  body('discountValue').isNumeric().withMessage('Discount value must be a number'),
  body('validFrom').isISO8601().withMessage('Valid from must be a valid date'),
  body('validUntil').isISO8601().withMessage('Valid until must be a valid date')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const coupon = new Coupon(req.body);
    await coupon.save();

    res.status(201).json({ coupon, message: 'Coupon created successfully' });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Coupon code already exists' });
    }
    res.status(500).json({ message: error.message });
  }
});

// Update coupon (Admin only)
router.put('/admin/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    res.json({ coupon, message: 'Coupon updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete coupon (Admin only)
router.delete('/admin/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);

    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    res.json({ message: 'Coupon deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Validate coupon (Public - for checkout)
router.post('/validate', async (req, res) => {
  try {
    const { code, totalAmount, userId, items } = req.body;

    if (!code) {
      return res.status(400).json({ message: 'Coupon code is required' });
    }

    const coupon = await Coupon.findOne({ 
      code: code.toUpperCase(),
      isActive: true
    });

    if (!coupon) {
      return res.status(404).json({ message: 'Invalid coupon code' });
    }

    // Check validity dates
    const now = new Date();
    if (now < coupon.validFrom || now > coupon.validUntil) {
      return res.status(400).json({ message: 'Coupon has expired or is not yet valid' });
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ message: 'Coupon usage limit reached' });
    }

    // Check minimum purchase
    if (totalAmount < coupon.minPurchase) {
      return res.status(400).json({ 
        message: `Minimum purchase of $${coupon.minPurchase} required` 
      });
    }

    // Check if coupon applies to items
    if (coupon.applicableCategories.length > 0 || coupon.applicableProducts.length > 0) {
      const itemCategories = items?.map(item => item.product?.category) || [];
      const itemProductIds = items?.map(item => item.product?._id || item.product) || [];
      
      const categoryMatch = coupon.applicableCategories.some(catId => 
        itemCategories.some(itemCat => 
          itemCat?.toString() === catId.toString() || itemCat?._id?.toString() === catId.toString()
        )
      );
      
      const productMatch = coupon.applicableProducts.some(prodId =>
        itemProductIds.some(itemProd =>
          itemProd?.toString() === prodId.toString() || itemProd?._id?.toString() === prodId.toString()
        )
      );

      if (!categoryMatch && !productMatch && (coupon.applicableCategories.length > 0 || coupon.applicableProducts.length > 0)) {
        return res.status(400).json({ message: 'Coupon not applicable to selected items' });
      }
    }

    // Calculate discount
    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = (totalAmount * coupon.discountValue) / 100;
      if (coupon.maxDiscount) {
        discount = Math.min(discount, coupon.maxDiscount);
      }
    } else {
      discount = coupon.discountValue;
    }

    discount = Math.min(discount, totalAmount); // Can't discount more than total

    res.json({
      valid: true,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue
      },
      discount: Math.round(discount * 100) / 100,
      finalAmount: Math.max(0, totalAmount - discount)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

