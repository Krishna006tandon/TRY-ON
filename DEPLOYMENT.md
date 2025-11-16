# Deployment Guide - TRY-ON Platform

## Vercel Deployment

### Prerequisites
1. Vercel account
2. MongoDB Atlas account
3. Cloudinary account
4. Google Gemini API key
5. Masterpiece X API key (optional, for 3D generation)

### Step 1: Backend Deployment

1. **Create Vercel Project for Backend:**
   ```bash
   cd backend
   vercel
   ```

2. **Add Environment Variables in Vercel Dashboard:**
   - Go to your project settings → Environment Variables
   - Add all variables from `.env` file:
     - `MONGODB_URI`
     - `GEMINI_API_KEY`
     - `JWT_SECRET`
     - `CLOUDINARY_CLOUD_NAME`
     - `CLOUDINARY_API_KEY`
     - `CLOUDINARY_API_SECRET`
     - `EMAIL_USER`
     - `EMAIL_PASS`
     - `MASTERPIECE_X_API_KEY` (optional)
     - `MASTERPIECE_X_API_URL` (optional)
     - `ENABLE_3D_GENERATION` (optional)
     - `FRONTEND_URL` (your frontend URL after deployment)
     - `PORT` (Vercel will set this automatically)
     - `NODE_ENV=production`

3. **Update `backend/vercel.json`:**
   - The file is already configured correctly

### Step 2: Frontend Deployment

1. **Create Vercel Project for Frontend:**
   ```bash
   cd frontend
   vercel
   ```

2. **Update API Base URL:**
   - Create `frontend/.env.production`:
   ```
   VITE_API_URL=https://your-backend-url.vercel.app
   ```

3. **Update `frontend/src/contexts/AuthContext.jsx` and other API calls:**
   - Or use environment variable for API URL

### Step 3: Update CORS and URLs

1. **Backend CORS:**
   - Update `FRONTEND_URL` in Vercel environment variables to your frontend URL
   - Example: `https://tryon-frontend.vercel.app`

2. **Frontend API Calls:**
   - Update axios base URL or use proxy

### Step 4: Database Setup

1. **MongoDB Atlas:**
   - Create cluster
   - Get connection string
   - Add to `MONGODB_URI`
   - Whitelist Vercel IPs (or use 0.0.0.0/0 for development)

### Step 5: Create First Admin User

After deployment, create admin user via MongoDB:

```javascript
// In MongoDB Compass or shell
db.users.updateOne(
  { email: "your-admin-email@example.com" },
  { $set: { role: "admin" } }
)
```

### Alternative: Single Vercel Project (Monorepo)

If deploying as monorepo:

1. **Root `vercel.json`** is already configured
2. **Add all environment variables** in Vercel dashboard
3. **Deploy from root:**
   ```bash
   vercel
   ```

### Environment Variables Checklist

- [ ] MONGODB_URI
- [ ] GEMINI_API_KEY
- [ ] JWT_SECRET
- [ ] CLOUDINARY_CLOUD_NAME
- [ ] CLOUDINARY_API_KEY
- [ ] CLOUDINARY_API_SECRET
- [ ] EMAIL_USER
- [ ] EMAIL_PASS
- [ ] FRONTEND_URL (after frontend deployment)
- [ ] MASTERPIECE_X_API_KEY (optional)
- [ ] MASTERPIECE_X_API_URL (optional)
- [ ] ENABLE_3D_GENERATION (optional)
- [ ] NODE_ENV=production

### Post-Deployment

1. Test all endpoints
2. Verify email sending (check spam folder)
3. Test chatbot
4. Test 3D model generation (if enabled)
5. Create admin user
6. Add sample products and categories

### Troubleshooting

- **CORS Errors:** Check FRONTEND_URL in backend env vars
- **API 404:** Verify route paths in vercel.json
- **MongoDB Connection:** Check network access in Atlas
- **Email Not Working:** Verify app password for Gmail
- **Build Failures:** Check Node.js version (should be 18+)

