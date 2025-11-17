import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiSearch, FiShoppingCart, FiUser, FiMenu, FiX, FiHeart } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { useTheme } from '../../contexts/ThemeContext';
import AuthModal from '../Auth/AuthModal';
import ProfileDropdown from '../User/ProfileDropdown';
import Drawer from './Drawer';
import SearchBar from '../Search/SearchBar';

const Navbar = () => {
  const { user, setShowAuthModal } = useAuth();
  const { getCartItemsCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { language, changeLanguage } = useTheme();
  const [showSearch, setShowSearch] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <nav className="sticky top-0 z-50 glass border-b border-white/10 shadow-lg shadow-purple-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <motion.div
                whileHover={{ scale: 1.1, rotate: [0, -10, 10, -10, 0] }}
                whileTap={{ scale: 0.95 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative text-3xl font-black gradient-text px-4 py-2">
                  TRY-ON
                </div>
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

              {/* Wishlist */}
              {user && (
                <motion.button
                  onClick={() => navigate('/wishlist')}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="relative p-3 glass rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/30"
                >
                  <FiHeart size={22} className="text-red-400" />
                  {wishlistCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg"
                    >
                      {wishlistCount}
                    </motion.span>
                  )}
                </motion.button>
              )}

              {/* Cart */}
              <motion.button
                onClick={() => navigate('/cart')}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="relative p-3 glass rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30"
              >
                <FiShoppingCart size={22} className="text-blue-400" />
                {getCartItemsCount() > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.3 }}
                    className="absolute -top-1 -right-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg"
                  >
                    {getCartItemsCount()}
                  </motion.span>
                )}
              </motion.button>

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
                <motion.button
                  onClick={() => setShowAuthModal(true)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-2.5 btn-premium rounded-full font-semibold text-white shadow-lg shadow-purple-500/30"
                >
                  Login
                </motion.button>
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

