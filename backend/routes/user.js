import express from 'express';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';
import { upload, uploadToCloudinary } from '../utils/cloudinary.js';
import { body, validationResult } from 'express-validator';
import Coupon from '../models/Coupon.js';

const router = express.Router();

const rewardCatalog = [
  {
    id: 'starter-100',
    title: '₹100 Shopping Voucher',
    description: 'Get ₹100 off when you shop for ₹999 or more',
    pointsRequired: 500,
    type: 'coupon',
    discountType: 'fixed',
    discountValue: 100,
    minPurchase: 999,
    validityDays: 30
  },
  {
    id: 'flash-10',
    title: '10% Flash Discount',
    description: 'Flat 10% off on your next purchase (max ₹400)',
    pointsRequired: 900,
    type: 'coupon',
    discountType: 'percentage',
    discountValue: 10,
    maxDiscount: 400,
    minPurchase: 1499,
    validityDays: 45
  },
  {
    id: 'vip-300',
    title: '₹300 VIP Voucher',
    description: '₹300 off on premium catalog orders above ₹2499',
    pointsRequired: 1500,
    type: 'coupon',
    discountType: 'fixed',
    discountValue: 300,
    minPurchase: 2499,
    validityDays: 60
  }
];

// Get user profile
router.get('/profile', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password -otp')
      .populate('addresses');
    
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user profile
router.put('/profile', authenticate, [
  body('name').optional().trim().notEmpty(),
  body('phone').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, phone, preferences } = req.body;
    const updates = {};

    if (name) updates.name = name;
    if (phone) updates.phone = phone;
    if (preferences) updates.preferences = { ...req.user.preferences, ...preferences };

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password -otp');

    res.json({ user, message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Upload avatar
router.post('/avatar', authenticate, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const result = await uploadToCloudinary(req.file.buffer, 'tryon/avatars');
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: result.secure_url },
      { new: true }
    ).select('-password -otp');

    res.json({ user, message: 'Avatar uploaded successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add address
router.post('/address', authenticate, [
  body('street').notEmpty().withMessage('Street is required'),
  body('city').notEmpty().withMessage('City is required'),
  body('state').notEmpty().withMessage('State is required'),
  body('zipCode').notEmpty().withMessage('Zip code is required'),
  body('country').notEmpty().withMessage('Country is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { type, street, city, state, zipCode, country, isDefault } = req.body;

    if (isDefault) {
      await User.updateMany(
        { _id: req.user._id },
        { $set: { 'addresses.$[].isDefault': false } }
      );
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $push: { addresses: { type, street, city, state, zipCode, country, isDefault } } },
      { new: true }
    ).select('-password -otp');

    res.json({ user, message: 'Address added successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update address
router.put('/address/:addressId', authenticate, async (req, res) => {
  try {
    const { addressId } = req.params;
    const updates = req.body;

    if (updates.isDefault) {
      await User.updateMany(
        { _id: req.user._id },
        { $set: { 'addresses.$[].isDefault': false } }
      );
    }

    const user = await User.findOneAndUpdate(
      { _id: req.user._id, 'addresses._id': addressId },
      { $set: { 'addresses.$': { ...updates, _id: addressId } } },
      { new: true }
    ).select('-password -otp');

    if (!user) {
      return res.status(404).json({ message: 'Address not found' });
    }

    res.json({ user, message: 'Address updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete address
router.delete('/address/:addressId', authenticate, async (req, res) => {
  try {
    const { addressId } = req.params;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { addresses: { _id: addressId } } },
      { new: true }
    ).select('-password -otp');

    res.json({ user, message: 'Address deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get reward summary & claim history
router.get('/rewards', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('rewardPoints rewardClaims');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const rewardPoints = user.rewardPoints || 0;
    const claims = (user.rewardClaims || [])
      .sort((a, b) => new Date(b.claimedAt) - new Date(a.claimedAt))
      .slice(0, 15);

    const rewards = rewardCatalog.map((reward) => ({
      ...reward,
      isEligible: rewardPoints >= reward.pointsRequired
    }));

    res.json({
      rewardPoints,
      rewards,
      claims
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Claim reward
router.post('/rewards/claim', authenticate, async (req, res) => {
  try {
    const { rewardId } = req.body;
    const reward = rewardCatalog.find((item) => item.id === rewardId);

    if (!reward) {
      return res.status(404).json({ message: 'Reward not found' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if ((user.rewardPoints || 0) < reward.pointsRequired) {
      return res.status(400).json({ message: 'Insufficient reward points' });
    }

    user.rewardPoints -= reward.pointsRequired;

    let couponDoc = null;
    if (reward.type === 'coupon') {
      const now = new Date();
      const validUntil = new Date(now.getTime() + (reward.validityDays || 30) * 24 * 60 * 60 * 1000);
      const code = generateRewardCouponCode();
      couponDoc = await Coupon.create({
        code,
        description: reward.description,
        discountType: reward.discountType,
        discountValue: reward.discountValue,
        minPurchase: reward.minPurchase || 0,
        maxDiscount: reward.maxDiscount,
        validFrom: now,
        validUntil,
        usageLimit: 1,
        usedCount: 0,
        userLimit: 1,
        isActive: true,
        assignedTo: user._id
      });
    }

    user.rewardClaims = [
      {
        rewardId: reward.id,
        title: reward.title,
        description: reward.description,
        pointsSpent: reward.pointsRequired,
        rewardValue: reward.discountValue,
        rewardType: reward.type,
        code: couponDoc?.code || null,
        status: 'fulfilled',
        claimedAt: new Date(),
        expiresAt: couponDoc?.validUntil || null
      },
      ...(user.rewardClaims || [])
    ].slice(0, 25);

    await user.save();

    res.json({
      message: 'Reward claimed successfully',
      claim: user.rewardClaims[0],
      rewardPoints: user.rewardPoints
    });
  } catch (error) {
    console.error('Reward claim error:', error);
    res.status(500).json({ message: error.message });
  }
});

const generateRewardCouponCode = () => {
  const segment = () => Math.random().toString(36).substring(2, 6).toUpperCase();
  return `RW-${segment()}${segment()}`;
};

export default router;

