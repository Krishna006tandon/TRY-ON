import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiX, FiHome, FiShoppingBag, FiUser, FiShoppingCart, FiSettings } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';

const Drawer = ({ isOpen, onClose }) => {
  const { user, logout, setShowAuthModal } = useAuth();

  const menuItems = [
    { icon: FiHome, label: 'Home', path: '/' },
    { icon: FiShoppingBag, label: 'Products', path: '/products' },
    { icon: FiShoppingCart, label: 'Cart', path: '/cart' },
  ];

  if (user) {
    menuItems.push(
      { icon: FiUser, label: 'Profile', path: '/profile' },
      { icon: FiSettings, label: 'Orders', path: '/orders' }
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 h-full w-80 bg-dark-surface border-r border-dark-border z-50 overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold">Menu</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-dark-card rounded-lg transition-colors"
                >
                  <FiX size={24} />
                </button>
              </div>

              <nav className="space-y-2">
                {menuItems.map((item, index) => (
                  <Link
                    key={index}
                    to={item.path}
                    onClick={onClose}
                    className="flex items-center space-x-3 p-3 hover:bg-dark-card rounded-lg transition-colors"
                  >
                    <item.icon size={20} />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>

              <div className="mt-8 pt-8 border-t border-dark-border">
                {user ? (
                  <button
                    onClick={() => {
                      logout();
                      onClose();
                    }}
                    className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                  >
                    Logout
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setShowAuthModal(true);
                      onClose();
                    }}
                    className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                  >
                    Login
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Drawer;

