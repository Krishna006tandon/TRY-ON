# Admin Login Guide

## Method 1: Create Admin User via Script (Recommended)

### Step 1: Run the Admin Creation Script

```bash
cd backend
npm run create-admin
```

**Default Admin Credentials:**
- Email: `admin@tryon.com`
- Password: `admin123`

### Step 2: Login

1. Open your application
2. Click on "Login" or "Sign In"
3. Enter the admin email and password
4. You'll be logged in as admin
5. You'll see "Admin Dashboard" link in your profile dropdown

---

## Method 2: Create Admin via MongoDB

### Option A: Using MongoDB Compass

1. Open MongoDB Compass
2. Connect to your database
3. Go to `users` collection
4. Find your user document (by email)
5. Update the document:
   ```json
   {
     "role": "admin"
   }
   ```

### Option B: Using MongoDB Shell

```javascript
// Connect to MongoDB
use your-database-name

// Update existing user to admin
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)

// Or create new admin user
db.users.insertOne({
  name: "Admin User",
  email: "admin@tryon.com",
  password: "$2a$10$hashedpasswordhere", // Use bcrypt to hash password
  role: "admin",
  isEmailVerified: true,
  rewardPoints: 0,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

---

## Method 3: Set Admin via Environment Variables

You can customize admin credentials by adding to `backend/.env`:

```env
ADMIN_EMAIL=your-admin@email.com
ADMIN_PASSWORD=your-secure-password
```

Then run:
```bash
npm run create-admin
```

---

## After Login

Once logged in as admin, you can:

1. **Access Admin Dashboard:**
   - Click on your profile dropdown
   - Click "Admin Dashboard"
   - Or go to `/admin` directly

2. **Admin Features:**
   - View dashboard statistics
   - Manage products (add/edit/delete)
   - Manage users (view/change roles)
   - Manage orders (view/update status)
   - Generate 3D models for products

3. **Change Password:**
   - Go to Profile page
   - Update your password

---

## Troubleshooting

### Can't see Admin Dashboard link?
- Check if `user.role === 'admin'` in database
- Refresh the page after updating role
- Clear browser cache

### Script not working?
- Make sure MongoDB is running
- Check `.env` file has correct `MONGODB_URI`
- Run `npm install` in backend directory

### Forgot admin password?
- Run the script again (it will update existing admin)
- Or reset via MongoDB directly

---

## Security Note

⚠️ **Important:** 
- Change the default admin password after first login
- Use strong passwords in production
- Don't commit `.env` file to git
- Use environment variables for admin credentials in production

