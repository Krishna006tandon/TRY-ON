import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiShoppingCart, FiEye } from 'react-icons/fi';
import { useCart } from '../../contexts/CartContext';
import QuickViewModal from './QuickViewModal';
import { useState } from 'react';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const [showQuickView, setShowQuickView] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5 }}
        className="bg-dark-card rounded-lg overflow-hidden border border-dark-border group"
      >
        <Link to={`/products/${product._id}`}>
          <div className="relative aspect-square overflow-hidden bg-dark-surface">
            <img
              src={product.images[0]?.url || '/placeholder.jpg'}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
            {product.originalPrice && (
              <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
              </span>
            )}
          </div>
        </Link>

        <div className="p-4">
          <Link to={`/products/${product._id}`}>
            <h3 className="font-semibold mb-2 hover:text-blue-500 transition-colors line-clamp-2">
              {product.name}
            </h3>
          </Link>

          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-lg font-bold">${product.price}</span>
              {product.originalPrice && (
                <span className="text-sm text-dark-muted line-through ml-2">
                  ${product.originalPrice}
                </span>
              )}
            </div>
            {product.ratings?.average > 0 && (
              <div className="flex items-center space-x-1">
                <span className="text-yellow-500">★</span>
                <span className="text-sm">{product.ratings.average.toFixed(1)}</span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => addToCart(product)}
              className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 py-2 rounded-lg transition-colors"
            >
              <FiShoppingCart size={18} />
              <span>Add to Cart</span>
            </button>
            <button
              onClick={() => setShowQuickView(true)}
              className="p-2 bg-dark-surface hover:bg-dark-border rounded-lg transition-colors"
            >
              <FiEye size={18} />
            </button>
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

