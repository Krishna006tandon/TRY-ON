import express from 'express';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';
import { upload, uploadToCloudinary } from '../utils/cloudinary.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

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

export default router;

