import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { FiX, FiMail, FiLock, FiUser, FiEye, FiEyeOff } from 'react-icons/fi';

const AuthModal = () => {
  const { showAuthModal, setShowAuthModal, authMode, setAuthMode, login, signup, verifyOTP, resendOTP } = useAuth();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', otp: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [signupEmail, setSignupEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (authMode === 'login') {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        setFormData({ name: '', email: '', password: '', otp: '' });
      }
    } else if (authMode === 'signup') {
      const result = await signup(formData.name, formData.email, formData.password);
      if (result.success) {
        setSignupEmail(formData.email);
        setFormData({ ...formData, name: '', password: '', otp: '' });
      }
    } else if (authMode === 'otp') {
      const result = await verifyOTP(signupEmail || formData.email, formData.otp);
      if (result.success) {
        setFormData({ name: '', email: '', password: '', otp: '' });
        setSignupEmail('');
      }
    }

    setLoading(false);
  };

  const handleResendOTP = async () => {
    await resendOTP(signupEmail || formData.email);
  };

  if (!showAuthModal) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={() => setShowAuthModal(false)}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-dark-card rounded-2xl shadow-2xl w-full max-w-md p-8 border border-dark-border"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">
              {authMode === 'login' && 'Login'}
              {authMode === 'signup' && 'Sign Up'}
              {authMode === 'otp' && 'Verify Email'}
            </h2>
            <button
              onClick={() => setShowAuthModal(false)}
              className="text-dark-muted hover:text-white transition-colors"
            >
              <FiX size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {authMode === 'signup' && (
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 bg-dark-surface border border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            )}

            {authMode !== 'otp' && (
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 bg-dark-surface border border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            )}

            {authMode !== 'otp' && (
              <div>
                <label className="block text-sm font-medium mb-2">Password</label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-10 pr-12 py-2 bg-dark-surface border border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-muted hover:text-white"
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>
            )}

            {authMode === 'otp' && (
              <div>
                <label className="block text-sm font-medium mb-2">OTP Code</label>
                <input
                  type="text"
                  value={formData.otp}
                  onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                  className="w-full px-4 py-2 bg-dark-surface border border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-2xl tracking-widest"
                  maxLength={6}
                  required
                />
                <button
                  type="button"
                  onClick={handleResendOTP}
                  className="mt-2 text-sm text-blue-500 hover:text-blue-400"
                >
                  Resend OTP
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : authMode === 'login' ? 'Login' : authMode === 'signup' ? 'Sign Up' : 'Verify'}
            </button>
          </form>

          <div className="mt-6 text-center">
            {authMode === 'login' ? (
              <p className="text-sm text-dark-muted">
                Don't have an account?{' '}
                <button
                  onClick={() => setAuthMode('signup')}
                  className="text-blue-500 hover:text-blue-400 font-medium"
                >
                  Sign Up
                </button>
              </p>
            ) : authMode === 'signup' ? (
              <p className="text-sm text-dark-muted">
                Already have an account?{' '}
                <button
                  onClick={() => setAuthMode('login')}
                  className="text-blue-500 hover:text-blue-400 font-medium"
                >
                  Login
                </button>
              </p>
            ) : (
              <p className="text-sm text-dark-muted">
                Check your email for the OTP code
              </p>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AuthModal;

