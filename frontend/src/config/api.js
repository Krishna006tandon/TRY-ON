// API Configuration
// In production, set VITE_API_URL to your backend URL
// In development, Vite proxy handles /api routes
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Set default axios base URL if provided (for production)
if (API_BASE_URL) {
  axios.defaults.baseURL = API_BASE_URL;
}

export default API_BASE_URL;

