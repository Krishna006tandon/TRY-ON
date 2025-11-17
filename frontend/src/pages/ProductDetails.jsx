import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { FiShoppingCart, FiArrowLeft, FiStar, FiMinus, FiPlus } from 'react-icons/fi';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import CartDrawer from '../components/Cart/CartDrawer';
import Chatbot from '../components/Chatbot/Chatbot';
import Model3DViewer from '../components/Product/Model3DViewer';
import WishlistButton from '../components/Product/WishlistButton';
import toast from 'react-hot-toast';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { wishlistItems } = useWishlist();
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
        <div className="relative">
          <div className="w-20 h-20 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="min-h-screen py-12 px-4 relative">
      <div className="max-w-7xl mx-auto">
        <motion.button
          onClick={() => navigate(-1)}
          whileHover={{ x: -5 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center space-x-2 text-gray-400 hover:text-white mb-8 transition-colors glass px-4 py-2 rounded-full"
        >
          <FiArrowLeft size={18} />
          <span className="font-medium">Back</span>
        </motion.button>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Images */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            {product.images && product.images.length > 0 ? (
              <>
                <div className="relative glass-strong rounded-3xl overflow-hidden mb-6 border border-white/10 group">
                  <motion.img
                    src={product.images[selectedImage]?.url}
                    alt={product.name}
                    className="w-full aspect-square object-cover"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.4 }}
                  />
                  {/* Wishlist Button */}
                  <div className="absolute top-6 right-6">
                    <WishlistButton productId={product._id} size="md" />
                  </div>
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                {product.images.length > 1 && (
                  <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
                    {product.images.map((img, index) => (
                      <motion.button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className={`flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all ${
                          selectedImage === index 
                            ? 'border-purple-500 scale-110 shadow-lg shadow-purple-500/50' 
                            : 'border-white/20 hover:border-white/40 glass'
                        }`}
                      >
                        <img
                          src={img.url}
                          alt={`${product.name} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </motion.button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="aspect-square glass-strong rounded-3xl overflow-hidden mb-4 border border-white/10 flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <p className="text-lg mb-2">No Image Available</p>
                  <p className="text-sm">Please add images in admin panel</p>
                </div>
              </div>
            )}
            {product.model3d?.status === 'completed' && (
              <motion.button
                onClick={() => setShow3DModel(true)}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="mt-6 w-full btn-premium py-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2 shadow-lg shadow-purple-500/30"
              >
                <span className="text-2xl">🎮</span>
                <span>View 3D Model</span>
              </motion.button>
            )}
            {product.model3d?.status === 'processing' && (
              <div className="mt-6 w-full glass border border-yellow-500/30 py-4 rounded-xl text-center">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-yellow-400 font-medium">3D Model is being generated...</p>
                </div>
              </div>
            )}
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass-strong rounded-3xl p-8 border border-white/10"
          >
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6 gradient-text leading-tight">
              {product.name}
            </h1>

            {product.ratings?.average > 0 && (
              <div className="flex items-center space-x-3 mb-6">
                <div className="flex items-center gap-1 px-3 py-1.5 glass rounded-full">
                  <FiStar className="text-yellow-400 fill-yellow-400" size={20} />
                  <span className="text-lg font-bold ml-1">{product.ratings.average.toFixed(1)}</span>
                </div>
                <span className="text-gray-400">({product.ratings.count} reviews)</span>
              </div>
            )}

            <div className="mb-8">
              <div className="flex items-baseline gap-4">
                <span className="text-5xl font-extrabold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  ${product.price}
                </span>
                {product.originalPrice && (
                  <>
                    <span className="text-2xl text-gray-500 line-through">
                      ${product.originalPrice}
                    </span>
                    <span className="px-3 py-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm font-bold rounded-full">
                      {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                    </span>
                  </>
                )}
              </div>
            </div>

            <p className="text-gray-300 mb-10 leading-relaxed text-lg">{product.description}</p>

            {product.stock > 0 ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between glass rounded-2xl p-4">
                  <span className="text-gray-300 font-medium">Quantity:</span>
                  <div className="flex items-center space-x-3">
                    <motion.button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-12 h-12 glass rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors"
                    >
                      <FiMinus size={20} />
                    </motion.button>
                    <span className="w-16 text-center text-2xl font-bold">{quantity}</span>
                    <motion.button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-12 h-12 glass rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors"
                    >
                      <FiPlus size={20} />
                    </motion.button>
                  </div>
                  <span className="text-gray-400 text-sm">({product.stock} available)</span>
                </div>

                <motion.button
                  onClick={handleAddToCart}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full btn-premium py-5 rounded-xl text-white font-bold text-lg flex items-center justify-center gap-3 shadow-2xl shadow-purple-500/40"
                >
                  <FiShoppingCart size={24} />
                  <span>Add to Cart</span>
                </motion.button>
              </div>
            ) : (
              <div className="glass border border-red-500/30 rounded-2xl p-6 text-center">
                <p className="text-red-400 font-bold text-xl">Out of Stock</p>
              </div>
            )}
          </motion.div>
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

