import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [wishlistItems, setWishlistItems] = useState(new Set());

  // Fetch wishlist
  const fetchWishlist = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const response = await axios.get('/api/wishlist');
      const products = response.data.wishlist?.products || [];
      setWishlist(products);
      setWishlistItems(new Set(products.map(item => item.product?._id || item.product)));
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  // Check if product is in wishlist
  const checkWishlistStatus = async (productId) => {
    if (!user) return false;
    
    try {
      const response = await axios.get(`/api/wishlist/check/${productId}`);
      return response.data.isInWishlist;
    } catch (error) {
      return false;
    }
  };

  // Add to wishlist
  const addToWishlist = async (productId) => {
    if (!user) {
      toast.error('Please login to add items to wishlist');
      return false;
    }

    try {
      await axios.post(`/api/wishlist/${productId}`);
      await fetchWishlist();
      toast.success('Added to wishlist!', {
        icon: '❤️',
        style: {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: '12px',
          padding: '16px',
        }
      });
      return true;
    } catch (error) {
      if (error.response?.status === 400) {
        toast.error('Already in wishlist');
      } else {
        toast.error('Failed to add to wishlist');
      }
      return false;
    }
  };

  // Remove from wishlist
  const removeFromWishlist = async (productId) => {
    if (!user) return false;

    try {
      await axios.delete(`/api/wishlist/${productId}`);
      await fetchWishlist();
      toast.success('Removed from wishlist', {
        icon: '💔',
        style: {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: '12px',
          padding: '16px',
        }
      });
      return true;
    } catch (error) {
      toast.error('Failed to remove from wishlist');
      return false;
    }
  };

  // Toggle wishlist
  const toggleWishlist = async (productId) => {
    const isInWishlist = wishlistItems.has(productId);
    if (isInWishlist) {
      return await removeFromWishlist(productId);
    } else {
      return await addToWishlist(productId);
    }
  };

  useEffect(() => {
    if (user) {
      fetchWishlist();
    } else {
      setWishlist([]);
      setWishlistItems(new Set());
    }
  }, [user]);

  const value = {
    wishlist,
    wishlistItems,
    loading,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    checkWishlistStatus,
    fetchWishlist,
    wishlistCount: wishlist.length
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

