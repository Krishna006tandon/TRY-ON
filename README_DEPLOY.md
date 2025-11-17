# 🚀 Quick Deployment Guide - Render.com

## ⚡ सबसे आसान तरीका (Easiest Way)

### Option 1: Render.com (Recommended) ⭐

**क्यों Render?**
- ✅ 100% Free tier
- ✅ Auto-deploy from GitHub
- ✅ Easy setup
- ✅ SSL certificate automatically
- ✅ Both frontend + backend एक ही platform पर

---

## 📝 Step-by-Step (हिंदी में)

### Step 1: GitHub पर Code Push करें

```bash
# Terminal में ये commands run करें:
cd C:\Users\DELL\SE\TRY-ON

# Git initialize (अगर पहले से नहीं है)
git init
git add .
git commit -m "Ready for deployment"

# GitHub पर नया repository बनाएं (github.com पर जाकर)
# फिर ये commands:
git remote add origin https://github.com/YOUR_USERNAME/tryon-app.git
git branch -M main
git push -u origin main
```

### Step 2: Render.com पर Account बनाएं

1. https://render.com पर जाएं
2. "Get Started for Free" click करें
3. GitHub से sign up करें (सबसे आसान)

### Step 3: Backend Deploy करें

1. Render dashboard में **"New +"** → **"Web Service"** click करें
2. GitHub repository connect करें
3. Settings:
   - **Name**: `tryon-backend`
   - **Environment**: `Node`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: `Free`

4. **Environment Variables** add करें (सभी जरूरी):
   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   GEMINI_API_KEY=your_gemini_key
   FRONTEND_URL=https://tryon-frontend.onrender.com
   EMAIL_USER=your_email
   EMAIL_PASS=your_email_password
   ADMIN_EMAIL=admin@tryon.com
   MASTERPIECE_X_API_KEY=your_key
   MASTERPIECE_X_API_URL=https://api.genai.masterpiecex.com/v2
   MASTERPIECE_X_APP_ID=your_app_id
   ENABLE_3D_GENERATION=true
   CLOUDINARY_CLOUD_NAME=your_name
   CLOUDINARY_API_KEY=your_key
   CLOUDINARY_API_SECRET=your_secret
   ```

5. **"Create Web Service"** click करें
6. 5-10 minutes wait करें
7. Backend URL copy करें (जैसे: `https://tryon-backend.onrender.com`)

### Step 4: Frontend Deploy करें

1. **"New +"** → **"Static Site"** click करें
2. Same repository select करें
3. Settings:
   - **Name**: `tryon-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
   - **Plan**: `Free`

4. **Environment Variables**:
   ```
   VITE_API_URL=https://tryon-backend.onrender.com
   ```

5. **"Create Static Site"** click करें
6. Wait करें deployment के लिए

### Step 5: Backend में Frontend URL Update करें

1. Backend service में जाएं
2. "Environment" tab में
3. `FRONTEND_URL` को update करें:
   ```
   FRONTEND_URL=https://tryon-frontend.onrender.com
   ```
4. Save करें (auto-redeploy होगा)

---

## ✅ Done! 🎉

अब आपकी app live है:
- **Frontend**: `https://tryon-frontend.onrender.com`
- **Backend**: `https://tryon-backend.onrender.com`

---

## 🔧 अगर कोई Problem हो

### Problem: CORS Error
**Solution**: Backend में `FRONTEND_URL` सही है या नहीं check करें

### Problem: Frontend Backend से connect नहीं हो रहा
**Solution**: Frontend में `VITE_API_URL` environment variable check करें

### Problem: Free tier 15 min बाद sleep हो जाता है
**Solution**: 
- First request 30 seconds लेगा (wake up time)
- Paid plan ($7/month) लें अगर always-on चाहिए
- या UptimeRobot use करें (free) - हर 14 min ping करेगा

---

## 🎯 Alternative: Railway.app (और भी आसान!)

Railway और भी simple है:

1. https://railway.app पर जाएं
2. GitHub से sign up करें
3. "New Project" → "Deploy from GitHub"
4. Repository select करें
5. Railway automatically detect करेगा!
6. Environment variables add करें
7. Done! 🚀

---

## 📊 Comparison

| Feature | Render | Railway |
|---------|--------|---------|
| Free Tier | ✅ | ✅ |
| Setup | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Auto-Deploy | ✅ | ✅ |
| Sleep Time | 15 min | After inactivity |

**मेरी recommendation: Render.com use करें - सबसे reliable है!**

---

## 💡 Tips

1. **Environment Variables** सभी add करना न भूलें
2. **MongoDB URI** सही होना चाहिए
3. **CORS** settings check करें
4. Deployment logs check करते रहें

**Good Luck! 🚀**

