# TRY-ON E-Commerce Platform

A full-stack e-commerce platform built with React and Node.js, featuring authentication, product management, shopping cart, order tracking, AI-powered recommendations, visual/voice search, and chatbot support.

## Features

### Client-Side
- ✅ Authentication (Login/Signup/OTP Verification)
- ✅ Navigation & Layout (Navbar/Footer/Utility Strip/Drawer)
- ✅ Product Display & Details with Quick View Modal
- ✅ Shopping Cart with Drawer Interface
- ✅ Order Management & Tracking
- ✅ User Profile with Dropdown
- ✅ Search (Visual/Voice/Text Search)
- ✅ Personalization & Recommendations
- ✅ Chatbot Support
- ✅ Theming & Language Switching
- ✅ Animated Aura Background

### Backend-Side
- ✅ User & Authentication Management
- ✅ Product & Category Management
- ✅ Order & Delivery Tracking
- ✅ Personalization & Recommendations (AI-powered)
- ✅ Search (Visual & Voice)
- ✅ Chatbot Integration (Gemini AI)
- ✅ Notifications System
- ✅ Admin Dashboard & Analytics

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Framer Motion
- **Backend**: Node.js, Express, MongoDB, Socket.io
- **AI**: Google Gemini API
- **Storage**: Cloudinary
- **Deployment**: Vercel

## Setup

### Backend

```bash
cd backend
npm install
cp .env.example .env  # Add your environment variables
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

### Backend (.env)
```
MONGODB_URI=your_mongodb_uri
GEMINI_API_KEY=your_gemini_key
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
```

## Deployment

The project is configured for Vercel deployment. Both frontend and backend can be deployed on Vercel.

## License

MIT
