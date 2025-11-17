# 🚀 TRY-ON Deployment Guide - Render.com

## 📋 Prerequisites
1. GitHub account
2. Render.com account (free)
3. All your environment variables ready

---

## 🎯 Step 1: Push Code to GitHub

### 1.1 Initialize Git (if not already done)
```bash
cd C:\Users\DELL\SE\TRY-ON
git init
git add .
git commit -m "Initial commit - Ready for deployment"
```

### 1.2 Create GitHub Repository
1. Go to https://github.com/new
2. Create a new repository named `tryon-app`
3. **Don't** initialize with README

### 1.3 Push to GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/tryon-app.git
git branch -M main
git push -u origin main
```

---

## 🌐 Step 2: Deploy on Render

### 2.1 Create Render Account
1. Go to https://render.com
2. Sign up with GitHub (easiest way)
3. Connect your GitHub account

### 2.2 Deploy Backend First

1. **Click "New +" → "Web Service"**
2. **Connect Repository**: Select your `tryon-app` repository
3. **Configure Backend**:
   - **Name**: `tryon-backend`
   - **Environment**: `Node`
   - **Region**: Choose closest to you (e.g., `Singapore` or `Oregon`)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: `Free`

4. **Environment Variables** (Add all these):
   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   GEMINI_API_KEY=your_gemini_key
   FRONTEND_URL=https://tryon-frontend.onrender.com (we'll update this later)
   EMAIL_USER=your_email
   EMAIL_PASS=your_email_password
   ADMIN_EMAIL=admin@tryon.com
   MASTERPIECE_X_API_KEY=your_masterpiece_key
   MASTERPIECE_X_API_URL=https://api.genai.masterpiecex.com/v2
   MASTERPIECE_X_APP_ID=your_app_id
   ENABLE_3D_GENERATION=true
   MASTERPIECE_POLL_INTERVAL_MS=5000
   MASTERPIECE_MAX_POLL_ATTEMPTS=240
   MASTERPIECE_REQUEST_TIMEOUT_MS=30000
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_key
   CLOUDINARY_API_SECRET=your_cloudinary_secret
   ```

5. **Click "Create Web Service"**
6. **Wait for deployment** (takes 5-10 minutes)
7. **Copy your backend URL** (e.g., `https://tryon-backend.onrender.com`)

### 2.3 Deploy Frontend

1. **Click "New +" → "Static Site"** (for frontend)
2. **Connect Repository**: Select same `tryon-app` repository
3. **Configure Frontend**:
   - **Name**: `tryon-frontend`
   - **Environment**: `Node`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
   - **Plan**: `Free`

4. **Environment Variables**:
   ```
   NODE_ENV=production
   VITE_API_URL=https://tryon-backend.onrender.com
   ```

5. **Click "Create Static Site"**
6. **Wait for deployment**

### 2.4 Update Backend FRONTEND_URL

1. Go to your backend service on Render
2. Go to "Environment" tab
3. Update `FRONTEND_URL` to your frontend URL:
   ```
   FRONTEND_URL=https://tryon-frontend.onrender.com
   ```
4. Click "Save Changes"
5. Render will automatically redeploy

---

## 🔧 Step 3: Update Frontend API Configuration

### 3.1 Update Axios Base URL

Create/update `frontend/src/config/axios.js`:

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://tryon-backend.onrender.com',
  withCredentials: true,
});

export default api;
```

### 3.2 Update All Axios Imports

Replace all `axios.get('/api/...')` with `api.get('/api/...')` in your frontend code.

**OR** simpler approach - update `vite.config.js`:

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: import.meta.env.VITE_API_URL || 'https://tryon-backend.onrender.com',
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
```

---

## ✅ Step 4: Verify Deployment

1. **Backend Health Check**: Visit `https://tryon-backend.onrender.com/api/health` (if you have this route)
2. **Frontend**: Visit `https://tryon-frontend.onrender.com`
3. **Test Features**:
   - Login/Signup
   - Browse Products
   - Add to Cart
   - Checkout

---

## 🐛 Common Issues & Solutions

### Issue 1: Backend CORS Error
**Solution**: Make sure `FRONTEND_URL` in backend matches your frontend URL exactly

### Issue 2: Frontend Can't Connect to Backend
**Solution**: 
- Check `VITE_API_URL` in frontend environment variables
- Make sure backend is running (check Render dashboard)

### Issue 3: Free Tier Sleeps After 15 Minutes
**Solution**: 
- First request after sleep takes ~30 seconds
- Consider upgrading to paid plan ($7/month) for always-on
- Or use a service like UptimeRobot to ping your site every 14 minutes

### Issue 4: Build Fails
**Solution**: 
- Check build logs in Render dashboard
- Make sure all dependencies are in `package.json`
- Check Node version (Render uses Node 18 by default)

---

## 📝 Alternative: Railway.app (Even Easier!)

Railway is another great option that's even simpler:

1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub"
4. Select your repository
5. Railway auto-detects your services!
6. Add environment variables
7. Done! 🎉

---

## 🎯 Quick Comparison

| Feature | Render | Railway |
|---------|--------|---------|
| Free Tier | ✅ Yes | ✅ Yes |
| Auto-Deploy | ✅ Yes | ✅ Yes |
| Easy Setup | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Free Tier Sleep | ⚠️ 15 min | ⚠️ After inactivity |
| Best For | Production | Development/Testing |

---

## 🚀 Your Deployment URLs

After deployment, you'll have:
- **Backend**: `https://tryon-backend.onrender.com`
- **Frontend**: `https://tryon-frontend.onrender.com`

---

## 📞 Need Help?

If you face any issues:
1. Check Render logs in dashboard
2. Verify all environment variables are set
3. Make sure MongoDB connection is working
4. Check CORS settings in backend

**Happy Deploying! 🎉**

