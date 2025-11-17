import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiShoppingCart, FiEye } from 'react-icons/fi';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import QuickViewModal from './QuickViewModal';
import WishlistButton from './WishlistButton';
import { useState } from 'react';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const [showQuickView, setShowQuickView] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        whileHover={{ y: -12, scale: 1.02 }}
        transition={{ 
          type: "spring",
          stiffness: 300,
          damping: 20
        }}
        className="group relative"
      >
        <div className="glass-strong rounded-3xl overflow-hidden border border-white/10 card-hover relative">
          {/* Gradient Border Glow on Hover */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500/0 via-blue-500/0 to-purple-500/0 group-hover:from-purple-500/20 group-hover:via-blue-500/20 group-hover:to-purple-500/20 transition-all duration-500 opacity-0 group-hover:opacity-100 -z-10 blur-xl" />
          
          <Link to={`/products/${product._id}`}>
            <div className="relative aspect-square overflow-hidden">
              <motion.img
                src={product.images[0]?.url || '/placeholder.jpg'}
                alt={product.name}
                className="w-full h-full object-cover"
                whileHover={{ scale: 1.15 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Discount Badge */}
              {product.originalPrice && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-4 left-4 px-3 py-1.5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full shadow-lg backdrop-blur-sm"
                >
                  {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                </motion.span>
              )}

              {/* Wishlist Button */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                whileHover={{ opacity: 1, scale: 1 }}
                className="absolute top-4 right-4"
              >
                <WishlistButton productId={product._id} size="sm" />
              </motion.div>

              {/* Quick View Button */}
              <motion.button
                onClick={(e) => {
                  e.preventDefault();
                  setShowQuickView(true);
                }}
                initial={{ opacity: 0, y: 10 }}
                whileHover={{ opacity: 1, y: 0 }}
                className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-6 py-2 glass rounded-full text-white font-medium text-sm backdrop-blur-xl border border-white/20 hover:border-white/40 transition-all duration-300"
              >
                <span className="flex items-center gap-2">
                  <FiEye size={16} />
                  Quick View
                </span>
              </motion.button>
            </div>
          </Link>

          <div className="p-6">
            <Link to={`/products/${product._id}`}>
              <h3 className="font-bold text-lg mb-3 text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-blue-400 group-hover:bg-clip-text transition-all duration-300 line-clamp-2">
                {product.name}
              </h3>
            </Link>

            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-2xl font-extrabold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  ${product.price}
                </span>
                {product.originalPrice && (
                  <span className="text-sm text-gray-500 line-through ml-2">
                    ${product.originalPrice}
                  </span>
                )}
              </div>
              {product.ratings?.average > 0 && (
                <div className="flex items-center space-x-1 px-2 py-1 glass rounded-full">
                  <span className="text-yellow-400 text-sm">★</span>
                  <span className="text-sm font-medium">{product.ratings.average.toFixed(1)}</span>
                </div>
              )}
            </div>

            <motion.button
              onClick={() => addToCart(product)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3.5 btn-premium rounded-xl text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-purple-500/30"
            >
              <FiShoppingCart size={20} />
              <span>Add to Cart</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {showQuickView && (
        <QuickViewModal
          product={product}
          onClose={() => setShowQuickView(false)}
        />
      )}
    </>
  );
};

export default ProductCard;

