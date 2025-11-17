import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMinus, FiPlus, FiTrash2, FiShoppingBag, FiMapPin } from 'react-icons/fi';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import CartDrawer from '../components/Cart/CartDrawer';
import Chatbot from '../components/Chatbot/Chatbot';

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCart();
  const { user, fetchUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressSaving, setAddressSaving] = useState(false);
  const [addressForm, setAddressForm] = useState({
    type: 'home',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    isDefault: true
  });

  const hasAddresses = Boolean(user?.addresses?.length);
  const defaultAddress = hasAddresses
    ? user.addresses.find(addr => addr.isDefault) || user.addresses[0]
    : null;
  const subtotal = getCartTotal();

  useEffect(() => {
    const fetchAvailableCoupons = async () => {
      if (!user) {
        setAvailableCoupons([]);
        return;
      }
      try {
        const response = await axios.get('/api/coupons/available');
        setAvailableCoupons(response.data.coupons || []);
      } catch (error) {
        console.error('Error fetching coupons:', error);
      }
    };

    fetchAvailableCoupons();
  }, [user]);

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

  const handleSelectCoupon = (code) => {
    if (!code) return;
    setCouponCode(code);
    setCouponError('');
    setAppliedCoupon(null);
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

    if (!defaultAddress) {
      toast.error('Please add a shipping address before checkout');
      setShowAddressForm(true);
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        items: cartItems.map(item => ({
          product: item.product._id,
          quantity: item.quantity
        })),
        shippingAddress: {
          type: defaultAddress.type || 'home',
          street: defaultAddress.street,
          city: defaultAddress.city,
          state: defaultAddress.state,
          zipCode: defaultAddress.zipCode,
          country: defaultAddress.country
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
    const discount = appliedCoupon?.discount || 0;
    return Math.max(0, subtotal - discount);
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to add an address');
      return;
    }

    setAddressSaving(true);
    try {
      const payload = {
        ...addressForm,
        isDefault: hasAddresses ? addressForm.isDefault : true
      };
      await axios.post('/api/user/address', payload);
      toast.success('Address saved');
      await fetchUser();
      setShowAddressForm(false);
      setAddressForm({
        type: 'home',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'India',
        isDefault: !hasAddresses
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save address');
    } finally {
      setAddressSaving(false);
    }
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

              <div className="mb-4 p-4 bg-dark-surface border border-dark-border rounded-lg">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-dark-muted mb-2 flex items-center gap-2">
                      <FiMapPin className="text-blue-400" />
                      Shipping Address
                    </p>
                    {defaultAddress ? (
                      <div className="space-y-1">
                        <p className="font-semibold capitalize">{defaultAddress.type || 'home'}</p>
                        <p className="text-sm text-dark-muted">
                          {defaultAddress.street}, {defaultAddress.city}
                        </p>
                        <p className="text-sm text-dark-muted">
                          {defaultAddress.state} {defaultAddress.zipCode}, {defaultAddress.country}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-red-400">No shipping address on file.</p>
                    )}
                  </div>
                  <button
                    onClick={() => setShowAddressForm(!showAddressForm)}
                    className="text-blue-500 hover:text-blue-400 text-sm font-semibold"
                  >
                    {defaultAddress ? 'Change' : 'Add'}
                  </button>
                </div>
              </div>

              {showAddressForm && (
                <form onSubmit={handleSaveAddress} className="mb-4 space-y-3 bg-dark-surface border border-dark-border rounded-lg p-4">
                  <div className="grid grid-cols-1 gap-3">
                    <select
                      value={addressForm.type}
                      onChange={(e) => setAddressForm(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full px-4 py-2 bg-dark-surface border border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="home">Home</option>
                      <option value="work">Work</option>
                      <option value="other">Other</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Street Address"
                      value={addressForm.street}
                      onChange={(e) => setAddressForm(prev => ({ ...prev, street: e.target.value }))}
                      className="w-full px-4 py-2 bg-dark-surface border border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="City"
                        value={addressForm.city}
                        onChange={(e) => setAddressForm(prev => ({ ...prev, city: e.target.value }))}
                        className="w-full px-4 py-2 bg-dark-surface border border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                      <input
                        type="text"
                        placeholder="State"
                        value={addressForm.state}
                        onChange={(e) => setAddressForm(prev => ({ ...prev, state: e.target.value }))}
                        className="w-full px-4 py-2 bg-dark-surface border border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Postal Code"
                        value={addressForm.zipCode}
                        onChange={(e) => setAddressForm(prev => ({ ...prev, zipCode: e.target.value }))}
                        className="w-full px-4 py-2 bg-dark-surface border border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Country"
                        value={addressForm.country}
                        onChange={(e) => setAddressForm(prev => ({ ...prev, country: e.target.value }))}
                        className="w-full px-4 py-2 bg-dark-surface border border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-sm text-dark-muted">
                    <input
                      type="checkbox"
                      checked={addressForm.isDefault || !hasAddresses}
                      onChange={(e) => setAddressForm(prev => ({ ...prev, isDefault: e.target.checked }))}
                    />
                    Set as default shipping address
                  </label>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={addressSaving}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50"
                    >
                      {addressSaving ? 'Saving...' : 'Save Address'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddressForm(false)}
                      className="px-4 py-2 border border-dark-border rounded-lg text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
              
              {/* Coupon Section */}
              <div className="mb-4 space-y-3">
                {availableCoupons.length > 0 && !appliedCoupon && (
                  <div>
                    <label className="text-sm text-dark-muted block mb-1">
                      Available Coupons
                    </label>
                    <select
                      value=""
                      onChange={(e) => handleSelectCoupon(e.target.value)}
                      className="w-full px-4 py-2 bg-dark-surface border border-dark-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Choose a coupon</option>
                      {availableCoupons.map((coupon) => {
                        const eligible = subtotal >= (coupon.minPurchase || 0);
                        const label = `${coupon.code} • ${coupon.discountType === 'percentage' ? `${coupon.discountValue}% off` : `$${coupon.discountValue} off`}`;
                        return (
                          <option
                            key={coupon.code}
                            value={coupon.code}
                            disabled={!eligible}
                          >
                            {label} {eligible ? '' : `(min $${coupon.minPurchase})`}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )}

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

