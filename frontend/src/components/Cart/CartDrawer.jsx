import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { FiX, FiMinus, FiPlus, FiTrash2 } from 'react-icons/fi';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';

const CartDrawer = () => {
  const { cartItems, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, getCartTotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!user) {
      // Show auth modal
      return;
    }
    setIsCartOpen(false);
    navigate('/cart');
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/50 z-50"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full md:w-96 bg-dark-surface border-l border-dark-border z-50 flex flex-col"
          >
            <div className="p-6 border-b border-dark-border">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Shopping Cart</h2>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 hover:bg-dark-card rounded-lg transition-colors"
                >
                  <FiX size={24} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {cartItems.length === 0 ? (
                <div className="text-center text-dark-muted py-12">
                  <p>Your cart is empty</p>
                  <Link
                    to="/products"
                    onClick={() => setIsCartOpen(false)}
                    className="text-blue-500 hover:text-blue-400 mt-4 inline-block"
                  >
                    Continue Shopping
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.product._id} className="flex space-x-4 bg-dark-card p-4 rounded-lg">
                      <img
                        src={item.product.images[0]?.url || '/placeholder.jpg'}
                        alt={item.product.name}
                        className="w-20 h-20 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm mb-1 line-clamp-2">{item.product.name}</h3>
                        <p className="text-blue-500 font-semibold">${item.product.price}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <button
                            onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                            className="p-1 hover:bg-dark-surface rounded"
                          >
                            <FiMinus size={14} />
                          </button>
                          <span className="w-8 text-center text-sm">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                            className="p-1 hover:bg-dark-surface rounded"
                          >
                            <FiPlus size={14} />
                          </button>
                          <button
                            onClick={() => removeFromCart(item.product._id)}
                            className="ml-auto p-1 hover:bg-red-500/20 rounded text-red-500"
                          >
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="p-6 border-t border-dark-border space-y-4">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total:</span>
                  <span>${getCartTotal().toFixed(2)}</span>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-semibold transition-colors"
                >
                  Checkout
                </button>
                <Link
                  to="/cart"
                  onClick={() => setIsCartOpen(false)}
                  className="block text-center text-blue-500 hover:text-blue-400"
                >
                  View Full Cart
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;

