// Script to seed default categories
// Run: node scripts/seedCategories.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Category from '../models/Category.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env') });

const defaultCategories = [
  { name: 'Electronics', description: 'Electronic devices and gadgets' },
  { name: 'Clothing', description: 'Fashion and apparel' },
  { name: 'Home & Living', description: 'Home decor and furniture' },
  { name: 'Sports & Outdoors', description: 'Sports equipment and outdoor gear' },
  { name: 'Beauty & Personal Care', description: 'Beauty products and personal care items' },
  { name: 'Books & Media', description: 'Books, movies, and media' },
  { name: 'Toys & Games', description: 'Toys and games for all ages' },
  { name: 'Automotive', description: 'Car accessories and automotive products' }
];

const seedCategories = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    let created = 0;
    let skipped = 0;

    for (const catData of defaultCategories) {
      const existing = await Category.findOne({ name: catData.name });
      
      if (existing) {
        console.log(`⏭️  Category "${catData.name}" already exists, skipping...`);
        skipped++;
      } else {
        const category = new Category(catData);
        await category.save();
        console.log(`✅ Created category: ${catData.name}`);
        created++;
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   Created: ${created}`);
    console.log(`   Skipped: ${skipped}`);
    console.log(`   Total: ${defaultCategories.length}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding categories:', error);
    process.exit(1);
  }
};

seedCategories();

