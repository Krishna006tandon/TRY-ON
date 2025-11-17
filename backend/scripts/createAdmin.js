// Script to create admin user
// Run: node scripts/createAdmin.js

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Admin credentials (you can change these)
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@tryon.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const adminName = 'Admin User';

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      // Update existing user to admin and set password
      existingAdmin.role = 'admin';
      existingAdmin.password = adminPassword; // The pre-save hook in User.js will hash this
      await existingAdmin.save();
      console.log(`✅ Existing user updated to admin: ${adminEmail}`);
    } else {
      // Create new admin user
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      
      const admin = new User({
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        isEmailVerified: true, // Skip email verification for admin
        rewardPoints: 0
      });

      await admin.save();
      console.log(`✅ Admin user created successfully!`);
      console.log(`   Email: ${adminEmail}`);
      console.log(`   Password: ${adminPassword}`);
    }

    console.log('\n📝 Login Credentials:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log('\n⚠️  Please change the password after first login!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();

