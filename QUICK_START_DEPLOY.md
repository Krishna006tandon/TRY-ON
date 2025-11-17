# 🚀 Quick Start - Deployment Guide

## 🎯 Best Option: Render.com

**क्यों Render?**
- ✅ 100% Free
- ✅ बहुत आसान setup
- ✅ Frontend + Backend दोनों एक platform पर
- ✅ Auto-deploy from GitHub
- ✅ Free SSL certificate

---

## 📋 3 Simple Steps

### 1️⃣ GitHub पर Code Push करें

```bash
# Terminal में:
cd C:\Users\DELL\SE\TRY-ON
git init
git add .
git commit -m "Ready for deployment"
git remote add origin https://github.com/YOUR_USERNAME/tryon-app.git
git push -u origin main
```

### 2️⃣ Render.com पर Deploy करें

1. **Go to**: https://render.com
2. **Sign up** with GitHub
3. **Click**: "New +" → "Web Service"
4. **Connect** your GitHub repo
5. **Settings**:
   - Name: `tryon-backend`
   - Root Directory: `backend`
   - Build: `npm install`
   - Start: `npm start`
6. **Add Environment Variables** (सभी जरूरी)
7. **Deploy!** ✅

### 3️⃣ Frontend Deploy करें

1. **Click**: "New +" → "Static Site"
2. **Same repo** select करें
3. **Settings**:
   - Root Directory: `frontend`
   - Build: `npm install && npm run build`
   - Publish: `dist`
4. **Add**: `VITE_API_URL=https://tryon-backend.onrender.com`
5. **Deploy!** ✅

---

## 🔑 Environment Variables (Backend)

Render dashboard में ये सभी add करें:

```
NODE_ENV=production
PORT=10000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_secret
GEMINI_API_KEY=your_key
FRONTEND_URL=https://tryon-frontend.onrender.com
EMAIL_USER=your_email
EMAIL_PASS=your_password
ADMIN_EMAIL=admin@tryon.com
MASTERPIECE_X_API_KEY=your_key
MASTERPIECE_X_API_URL=https://api.genai.masterpiecex.com/v2
MASTERPIECE_X_APP_ID=your_app_id
ENABLE_3D_GENERATION=true
CLOUDINARY_CLOUD_NAME=your_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

---

## 🔑 Environment Variables (Frontend)

```
VITE_API_URL=https://tryon-backend.onrender.com
```

---

## ⚠️ Important Notes

1. **Free Tier Sleep**: Render free tier 15 minutes inactivity के बाद sleep हो जाता है
   - First request 30 seconds लेगा (wake up time)
   - Solution: Paid plan ($7/month) या UptimeRobot use करें

2. **CORS**: Backend में `FRONTEND_URL` सही होना चाहिए

3. **MongoDB**: MongoDB Atlas free tier use कर सकते हैं

4. **Build Time**: First deployment 5-10 minutes लेगा

---

## 🎉 After Deployment

आपकी app live होगी:
- **Frontend**: `https://tryon-frontend.onrender.com`
- **Backend**: `https://tryon-backend.onrender.com`

---

## 🆘 Help

अगर कोई problem हो:
1. Render logs check करें
2. Environment variables verify करें
3. MongoDB connection check करें
4. CORS settings check करें

**Detailed Guide**: `DEPLOYMENT_GUIDE.md` देखें

**Good Luck! 🚀**

