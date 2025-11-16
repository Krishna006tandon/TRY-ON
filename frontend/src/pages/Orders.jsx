import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FiPackage, FiTruck, FiCheckCircle } from 'react-icons/fi';
import { motion } from 'framer-motion';
import Chatbot from '../components/Chatbot/Chatbot';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('/api/orders');
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return <FiCheckCircle className="text-green-500" />;
      case 'shipped':
        return <FiTruck className="text-blue-500" />;
      default:
        return <FiPackage className="text-yellow-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'text-green-500';
      case 'shipped':
        return 'text-blue-500';
      case 'cancelled':
        return 'text-red-500';
      default:
        return 'text-yellow-500';
    }
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">My Orders</h1>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-dark-card rounded-lg h-32 animate-pulse" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-dark-muted mb-4">No orders yet</p>
            <Link
              to="/products"
              className="text-blue-500 hover:text-blue-400"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-dark-card p-6 rounded-lg border border-dark-border"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <Link
                      to={`/orders/${order._id}`}
                      className="text-lg font-semibold hover:text-blue-500"
                    >
                      Order #{order._id.slice(-8)}
                    </Link>
                    <p className="text-sm text-dark-muted">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(order.status)}
                    <span className={`font-semibold ${getStatusColor(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex space-x-2">
                    {order.items.slice(0, 3).map((item, index) => (
                      <img
                        key={index}
                        src={item.product?.images[0]?.url || '/placeholder.jpg'}
                        alt={item.product?.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    ))}
                    {order.items.length > 3 && (
                      <div className="w-16 h-16 bg-dark-surface rounded flex items-center justify-center">
                        +{order.items.length - 3}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold">${order.finalAmount.toFixed(2)}</p>
                    <Link
                      to={`/orders/${order._id}`}
                      className="text-sm text-blue-500 hover:text-blue-400"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Chatbot />
    </div>
  );
};

export default Orders;

