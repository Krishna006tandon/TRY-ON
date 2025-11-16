import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUser, FiShoppingBag, FiSettings, FiLogOut, FiShield } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';

const ProfileDropdown = ({ onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    onClose();
    navigate('/');
  };

  const menuItems = [
    { icon: FiUser, label: 'Profile', path: '/profile' },
    { icon: FiShoppingBag, label: 'Orders', path: '/orders' },
    { icon: FiSettings, label: 'Settings', path: '/profile' },
  ];

  if (user?.role === 'admin') {
    menuItems.push({ icon: FiShield, label: 'Admin Dashboard', path: '/admin' });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="absolute right-0 mt-2 w-48 bg-dark-card border border-dark-border rounded-lg shadow-xl py-2 z-50"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="px-4 py-2 border-b border-dark-border">
        <p className="text-sm font-semibold">{user?.name}</p>
        <p className="text-xs text-dark-muted">{user?.email}</p>
      </div>

      {menuItems.map((item, index) => (
        <Link
          key={index}
          to={item.path}
          onClick={onClose}
          className="flex items-center space-x-2 px-4 py-2 hover:bg-dark-surface transition-colors"
        >
          <item.icon size={16} />
          <span className="text-sm">{item.label}</span>
        </Link>
      ))}

      <button
        onClick={handleLogout}
        className="w-full flex items-center space-x-2 px-4 py-2 hover:bg-dark-surface transition-colors text-red-500"
      >
        <FiLogOut size={16} />
        <span className="text-sm">Logout</span>
      </button>
    </motion.div>
  );
};

export default ProfileDropdown;

