import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { generateTryOnImage } from '../utils/pixelcut.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';
import multer from 'multer';
import streamifier from 'streamifier';

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Route to handle user image upload and try-on generation
router.post('/', authenticate, upload.single('userImage'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'User image is required.' });
  }

  const { productImageUrl } = req.body;
  if (!productImageUrl) {
    return res.status(400).json({ message: 'Product image URL is required.' });
  }

  // Force Cloudinary URL to be JPG for compatibility
  let processedGarmentUrl = productImageUrl;
  if (processedGarmentUrl.includes('res.cloudinary.com')) {
    if (processedGarmentUrl.includes('/upload/')) {
      const parts = processedGarmentUrl.split('/upload/');
      // Remove any existing format transformations (like f_auto)
      const path = parts[1].replace(/f_auto,?/g, '');
      processedGarmentUrl = `${parts[0]}/upload/f_jpg/${path}`;
    }
    console.log(`[Try-On Route] Processed garment image URL for JPG conversion: ${processedGarmentUrl}`);
  }


  try {
    // 1. Upload user's image to Cloudinary
    const userImageUploadStream = streamifier.createReadStream(req.file.buffer);
    const cloudinaryResult = await uploadToCloudinary(userImageUploadStream, 'try-on-users');
    const userImageUrl = cloudinaryResult.secure_url;

    // 2. Call the try-on generation service
    const resultImageUrl = await generateTryOnImage(userImageUrl, processedGarmentUrl);

    // 3. Return the final image URL
    res.json({ resultUrl: resultImageUrl });

  } catch (error) {
    console.error('[Try-On Route] Error:', error);
    res.status(500).json({ message: error.message || 'An unexpected error occurred during the try-on process.' });
  }
});

export default router;
