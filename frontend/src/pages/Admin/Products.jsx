import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiPlus, FiEdit, FiTrash2, FiImage, FiBox } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import Generate3DButton from '../../components/Admin/Generate3DButton';
import Chatbot from '../../components/Chatbot/Chatbot';

const Products = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    category: '',
    stock: '',
    tags: '',
    isFeatured: false
  });
  const [selectedImages, setSelectedImages] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        axios.get('/api/products?limit=100'),
        axios.get('/api/categories')
      ]);
      setProducts(productsRes.data.products || []);
      setCategories(categoriesRes.data.categories || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
        stock: parseInt(formData.stock),
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
        category: formData.category
      };

      let productId;
      if (editingProduct) {
        const response = await axios.put(`/api/products/${editingProduct._id}`, productData);
        productId = editingProduct._id;
        toast.success('Product updated successfully');
      } else {
        const response = await axios.post('/api/products', productData);
        productId = response.data.product._id;
        toast.success('Product created successfully');
      }

      // Upload images if selected
      if (selectedImages.length > 0) {
        const imageFormData = new FormData();
        selectedImages.forEach((file) => {
          imageFormData.append('images', file);
        });

        await axios.post(`/api/products/${productId}/images`, imageFormData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        toast.success('Images uploaded successfully');

        // Automatically trigger 3D model generation
        try {
          await axios.post(`/api/product3d/${productId}/generate`, {}, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          toast.success('3D model generation started automatically!');
        } catch (modelError) {
          console.error('3D model generation error:', modelError);
          // Don't fail the whole process if 3D generation fails
        }
      }

      setShowModal(false);
      setEditingProduct(null);
      setSelectedImages([]);
      setFormData({
        name: '',
        description: '',
        price: '',
        originalPrice: '',
        category: '',
        stock: '',
        tags: '',
        isFeatured: false
      });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save product');
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setSelectedImages([]);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      originalPrice: product.originalPrice || '',
      category: product.category?._id || product.category || '',
      stock: product.stock,
      tags: product.tags?.join(', ') || '',
      isFeatured: product.isFeatured || false
    });
    setShowModal(true);
  };

  const handleDelete = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await axios.delete(`/api/products/${productId}`);
      toast.success('Product deleted successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const handleImageUpload = async (productId, file) => {
    try {
      const formData = new FormData();
      formData.append('images', file);

      await axios.post(`/api/products/${productId}/images`, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      toast.success('Image uploaded successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to upload image');
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Manage Products</h1>
          <button
            onClick={() => {
            setEditingProduct(null);
            setSelectedImages([]);
            setFormData({
              name: '',
              description: '',
              price: '',
              originalPrice: '',
              category: '',
              stock: '',
              tags: '',
              isFeatured: false
            });
            setShowModal(true);
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <FiPlus />
            <span>Add Product</span>
          </button>
        </div>

        <div className="bg-dark-card rounded-lg border border-dark-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-surface">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-dark-muted uppercase">Image</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-dark-muted uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-dark-muted uppercase">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-dark-muted uppercase">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-dark-muted uppercase">3D Model</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-dark-muted uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-dark-muted uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border">
                {products.map((product) => (
                  <tr key={product._id} className="hover:bg-dark-surface">
                    <td className="px-6 py-4">
                      <img
                        src={product.images[0]?.url || '/placeholder.jpg'}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold">{product.name}</p>
                        <p className="text-sm text-dark-muted">{product.category?.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold">${product.price}</p>
                      {product.originalPrice && (
                        <p className="text-sm text-dark-muted line-through">${product.originalPrice}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">{product.stock}</td>
                    <td className="px-6 py-4">
                      {product.model3d?.status === 'completed' ? (
                        <span className="px-2 py-1 rounded text-xs bg-green-500/20 text-green-500 flex items-center space-x-1">
                          <FiBox size={14} />
                          <span>Available</span>
                        </span>
                      ) : product.model3d?.status === 'processing' ? (
                        <span className="px-2 py-1 rounded text-xs bg-yellow-500/20 text-yellow-500">
                          Processing...
                        </span>
                      ) : product.model3d?.status === 'failed' ? (
                        <span className="px-2 py-1 rounded text-xs bg-red-500/20 text-red-500">
                          Failed
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded text-xs bg-gray-500/20 text-gray-500">
                          Not Generated
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs ${
                        product.isActive ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                      }`}>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="p-2 hover:bg-dark-surface rounded"
                        >
                          <FiEdit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="p-2 hover:bg-red-500/20 rounded text-red-500"
                        >
                          <FiTrash2 size={18} />
                        </button>
                        <label className="p-2 hover:bg-dark-surface rounded cursor-pointer">
                          <FiImage size={18} />
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files[0]) {
                                handleImageUpload(product._id, e.target.files[0]);
                              }
                            }}
                          />
                        </label>
                        <Generate3DButton
                          productId={product._id}
                          currentStatus={product.model3d?.status || 'pending'}
                          onStatusUpdate={() => fetchData()}
                        />
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
              {editingProduct ? 'Edit Product' : 'Add Product'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-dark-surface border border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 bg-dark-surface border border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-surface border border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Original Price (Optional)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-surface border border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-surface border border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Stock</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-surface border border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tags (comma separated)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full px-4 py-2 bg-dark-surface border border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="tag1, tag2, tag3"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isFeatured"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="isFeatured" className="text-sm">Featured Product</label>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Product Images {editingProduct && '(Add more images)'}
                </label>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files);
                      setSelectedImages(files);
                    }}
                    className="w-full px-4 py-2 bg-dark-surface border border-dark-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {selectedImages.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedImages.map((file, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${index + 1}`}
                            className="w-20 h-20 object-cover rounded border border-dark-border"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedImages(selectedImages.filter((_, i) => i !== index));
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {editingProduct && editingProduct.images && editingProduct.images.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-dark-muted mb-2">Current Images:</p>
                      <div className="flex flex-wrap gap-2">
                        {editingProduct.images.map((img, index) => (
                          <img
                            key={index}
                            src={img.url}
                            alt={`Current ${index + 1}`}
                            className="w-20 h-20 object-cover rounded border border-dark-border"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-xs text-dark-muted mt-1">
                  {selectedImages.length > 0 && '3D model will be generated automatically after image upload'}
                </p>
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Saving...' : editingProduct ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingProduct(null);
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

      <Chatbot />
    </div>
  );
};

export default Products;

