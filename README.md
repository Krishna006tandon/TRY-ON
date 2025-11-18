# TRY-ON: AI-Powered E-Commerce Platform

A futuristic, full-stack e-commerce platform built with the MERN stack, featuring AI-powered 3D model generation, virtual try-on, and personalized recommendations.

**Live Demo**: [Link to Deployed App](httpss://try-on-frontend-pi.vercel.app/)

## ✨ Key Features

-   **Modern E-commerce Core**: Full product catalog, shopping cart, and order management system.
-   **Admin Dashboard**: A comprehensive panel for managing products, users, orders, and discount coupons.
-   **AI 3D Model Generation**: Automatically creates 3D models from 2D product images using the **Masterpiece X API**.
-   **AI Virtual Try-On**: Allows users to upload their photo to see how clothes fit them, powered by the **Pixelcut API**.
-   **AI-Powered Recommendations**: Personalized product suggestions based on user behavior and browsing history, using the **Google Gemini API**.
-   **AI Chatbot**: An integrated chatbot for customer support and answering queries, also powered by the Gemini API.
-   **Secure Authentication**: JWT-based authentication with role-based access control (user and admin).
-   **Search and Filtering**: Powerful search functionality for products.
-   **Wishlist**: Users can save their favorite products.
-   **Responsive Design**: Fully responsive frontend for a seamless experience on all devices.

## 🛠️ Tech Stack

| Category      | Technology                                                              |
| ------------- | ----------------------------------------------------------------------- |
| **Frontend**  | React, Vite, Tailwind CSS, Framer Motion, Axios                         |
| **Backend**   | Node.js, Express.js, MongoDB, Mongoose                                  |
| **AI Services** | Masterpiece X API, Pixelcut API, Google Gemini API                    |
| **Cloud**     | Cloudinary (Media Storage),                                             |
| **Auth**      | JSON Web Tokens (JWT), bcrypt.js                                        |

## 📂 Project Structure

The project is a monorepo with two main directories: `frontend` and `backend`.

```
/
├── backend/
│   ├── models/         # Mongoose schemas
│   ├── routes/         # API endpoint definitions
│   ├── middleware/     # Express middleware (e.g., auth)
│   ├── utils/          # Utility functions (Cloudinary, AI APIs)
│   ├── server.js       # Main backend server file
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/   # Reusable React components
    │   ├── pages/        # Page components for different routes
    │   ├── contexts/     # React context for state management
    │   ├── config/       # API configuration
    │   ├── App.jsx       # Main App component
    │   └── main.jsx      # Frontend entry point
    └── package.json
```

## 🚀 Getting Started

### Prerequisites

-   Node.js (v18 or later)
-   MongoDB (local instance or a cloud service like MongoDB Atlas)
-   Git

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/TRY-ON.git
cd TRY-ON
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory and add the required environment variables (see below).

```bash
# Start the backend server
npm run dev
```

The backend will be running on `http://localhost:4000`.

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

```bash
# Start the frontend development server
npm run dev
```

The frontend will be running on `http://localhost:5173`.

## ⚙️ Environment Variables

The backend requires a `.env` file with the following variables.

```env
# --- Core ---
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=a_strong_and_long_random_string_for_jwt
FRONTEND_URL=http://localhost:5173
PORT=4000

# --- Cloudinary (for image and asset storage) ---
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# --- Google Gemini (for AI recommendations and chatbot) ---
GEMINI_API_KEY=your_google_gemini_api_key
GEMINI_TEXT_MODEL=gemini-1.5-flash

# --- 3D Model Generation (Masterpiece X) ---
ENABLE_3D_GENERATION=true
MASTERPIECE_X_API_URL=https://api.genai.masterpiecex.com
MASTERPIECE_X_API_KEY=your_masterpiece_x_api_key

# --- Virtual Try-On (Pixelcut) ---
PIXELCUT_API_KEY=your_pixelcut_api_key

# --- Email (Optional: for notifications, password reset, etc.) ---
EMAIL_USER=your_email_address
EMAIL_PASS=your_email_password
```

## 📜 Available Scripts

### Backend (`/backend`)

-   `npm run dev`: Starts the server in development mode with `nodemon`.
-   `npm start`: Starts the server in production mode.
-   `npm run seed:categories`: Seeds the database with initial product categories.

### Frontend (`/frontend`)

-   `npm run dev`: Starts the development server with Vite.
-   `npm run build`: Builds the app for production.
-   `npm run lint`: Lints the code using ESLint.
-   `npm run preview`: Serves the production build locally.

## 🚢 Deployment

This project is configured for easy deployment:

-   **Frontend**: Deployed on **Vercel**. The `frontend/vercel.json` file configures the proxy to the backend.
-   **Backend**: Deployed on **Render**. The `render.yaml` file defines the infrastructure as code to deploy the backend service and a MongoDB database.

## 📄 License

This project is licensed under the MIT License.