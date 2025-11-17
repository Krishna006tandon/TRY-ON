import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { FiHeart, FiShoppingBag, FiStar, FiArrowRight, FiTrash2 } from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const Wishlist = () => {
  const { wishlist, loading, removeFromWishlist, fetchWishlist } = useWishlist();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [hoveredIndex, setHoveredIndex] = useState(null);

  useEffect(() => {
    if (user) {
      fetchWishlist();
    }
  }, [user, fetchWishlist]);

  const handleAddToCart = async (product) => {
    try {
      await addToCart(product._id, 1);
      toast.success('Added to cart!', {
        icon: '🛒',
        style: {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: '12px',
        }
      });
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  const handleRemove = async (productId, e) => {
    e.stopPropagation();
    await removeFromWishlist(productId);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center backdrop-blur-xl bg-white/5 rounded-3xl p-12 border border-white/10 shadow-2xl">
          <FiHeart className="w-20 h-20 mx-auto mb-6 text-purple-400 animate-pulse" />
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-blue-400 to-purple-600 bg-clip-text text-transparent">
            Sign in to view your wishlist
          </h2>
          <p className="text-gray-400 mb-8">Save your favorite products for later</p>
          <button
            onClick={() => navigate('/')}
            className="px-8 py-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full text-white font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-105"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
            <FiStar className="absolute inset-0 m-auto w-8 h-8 text-purple-400 animate-pulse" />
        </div>
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-20">
        <div className="text-center backdrop-blur-xl bg-white/5 rounded-3xl p-16 border border-white/10 shadow-2xl max-w-md w-full">
          <div className="relative mb-8">
            <FiHeart className="w-24 h-24 mx-auto text-purple-400/50" />
            <FiStar className="absolute top-0 right-0 w-8 h-8 text-blue-400 animate-pulse" />
          </div>
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-blue-400 to-purple-600 bg-clip-text text-transparent">
            Your Wishlist is Empty
          </h2>
          <p className="text-gray-400 mb-8 text-lg">
            Start adding products you love to your wishlist
          </p>
          <button
            onClick={() => navigate('/products')}
            className="group px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full text-white font-semibold hover:shadow-xl hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-105 flex items-center gap-2 mx-auto"
          >
            <span>Explore Products</span>
            <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-12 text-center">
        <div className="inline-flex items-center gap-3 mb-4">
          <FiHeart className="w-8 h-8 text-red-500 fill-red-500 animate-pulse" style={{ fill: 'currentColor' }} />
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-purple-600 bg-clip-text text-transparent">
            My Wishlist
          </h1>
          <FiStar className="w-6 h-6 text-blue-400 animate-pulse" />
        </div>
        <p className="text-gray-400 text-lg">
          {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved
        </p>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {wishlist.map((item, index) => {
          const product = item.product || item;
          if (!product) return null;

          return (
            <div
              key={product._id || index}
              className="group relative"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div
                className={`
                  relative
                  backdrop-blur-xl
                  bg-gradient-to-br from-white/10 via-white/5 to-transparent
                  rounded-3xl
                  border border-white/10
                  overflow-hidden
                  transition-all duration-500
                  ${hoveredIndex === index 
                    ? 'transform scale-105 shadow-2xl shadow-purple-500/30 border-white/20' 
                    : 'shadow-lg shadow-purple-500/10'
                  }
                `}
                style={{
                  background: hoveredIndex === index
                    ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%)'
                    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
                }}
              >
                {/* Product Image */}
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={product.images?.[0]?.url || '/placeholder.jpg'}
                    alt={product.name}
                    className={`
                      w-full h-full object-cover
                      transition-transform duration-700
                      ${hoveredIndex === index ? 'scale-110' : 'scale-100'}
                    `}
                  />
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Remove Button */}
                  <button
                    onClick={(e) => handleRemove(product._id, e)}
                    className="absolute top-4 right-4 w-10 h-10 rounded-full backdrop-blur-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center hover:bg-red-500/30 transition-all duration-300 transform hover:scale-110 opacity-0 group-hover:opacity-100"
                  >
                    <FiTrash2 className="w-5 h-5 text-red-400" />
                  </button>

                  {/* Heart Icon */}
                  <div className="absolute top-4 left-4">
                    <FiHeart className="w-6 h-6 text-red-500 fill-red-500 animate-pulse" style={{ fill: 'currentColor' }} />
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 group-hover:text-purple-300 transition-colors">
                    {product.name}
                  </h3>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                        ${product.price}
                      </p>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <p className="text-sm text-gray-400 line-through">
                          ${product.originalPrice}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => navigate(`/products/${product._id}`)}
                      className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 text-white font-medium hover:from-purple-500/30 hover:to-blue-500/30 transition-all duration-300 transform hover:scale-105"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="px-4 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white font-medium hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
                    >
                      <FiShoppingBag className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Animated Border Glow */}
                {hoveredIndex === index && (
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-purple-500/20 animate-pulse pointer-events-none" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Wishlist;

