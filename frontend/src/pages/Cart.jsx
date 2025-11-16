import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMinus, FiPlus, FiTrash2, FiShoppingBag } from 'react-icons/fi';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import CartDrawer from '../components/Cart/CartDrawer';
import Chatbot from '../components/Chatbot/Chatbot';

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    setCouponLoading(true);
    setCouponError('');
    
    try {
      const totalAmount = getCartTotal();
      const response = await axios.post('/api/coupons/validate', {
        code: couponCode,
        totalAmount,
        userId: user?._id,
        items: cartItems.map(item => ({
          product: item.product._id || item.product,
          quantity: item.quantity
        }))
      });

      setAppliedCoupon(response.data);
      toast.success('Coupon applied successfully!');
    } catch (error) {
      setCouponError(error.response?.data?.message || 'Invalid coupon code');
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    setAppliedCoupon(null);
    setCouponError('');
  };

  const handleCheckout = async () => {
    if (!user) {
      toast.error('Please login to checkout');
      return;
    }

    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setLoading(true);
    try {
      const defaultAddress = user.addresses?.find(addr => addr.isDefault) || user.addresses?.[0];

      const orderData = {
        items: cartItems.map(item => ({
          product: item.product._id,
          quantity: item.quantity
        })),
        shippingAddress: defaultAddress || {
          street: '123 Main St',
          city: 'City',
          state: 'State',
          zipCode: '12345',
          country: 'Country'
        },
        paymentMethod: 'cod',
        couponCode: appliedCoupon?.coupon?.code || null
      };

      const response = await axios.post('/api/orders', orderData);
      clearCart();
      toast.success('Order placed successfully!');
      navigate(`/orders/${response.data.order._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    const subtotal = getCartTotal();
    const discount = appliedCoupon?.discount || 0;
    return Math.max(0, subtotal - discount);
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <FiShoppingBag size={64} className="mx-auto text-dark-muted mb-4" />
            <p className="text-xl text-dark-muted mb-4">Your cart is empty</p>
            <button
              onClick={() => navigate('/products')}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <motion.div
                  key={item.product._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-dark-card p-6 rounded-lg border border-dark-border"
                >
                  <div className="flex space-x-4">
                    <img
                      src={item.product.images[0]?.url || '/placeholder.jpg'}
                      alt={item.product.name}
                      className="w-24 h-24 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold mb-2">{item.product.name}</h3>
                      <p className="text-blue-500 font-semibold mb-4">${item.product.price}</p>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                            className="w-8 h-8 bg-dark-surface hover:bg-dark-border rounded"
                          >
                            <FiMinus size={16} />
                          </button>
                          <span className="w-12 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                            className="w-8 h-8 bg-dark-surface hover:bg-dark-border rounded"
                          >
                            <FiPlus size={16} />
                          </button>
                        </div>
                        <span className="text-lg font-semibold">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </span>
                        <button
                          onClick={() => removeFromCart(item.product._id)}
                          className="ml-auto p-2 hover:bg-red-500/20 rounded text-red-500"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="bg-dark-card p-6 rounded-lg border border-dark-border h-fit">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              
              {/* Coupon Section */}
              <div className="mb-4">
                {!appliedCoupon ? (
                  <div className="space-y-2">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => {
                          setCouponCode(e.target.value.toUpperCase());
                          setCouponError('');
                        }}
                        placeholder="Enter coupon code"
                        className="flex-1 px-4 py-2 bg-dark-surface border border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={handleApplyCoupon}
                        disabled={couponLoading}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-colors disabled:opacity-50"
                      >
                        {couponLoading ? '...' : 'Apply'}
                      </button>
                    </div>
                    {couponError && (
                      <p className="text-red-500 text-sm">{couponError}</p>
                    )}
                  </div>
                ) : (
                  <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-green-500 font-semibold">{appliedCoupon.coupon.code}</p>
                        <p className="text-sm text-dark-muted">Discount: ${appliedCoupon.discount.toFixed(2)}</p>
                      </div>
                      <button
                        onClick={handleRemoveCoupon}
                        className="text-red-500 hover:text-red-400"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${getCartTotal().toFixed(2)}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-green-500">
                    <span>Discount ({appliedCoupon.coupon.code})</span>
                    <span>-${appliedCoupon.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="border-t border-dark-border pt-2 flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="p-3 bg-dark-surface rounded-lg border border-dark-border">
                  <p className="text-sm text-dark-muted mb-1">Payment Method</p>
                  <p className="font-semibold">Cash on Delivery (COD)</p>
                  <p className="text-xs text-dark-muted mt-1">Pay when you receive your order</p>
                </div>
                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Place Order (COD)'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Chatbot />
      <CartDrawer />
    </div>
  );
};

export default Cart;

