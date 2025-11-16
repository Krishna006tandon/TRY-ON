import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { FiUser, FiMail, FiPhone, FiMapPin, FiPlus } from 'react-icons/fi';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Chatbot from '../components/Chatbot/Chatbot';

const Profile = () => {
  const { user, fetchUser } = useAuth();
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get('/api/user/profile');
      const userData = response.data.user;
      setFormData({
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || ''
      });
      setAddresses(userData.addresses || []);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await axios.put('/api/user/profile', formData);
      await fetchUser();
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
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
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">My Profile</h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Profile Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-dark-card p-6 rounded-lg border border-dark-border"
          >
            <h2 className="text-xl font-bold mb-4">Personal Information</h2>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 bg-dark-surface border border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted" />
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full pl-10 pr-4 py-2 bg-dark-surface border border-dark-border rounded-lg opacity-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Phone</label>
                <div className="relative">
                  <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 bg-dark-surface border border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded-lg font-semibold transition-colors"
              >
                Update Profile
              </button>
            </form>
          </motion.div>

          {/* Addresses */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-dark-card p-6 rounded-lg border border-dark-border"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Addresses</h2>
              <button className="flex items-center space-x-2 text-blue-500 hover:text-blue-400">
                <FiPlus />
                <span>Add Address</span>
              </button>
            </div>

            <div className="space-y-4">
              {addresses.length === 0 ? (
                <p className="text-dark-muted">No addresses saved</p>
              ) : (
                addresses.map((address, index) => (
                  <div key={index} className="p-4 bg-dark-surface rounded-lg border border-dark-border">
                    <div className="flex items-start space-x-2">
                      <FiMapPin className="text-blue-500 mt-1" />
                      <div className="flex-1">
                        <p className="font-semibold">{address.type}</p>
                        <p className="text-sm text-dark-muted">
                          {address.street}, {address.city}, {address.state} {address.zipCode}
                        </p>
                        {address.isDefault && (
                          <span className="text-xs text-blue-500">Default</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <Chatbot />
    </div>
  );
};

export default Profile;

