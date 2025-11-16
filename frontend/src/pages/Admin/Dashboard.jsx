import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { 
  FiUsers, FiShoppingBag, FiDollarSign, FiPackage,
  FiTrendingUp, FiActivity, FiBarChart2, FiTag
} from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Chatbot from '../../components/Chatbot/Chatbot';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchDashboardData();
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/api/admin/dashboard');
      setStats(response.data.stats);
      setRecentOrders(response.data.recentOrders || []);
      setTopProducts(response.data.topProducts || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: FiUsers,
      color: 'bg-blue-600',
      change: '+12%'
    },
    {
      title: 'Total Products',
      value: stats?.totalProducts || 0,
      icon: FiPackage,
      color: 'bg-green-600',
      change: '+5%'
    },
    {
      title: 'Total Orders',
      value: stats?.totalOrders || 0,
      icon: FiShoppingBag,
      color: 'bg-purple-600',
      change: '+8%'
    },
    {
      title: 'Total Revenue',
      value: `$${stats?.totalRevenue?.toFixed(2) || '0.00'}`,
      icon: FiDollarSign,
      color: 'bg-yellow-600',
      change: '+15%'
    }
  ];

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <div className="flex space-x-4">
            <button
              onClick={() => navigate('/admin/products')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              Manage Products
            </button>
            <button
              onClick={() => navigate('/admin/users')}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
            >
              Manage Users
            </button>
            <button
              onClick={() => navigate('/admin/coupons')}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors flex items-center space-x-2"
            >
              <FiTag />
              <span>Manage Coupons</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-dark-card p-6 rounded-lg border border-dark-border"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon size={24} className="text-white" />
                </div>
                <span className="text-green-500 text-sm font-semibold">{stat.change}</span>
              </div>
              <h3 className="text-2xl font-bold mb-1">{stat.value}</h3>
              <p className="text-dark-muted text-sm">{stat.title}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div className="bg-dark-card p-6 rounded-lg border border-dark-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center space-x-2">
                <FiActivity />
                <span>Recent Orders</span>
              </h2>
              <button
                onClick={() => navigate('/admin/orders')}
                className="text-blue-500 hover:text-blue-400 text-sm"
              >
                View All
              </button>
            </div>
            <div className="space-y-4">
              {recentOrders.length === 0 ? (
                <p className="text-dark-muted text-center py-4">No recent orders</p>
              ) : (
                recentOrders.map((order) => (
                  <div key={order._id} className="flex items-center justify-between p-3 bg-dark-surface rounded-lg">
                    <div>
                      <p className="font-semibold">Order #{order._id.slice(-8)}</p>
                      <p className="text-sm text-dark-muted">
                        {order.user?.name || 'Unknown User'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${order.finalAmount?.toFixed(2)}</p>
                      <p className={`text-xs ${
                        order.status === 'delivered' ? 'text-green-500' :
                        order.status === 'pending' ? 'text-yellow-500' :
                        'text-blue-500'
                      }`}>
                        {order.status}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-dark-card p-6 rounded-lg border border-dark-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center space-x-2">
                <FiTrendingUp />
                <span>Top Products</span>
              </h2>
              <button
                onClick={() => navigate('/admin/products')}
                className="text-blue-500 hover:text-blue-400 text-sm"
              >
                View All
              </button>
            </div>
            <div className="space-y-4">
              {topProducts.length === 0 ? (
                <p className="text-dark-muted text-center py-4">No products yet</p>
              ) : (
                topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-dark-surface rounded-lg">
                    <div>
                      <p className="font-semibold">{product.name || 'Product'}</p>
                      <p className="text-sm text-dark-muted">
                        Sold: {product.totalSold || 0}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${product.revenue?.toFixed(2) || '0.00'}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <Chatbot />
    </div>
  );
};

export default Dashboard;

