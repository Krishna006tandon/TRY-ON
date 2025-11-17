# ✅ Deployment Checklist

## Before Deployment

### 1. Environment Variables Checklist
- [ ] `MONGODB_URI` - MongoDB connection string
- [ ] `JWT_SECRET` - Random secret string (use: `openssl rand -hex 32`)
- [ ] `GEMINI_API_KEY` - Google Gemini API key
- [ ] `EMAIL_USER` - Email for sending OTPs
- [ ] `EMAIL_PASS` - Email app password
- [ ] `ADMIN_EMAIL` - Admin email address
- [ ] `MASTERPIECE_X_API_KEY` - Masterpiece X API key
- [ ] `MASTERPIECE_X_APP_ID` - Masterpiece X App ID
- [ ] `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
- [ ] `CLOUDINARY_API_KEY` - Cloudinary API key
- [ ] `CLOUDINARY_API_SECRET` - Cloudinary API secret

### 2. Code Checklist
- [ ] All code committed to Git
- [ ] Pushed to GitHub
- [ ] `.env` files in `.gitignore`
- [ ] No hardcoded secrets in code
- [ ] All dependencies in `package.json`

### 3. Testing Checklist
- [ ] Backend runs locally: `cd backend && npm start`
- [ ] Frontend builds: `cd frontend && npm run build`
- [ ] All features tested locally
- [ ] API endpoints working

---

## Deployment Steps

### Step 1: GitHub
- [ ] Repository created on GitHub
- [ ] Code pushed to GitHub
- [ ] Repository is public (for free tier)

### Step 2: Render - Backend
- [ ] Account created on Render.com
- [ ] GitHub connected
- [ ] New Web Service created
- [ ] Repository selected
- [ ] Root Directory: `backend`
- [ ] Build Command: `npm install`
- [ ] Start Command: `npm start`
- [ ] All environment variables added
- [ ] Service deployed successfully
- [ ] Backend URL copied

### Step 3: Render - Frontend
- [ ] New Static Site created
- [ ] Same repository selected
- [ ] Root Directory: `frontend`
- [ ] Build Command: `npm install && npm run build`
- [ ] Publish Directory: `dist`
- [ ] `VITE_API_URL` environment variable added
- [ ] Service deployed successfully
- [ ] Frontend URL copied

### Step 4: Final Configuration
- [ ] Backend `FRONTEND_URL` updated to frontend URL
- [ ] Backend redeployed
- [ ] Frontend tested
- [ ] Backend tested
- [ ] CORS working correctly

---

## Post-Deployment Testing

- [ ] Homepage loads
- [ ] User can register
- [ ] User can login
- [ ] Products display
- [ ] Add to cart works
- [ ] Wishlist works
- [ ] Search works
- [ ] 3D model generation works (if enabled)
- [ ] Admin panel accessible (if admin user exists)

---

## Quick Commands

### Generate JWT Secret
```bash
openssl rand -hex 32
```

### Test Backend Locally
```bash
cd backend
npm install
npm start
```

### Test Frontend Build
```bash
cd frontend
npm install
npm run build
npm run preview
```

### Git Commands
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

---

## Support

If you face issues:
1. Check Render logs
2. Verify environment variables
3. Check MongoDB connection
4. Verify CORS settings
5. Check build logs

**Happy Deploying! 🚀**

