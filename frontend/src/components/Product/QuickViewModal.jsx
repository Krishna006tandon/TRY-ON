import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import { useCart } from '../../contexts/CartContext';
import Model3DViewer from './Model3DViewer';
import { useState } from 'react';

const QuickViewModal = ({ product, onClose }) => {
  const { addToCart } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [show3DModel, setShow3DModel] = useState(false);

  if (!product) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-dark-card rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-dark-border"
        >
          <div className="relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 bg-dark-surface/80 hover:bg-dark-surface rounded-full transition-colors"
            >
              <FiX size={24} />
            </button>

            <div className="grid md:grid-cols-2 gap-6 p-6">
              {/* Images */}
              <div>
                <div className="aspect-square bg-dark-surface rounded-lg overflow-hidden mb-4">
                  <img
                    src={product.images[selectedImage]?.url || '/placeholder.jpg'}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                {product.images.length > 1 && (
                  <div className="flex space-x-2">
                    {product.images.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${
                          selectedImage === index ? 'border-blue-500' : 'border-dark-border'
                        }`}
                      >
                        <img
                          src={img.url}
                          alt={`${product.name} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Details */}
              <div>
                <h2 className="text-2xl font-bold mb-2">{product.name}</h2>
                {product.ratings?.average > 0 && (
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="text-yellow-500">★</span>
                    <span>{product.ratings.average.toFixed(1)}</span>
                    <span className="text-dark-muted">({product.ratings.count} reviews)</span>
                  </div>
                )}

                <div className="mb-4">
                  <span className="text-3xl font-bold">${product.price}</span>
                  {product.originalPrice && (
                    <span className="text-lg text-dark-muted line-through ml-2">
                      ${product.originalPrice}
                    </span>
                  )}
                </div>

                <p className="text-dark-muted mb-6">{product.description}</p>

                {product.stock > 0 ? (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <span className="text-sm">Quantity:</span>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="w-8 h-8 bg-dark-surface hover:bg-dark-border rounded"
                        >
                          -
                        </button>
                        <span className="w-12 text-center">{quantity}</span>
                        <button
                          onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                          className="w-8 h-8 bg-dark-surface hover:bg-dark-border rounded"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        for (let i = 0; i < quantity; i++) {
                          addToCart(product);
                        }
                        onClose();
                      }}
                      className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-semibold transition-colors"
                    >
                      Add to Cart
                    </button>
                    {product.model3d?.status === 'completed' && (
                      <button
                        onClick={() => setShow3DModel(true)}
                        className="w-full mt-2 bg-purple-600 hover:bg-purple-700 py-3 rounded-lg font-semibold transition-colors"
                      >
                        View 3D Model
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="text-red-500 font-semibold">Out of Stock</div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {show3DModel && (
        <Model3DViewer
          productId={product._id}
          onClose={() => setShow3DModel(false)}
        />
      )}
    </AnimatePresence>
  );
};

export default QuickViewModal;

