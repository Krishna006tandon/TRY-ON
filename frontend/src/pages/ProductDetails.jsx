import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { FiShoppingCart, FiArrowLeft } from 'react-icons/fi';
import { useCart } from '../contexts/CartContext';
import CartDrawer from '../components/Cart/CartDrawer';
import Chatbot from '../components/Chatbot/Chatbot';
import Model3DViewer from '../components/Product/Model3DViewer';
import toast from 'react-hot-toast';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [show3DModel, setShow3DModel] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`/api/products/${id}`);
      setProduct(response.data.product);
    } catch (error) {
      toast.error('Product not found');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    toast.success('Added to cart!');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-dark-muted hover:text-white mb-6 transition-colors"
        >
          <FiArrowLeft />
          <span>Back</span>
        </button>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Images */}
          <div>
            {product.images && product.images.length > 0 ? (
              <>
                <div className="aspect-square bg-dark-surface rounded-lg overflow-hidden mb-4 border border-dark-border">
                  <img
                    src={product.images[selectedImage]?.url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                {product.images.length > 1 && (
                  <div className="flex space-x-2 overflow-x-auto pb-2">
                    {product.images.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                          selectedImage === index ? 'border-blue-500 scale-105' : 'border-dark-border hover:border-blue-300'
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
              </>
            ) : (
              <div className="aspect-square bg-dark-surface rounded-lg overflow-hidden mb-4 border border-dark-border flex items-center justify-center">
                <div className="text-center text-dark-muted">
                  <p className="text-lg mb-2">No Image Available</p>
                  <p className="text-sm">Please add images in admin panel</p>
                </div>
              </div>
            )}
            {product.model3d?.status === 'completed' && (
              <motion.button
                onClick={() => setShow3DModel(true)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mt-4 w-full bg-purple-600 hover:bg-purple-700 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
              >
                <span>🎮</span>
                <span>View 3D Model</span>
              </motion.button>
            )}
            {product.model3d?.status === 'processing' && (
              <div className="mt-4 w-full bg-yellow-500/20 border border-yellow-500/50 py-3 rounded-lg text-center">
                <p className="text-yellow-500 text-sm">3D Model is being generated...</p>
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <h1 className="text-4xl font-bold mb-4">{product.name}</h1>

            {product.ratings?.average > 0 && (
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-yellow-500 text-xl">★</span>
                <span className="text-lg">{product.ratings.average.toFixed(1)}</span>
                <span className="text-dark-muted">({product.ratings.count} reviews)</span>
              </div>
            )}

            <div className="mb-6">
              <span className="text-4xl font-bold">${product.price}</span>
              {product.originalPrice && (
                <span className="text-2xl text-dark-muted line-through ml-4">
                  ${product.originalPrice}
                </span>
              )}
            </div>

            <p className="text-dark-muted mb-8 leading-relaxed">{product.description}</p>

            {product.stock > 0 ? (
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <span>Quantity:</span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 bg-dark-surface hover:bg-dark-border rounded"
                    >
                      -
                    </button>
                    <span className="w-12 text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="w-10 h-10 bg-dark-surface hover:bg-dark-border rounded"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-dark-muted">({product.stock} available)</span>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 py-4 rounded-lg font-semibold transition-colors"
                >
                  <FiShoppingCart size={20} />
                  <span>Add to Cart</span>
                </button>
              </div>
            ) : (
              <div className="text-red-500 font-semibold text-lg">Out of Stock</div>
            )}
          </div>
        </div>
      </div>

      {show3DModel && (
        <Model3DViewer
          productId={product._id}
          onClose={() => setShow3DModel(false)}
        />
      )}

      <Chatbot />
      <CartDrawer />
    </div>
  );
};

export default ProductDetails;

