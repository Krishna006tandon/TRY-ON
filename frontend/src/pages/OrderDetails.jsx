import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiArrowLeft, FiFileText } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import Chatbot from '../components/Chatbot/Chatbot';
import TrackingTimeline from '../components/Order/TrackingTimeline';
import Invoice from '../components/Order/Invoice';

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showInvoice, setShowInvoice] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const response = await axios.get(`/api/orders/${id}`);
      setOrder(response.data.order);
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-500/20 text-green-500';
      case 'shipped':
      case 'out_for_delivery':
        return 'bg-blue-500/20 text-blue-500';
      case 'cancelled':
        return 'bg-red-500/20 text-red-500';
      default:
        return 'bg-yellow-500/20 text-yellow-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Order not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-dark-muted hover:text-white mb-6 transition-colors"
        >
          <FiArrowLeft />
          <span>Back to Orders</span>
        </button>

        <div className="bg-dark-card p-6 rounded-lg border border-dark-border mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Order #{order._id.slice(-8)}</h1>
            <div className="flex items-center space-x-4">
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                {order.status?.charAt(0).toUpperCase() + order.status?.slice(1).replace('_', ' ')}
              </span>
              <button
                onClick={() => setShowInvoice(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <FiFileText />
                <span>View Invoice</span>
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-dark-muted mb-1">Order Date</p>
              <p className="font-semibold">{new Date(order.createdAt).toLocaleString()}</p>
            </div>
            {order.trackingNumber && (
              <div>
                <p className="text-dark-muted mb-1">Tracking Number</p>
                <p className="font-mono font-semibold">{order.trackingNumber}</p>
              </div>
            )}
            {order.estimatedDelivery && (
              <div>
                <p className="text-dark-muted mb-1">Estimated Delivery</p>
                <p className="font-semibold">{new Date(order.estimatedDelivery).toLocaleDateString()}</p>
              </div>
            )}
          </div>
        </div>

        {/* Tracking Timeline */}
        <TrackingTimeline order={order} />

        <div className="bg-dark-card p-6 rounded-lg border border-dark-border mb-6">
          <h2 className="text-xl font-bold mb-4">Order Items</h2>
          <div className="space-y-4">
            {order.items.map((item, index) => (
              <div key={index} className="flex space-x-4">
                <img
                  src={item.product?.images[0]?.url || '/placeholder.jpg'}
                  alt={item.product?.name}
                  className="w-20 h-20 object-cover rounded"
                />
                <div className="flex-1">
                  <h3 className="font-semibold">{item.product?.name}</h3>
                  <p className="text-dark-muted">Quantity: {item.quantity}</p>
                  <p className="text-blue-500 font-semibold">${item.price.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-dark-card p-6 rounded-lg border border-dark-border">
          <h2 className="text-xl font-bold mb-4">Order Summary</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${order.totalAmount?.toFixed(2)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-green-500">
                <span>Discount {order.couponCode && `(${order.couponCode})`}</span>
                <span>-${order.discount?.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>${order.shippingCost?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="border-t border-dark-border pt-2 flex justify-between text-lg font-semibold">
              <span>Total</span>
              <span>${order.finalAmount?.toFixed(2)}</span>
            </div>
            <div className="mt-4 pt-4 border-t border-dark-border">
              <p className="text-sm text-dark-muted mb-1">Payment Method</p>
              <p className="font-semibold capitalize">{order.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : order.paymentMethod}</p>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showInvoice && (
          <Invoice
            order={order}
            onClose={() => setShowInvoice(false)}
          />
        )}
      </AnimatePresence>

      <Chatbot />
    </div>
  );
};

export default OrderDetails;

