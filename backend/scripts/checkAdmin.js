// Script to diagnose the admin user
import mongoose from 'mongoose';
import User from '../models/User.js';

const checkAdmin = async () => {
  console.log('--- Admin User Diagnostic Script ---');
  try {
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI is not defined. Ensure .env file is loaded.');
      process.exit(1);
    }
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@tryon.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    console.log(`\n🔍 Searching for admin user with email: ${adminEmail}`);
    const adminUser = await User.findOne({ email: adminEmail });

    if (!adminUser) {
      console.error('❌ RESULT: Admin user not found in the database.');
      console.log('   Please run `npm run create-admin` to create it.');
      process.exit(1);
    }

    console.log('✅ RESULT: Admin user found!');
    console.log('--- User Data ---');
    console.log(`  Name: ${adminUser.name}`);
    console.log(`  Email: ${adminUser.email}`);
    console.log(`  Role: ${adminUser.role}`);
    console.log(`  Is Email Verified: ${adminUser.isEmailVerified}`);
    console.log(`  Password hash exists: ${!!adminUser.password}`);
    console.log('-----------------\n');

    console.log(`\n🔑 Comparing password "${adminPassword}" with stored hash...`);
    const isMatch = await adminUser.comparePassword(adminPassword);

    if (isMatch) {
      console.log('✅✅✅ RESULT: Password comparison SUCCEEDED!');
      console.log('   Login should be working correctly.');
    } else {
      console.error('❌❌❌ RESULT: Password comparison FAILED!');
      console.error('   The password stored in the database does not match "admin123".');
      console.log('\n   RECOMMENDATION: Please run `npm run create-admin` again to reset the password.');
    }

    process.exit(0);
  } catch (error) {
    console.error('\n❌ An unexpected error occurred during the script:', error);
    process.exit(1);
  }
};

checkAdmin();
