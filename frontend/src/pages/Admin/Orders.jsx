import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiPackage, FiTruck, FiCheckCircle, FiX, FiEdit, FiMapPin } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import Chatbot from '../../components/Chatbot/Chatbot';
import { motion } from 'framer-motion';

const Orders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchOrders();
  }, [user, navigate]);

  const fetchOrders = async () => {
    try {
      // Get all orders - we'll need to add an admin endpoint for this
      const response = await axios.get('/api/orders');
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const [editingOrder, setEditingOrder] = useState(null);
  const [trackingData, setTrackingData] = useState({
    status: '',
    trackingNumber: '',
    location: '',
    description: ''
  });

  const updateOrderStatus = async (orderId, status, trackingNumber = '', location = '', description = '') => {
    try {
      await axios.put(`/api/orders/${orderId}/status`, { 
        status, 
        trackingNumber,
        location,
        description
      });
      toast.success('Order status updated successfully');
      setEditingOrder(null);
      setTrackingData({ status: '', trackingNumber: '', location: '', description: '' });
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update order status');
    }
  };

  const handleEditClick = (order) => {
    setEditingOrder(order._id);
    setTrackingData({
      status: order.status,
      trackingNumber: order.trackingNumber || '',
      location: order.currentLocation || '',
      description: ''
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return <FiCheckCircle className="text-green-500" />;
      case 'shipped':
        return <FiTruck className="text-blue-500" />;
      case 'cancelled':
        return <FiX className="text-red-500" />;
      default:
        return <FiPackage className="text-yellow-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Manage Orders</h1>

        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="bg-dark-card p-6 rounded-lg border border-dark-border">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Order #{order._id.slice(-8)}</h3>
                  <p className="text-sm text-dark-muted">
                    {order.user?.name || 'Unknown User'} • {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(order.status)}
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    order.status === 'delivered' ? 'bg-green-500/20 text-green-500' :
                    order.status === 'shipped' || order.status === 'out_for_delivery' ? 'bg-blue-500/20 text-blue-500' :
                    order.status === 'cancelled' ? 'bg-red-500/20 text-red-500' :
                    'bg-yellow-500/20 text-yellow-500'
                  }`}>
                    {order.status?.charAt(0).toUpperCase() + order.status?.slice(1).replace('_', ' ')}
                  </span>
                  <button
                    onClick={() => handleEditClick(order)}
                    className="p-2 hover:bg-dark-surface rounded-lg transition-colors"
                    title="Update Tracking"
                  >
                    <FiEdit size={18} />
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm text-dark-muted mb-2">Items:</p>
                <div className="flex space-x-2">
                  {order.items?.slice(0, 5).map((item, index) => (
                    <div key={index} className="flex items-center space-x-2 bg-dark-surface p-2 rounded">
                      <img
                        src={item.product?.images[0]?.url || '/placeholder.jpg'}
                        alt={item.product?.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div>
                        <p className="text-sm font-semibold">{item.product?.name}</p>
                        <p className="text-xs text-dark-muted">Qty: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-dark-muted">Total Amount</p>
                  <p className="text-xl font-bold">${order.finalAmount?.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  {order.trackingNumber && (
                    <div className="mb-2">
                      <p className="text-sm text-dark-muted">Tracking</p>
                      <p className="font-mono font-semibold">{order.trackingNumber}</p>
                    </div>
                  )}
                  {order.currentLocation && (
                    <div className="flex items-center space-x-1 text-sm text-blue-500">
                      <FiMapPin size={14} />
                      <span>{order.currentLocation}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Edit Tracking Modal */}
              {editingOrder === order._id && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 bg-dark-surface rounded-lg border border-dark-border"
                >
                  <h4 className="font-semibold mb-4">Update Order Tracking</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Status</label>
                      <select
                        value={trackingData.status}
                        onChange={(e) => setTrackingData({ ...trackingData, status: e.target.value })}
                        className="w-full px-4 py-2 bg-dark-card border border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="out_for_delivery">Out for Delivery</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Tracking Number</label>
                      <input
                        type="text"
                        value={trackingData.trackingNumber}
                        onChange={(e) => setTrackingData({ ...trackingData, trackingNumber: e.target.value })}
                        placeholder="Enter tracking number"
                        className="w-full px-4 py-2 bg-dark-card border border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Current Location</label>
                      <input
                        type="text"
                        value={trackingData.location}
                        onChange={(e) => setTrackingData({ ...trackingData, location: e.target.value })}
                        placeholder="e.g., Mumbai Warehouse, Delhi Hub"
                        className="w-full px-4 py-2 bg-dark-card border border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Description (Optional)</label>
                      <textarea
                        value={trackingData.description}
                        onChange={(e) => setTrackingData({ ...trackingData, description: e.target.value })}
                        placeholder="Additional notes about the order status"
                        rows={2}
                        className="w-full px-4 py-2 bg-dark-card border border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => updateOrderStatus(
                          order._id,
                          trackingData.status,
                          trackingData.trackingNumber,
                          trackingData.location,
                          trackingData.description
                        )}
                        className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
                      >
                        Update
                      </button>
                      <button
                        onClick={() => {
                          setEditingOrder(null);
                          setTrackingData({ status: '', trackingNumber: '', location: '', description: '' });
                        }}
                        className="px-4 py-2 bg-dark-surface hover:bg-dark-border rounded-lg font-semibold transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </div>

      <Chatbot />
    </div>
  );
};

export default Orders;

