# 🚀 Render Deployment - Step by Step

## ⚠️ Important: render.yaml Limitations

Render's `render.yaml` has some limitations:
- Static sites can't use `fromService` references
- `url` property is not available in `fromService`

**Solution**: We'll deploy manually and set URLs after both services are live.

---

## 📋 Deployment Steps

### Step 1: Push to GitHub

```bash
cd C:\Users\DELL\SE\TRY-ON
git init
git add .
git commit -m "Ready for deployment"
git remote add origin https://github.com/YOUR_USERNAME/tryon-app.git
git push -u origin main
```

### Step 2: Deploy Backend First

1. Go to https://render.com
2. Sign up/Login with GitHub
3. Click **"New +"** → **"Web Service"**
4. Connect your GitHub repository
5. Configure:
   - **Name**: `tryon-backend`
   - **Environment**: `Node`
   - **Region**: Choose closest (e.g., Singapore, Oregon)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: `Free`

6. **Add Environment Variables**:
   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   GEMINI_API_KEY=your_gemini_key
   FRONTEND_URL=https://tryon-frontend.onrender.com
   (We'll update this after frontend is deployed)
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

7. Click **"Create Web Service"**
8. Wait 5-10 minutes for deployment
9. **Copy your backend URL** (e.g., `https://tryon-backend.onrender.com`)

### Step 3: Deploy Frontend

1. Click **"New +"** → **"Static Site"**
2. Connect same GitHub repository
3. Configure:
   - **Name**: `tryon-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
   - **Plan**: `Free`

4. **Add Environment Variables**:
   ```
   VITE_API_URL=https://tryon-backend.onrender.com
   (Use the backend URL from Step 2)
   ```

5. Click **"Create Static Site"**
6. Wait for deployment
7. **Copy your frontend URL** (e.g., `https://tryon-frontend.onrender.com`)

### Step 4: Update Backend FRONTEND_URL

1. Go to your **Backend Service** on Render
2. Click **"Environment"** tab
3. Find `FRONTEND_URL`
4. Update it to your frontend URL:
   ```
   https://tryon-frontend.onrender.com
   ```
5. Click **"Save Changes"**
6. Render will automatically redeploy

---

## ✅ Verification

1. **Backend Health**: Visit `https://tryon-backend.onrender.com/api/health` (if route exists)
2. **Frontend**: Visit `https://tryon-frontend.onrender.com`
3. **Test**: Try login, browse products, add to cart

---

## 🔧 Alternative: Use render.yaml (Manual URL Setup)

If you want to use `render.yaml`:

1. **Don't use** `fromService` for URLs
2. **Manually set** URLs after both services are deployed
3. The `render.yaml` file is now fixed and ready to use

**To use render.yaml**:
1. Push code to GitHub
2. In Render dashboard, click **"New +"** → **"Blueprint"**
3. Connect your repo
4. Render will detect `render.yaml` and create services
5. **Manually update** `FRONTEND_URL` and `VITE_API_URL` after deployment

---

## 🎯 Quick Summary

1. ✅ Deploy Backend → Get backend URL
2. ✅ Deploy Frontend → Use backend URL in `VITE_API_URL`
3. ✅ Update Backend → Set `FRONTEND_URL` to frontend URL
4. ✅ Done! 🎉

---

## 💡 Pro Tip

**Deploy Order Matters**:
- Deploy Backend first
- Then Frontend (so you can use backend URL)
- Then update Backend's FRONTEND_URL

**This way everything connects properly!** ✅

