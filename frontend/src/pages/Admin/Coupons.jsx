import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiPlus, FiEdit, FiTrash2, FiCopy } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const Coupons = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    minPurchase: '',
    maxDiscount: '',
    validFrom: '',
    validUntil: '',
    usageLimit: '',
    userLimit: '1',
    isActive: true
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      const response = await axios.get('/api/coupons/admin');
      setCoupons(response.data.coupons || []);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const couponData = {
        ...formData,
        discountValue: parseFloat(formData.discountValue),
        minPurchase: formData.minPurchase ? parseFloat(formData.minPurchase) : 0,
        maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : undefined,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
        userLimit: parseInt(formData.userLimit),
        validFrom: new Date(formData.validFrom),
        validUntil: new Date(formData.validUntil)
      };

      if (editingCoupon) {
        await axios.put(`/api/coupons/admin/${editingCoupon._id}`, couponData);
        toast.success('Coupon updated successfully');
      } else {
        await axios.post('/api/coupons/admin', couponData);
        toast.success('Coupon created successfully');
      }

      setShowModal(false);
      setEditingCoupon(null);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save coupon');
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      discountType: 'percentage',
      discountValue: '',
      minPurchase: '',
      maxDiscount: '',
      validFrom: '',
      validUntil: '',
      usageLimit: '',
      userLimit: '1',
      isActive: true
    });
  };

  const handleEdit = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      description: coupon.description || '',
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minPurchase: coupon.minPurchase || '',
      maxDiscount: coupon.maxDiscount || '',
      validFrom: new Date(coupon.validFrom).toISOString().slice(0, 16),
      validUntil: new Date(coupon.validUntil).toISOString().slice(0, 16),
      usageLimit: coupon.usageLimit || '',
      userLimit: coupon.userLimit || '1',
      isActive: coupon.isActive
    });
    setShowModal(true);
  };

  const handleDelete = async (couponId) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;

    try {
      await axios.delete(`/api/coupons/admin/${couponId}`);
      toast.success('Coupon deleted successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete coupon');
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success('Coupon code copied!');
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Manage Coupons</h1>
          <button
            onClick={() => {
              setEditingCoupon(null);
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <FiPlus />
            <span>Add Coupon</span>
          </button>
        </div>

        <div className="bg-dark-card rounded-lg border border-dark-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-surface">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-dark-muted uppercase">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-dark-muted uppercase">Discount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-dark-muted uppercase">Valid Until</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-dark-muted uppercase">Usage</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-dark-muted uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-dark-muted uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border">
                {coupons.map((coupon) => (
                  <tr key={coupon._id} className="hover:bg-dark-surface">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-semibold">{coupon.code}</span>
                        <button
                          onClick={() => copyCode(coupon.code)}
                          className="p-1 hover:bg-dark-surface rounded"
                        >
                          <FiCopy size={14} />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {coupon.discountType === 'percentage' 
                        ? `${coupon.discountValue}%` 
                        : `$${coupon.discountValue}`}
                    </td>
                    <td className="px-6 py-4">
                      {new Date(coupon.validUntil).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      {coupon.usedCount} / {coupon.usageLimit || '∞'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs ${
                        coupon.isActive ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                      }`}>
                        {coupon.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(coupon)}
                          className="p-2 hover:bg-dark-surface rounded"
                        >
                          <FiEdit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(coupon._id)}
                          className="p-2 hover:bg-red-500/20 rounded text-red-500"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-card rounded-lg w-full max-w-2xl p-6 border border-dark-border max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {editingCoupon ? 'Edit Coupon' : 'Add Coupon'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Code *</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full px-4 py-2 bg-dark-surface border border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    placeholder="SAVE20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Discount Type *</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-surface border border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Discount Value *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-surface border border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                {formData.discountType === 'percentage' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Max Discount (Optional)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.maxDiscount}
                      onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                      className="w-full px-4 py-2 bg-dark-surface border border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 bg-dark-surface border border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Min Purchase</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.minPurchase}
                    onChange={(e) => setFormData({ ...formData, minPurchase: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-surface border border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Usage Limit (Leave empty for unlimited)</label>
                  <input
                    type="number"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-surface border border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Unlimited"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Valid From *</label>
                  <input
                    type="datetime-local"
                    value={formData.validFrom}
                    onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-surface border border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Valid Until *</label>
                  <input
                    type="datetime-local"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-surface border border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="isActive" className="text-sm">Active</label>
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 py-2 rounded-lg font-semibold transition-colors"
                >
                  {editingCoupon ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingCoupon(null);
                    resetForm();
                  }}
                  className="flex-1 bg-dark-surface hover:bg-dark-border py-2 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Coupons;

