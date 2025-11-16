import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login', 'signup', 'otp'

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchUser = async () => {
    try {
      const response = await axios.get('/api/auth/me');
      setUser(response.data.user);
    } catch (error) {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      setShowAuthModal(false);
      toast.success('Login successful!');
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      return { success: false, error: error.response?.data?.message };
    }
  };

  const signup = async (name, email, password) => {
    try {
      const response = await axios.post('/api/auth/register', { name, email, password });
      setAuthMode('otp');
      toast.success('Registration successful! Please verify your email.');
      return { success: true, userId: response.data.userId };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
      return { success: false, error: error.response?.data?.message };
    }
  };

  const verifyOTP = async (email, otp) => {
    try {
      const response = await axios.post('/api/auth/verify-otp', { email, otp });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      setShowAuthModal(false);
      setAuthMode('login');
      toast.success('Email verified successfully!');
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || 'OTP verification failed');
      return { success: false, error: error.response?.data?.message };
    }
  };

  const resendOTP = async (email) => {
    try {
      await axios.post('/api/auth/resend-otp', { email });
      toast.success('OTP sent successfully!');
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resend OTP');
      return { success: false };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    toast.success('Logged out successfully');
  };

  const value = {
    user,
    loading,
    login,
    signup,
    verifyOTP,
    resendOTP,
    logout,
    showAuthModal,
    setShowAuthModal,
    authMode,
    setAuthMode,
    fetchUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

