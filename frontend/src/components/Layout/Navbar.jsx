import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiSearch, FiShoppingCart, FiUser, FiMenu, FiX } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useTheme } from '../../contexts/ThemeContext';
import AuthModal from '../Auth/AuthModal';
import ProfileDropdown from '../User/ProfileDropdown';
import Drawer from './Drawer';
import SearchBar from '../Search/SearchBar';

const Navbar = () => {
  const { user, setShowAuthModal } = useAuth();
  const { getCartItemsCount } = useCart();
  const { language, changeLanguage } = useTheme();
  const [showSearch, setShowSearch] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <nav className="sticky top-0 z-40 bg-dark-surface/80 backdrop-blur-md border-b border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent"
              >
                TRY-ON
              </motion.div>
            </Link>

            {/* Desktop Search */}
            <div className="hidden md:flex flex-1 max-w-xl mx-8">
              <SearchBar />
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              {/* Mobile Search */}
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="md:hidden p-2 hover:bg-dark-card rounded-lg transition-colors"
              >
                <FiSearch size={20} />
              </button>

              {/* Language Selector */}
              <select
                value={language}
                onChange={(e) => changeLanguage(e.target.value)}
                className="hidden md:block bg-dark-card border border-dark-border rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="en">EN</option>
                <option value="es">ES</option>
                <option value="fr">FR</option>
              </select>

              {/* Cart */}
              <button
                onClick={() => navigate('/cart')}
                className="relative p-2 hover:bg-dark-card rounded-lg transition-colors"
              >
                <FiShoppingCart size={20} />
                {getCartItemsCount() > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                  >
                    {getCartItemsCount()}
                  </motion.span>
                )}
              </button>

              {/* User Menu */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                    className="p-2 hover:bg-dark-card rounded-lg transition-colors"
                  >
                    <FiUser size={20} />
                  </button>
                  {showProfileDropdown && (
                    <ProfileDropdown onClose={() => setShowProfileDropdown(false)} />
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  Login
                </button>
              )}

              {/* Mobile Menu */}
              <button
                onClick={() => setShowDrawer(true)}
                className="md:hidden p-2 hover:bg-dark-card rounded-lg transition-colors"
              >
                <FiMenu size={20} />
              </button>
            </div>
          </div>

          {/* Mobile Search Bar */}
          {showSearch && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden pb-4"
            >
              <SearchBar />
            </motion.div>
          )}
        </div>
      </nav>

      <AuthModal />
      <Drawer isOpen={showDrawer} onClose={() => setShowDrawer(false)} />
    </>
  );
};

export default Navbar;

