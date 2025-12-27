import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight, Calendar, Percent, DollarSign } from 'lucide-react';
import axiosInstance from '../lib/axios';
import { productCategories } from '../utils/categories';

const DiscountManagement = () => {
  const [discounts, setDiscounts] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'product',
    discountType: 'percentage',
    value: '',
    productId: '',
    category: '',
    endDate: ''
  });

  useEffect(() => {
    fetchDiscounts();
    fetchProducts();
  }, []);

  const fetchDiscounts = async () => {
    try {
      const response = await axiosInstance.get('/api/discounts');
      setDiscounts(response.data.discounts || []);
    } catch (error) {
      console.error('Error fetching discounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axiosInstance.get('/api/products');
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = { ...formData };
      
      // Clean up data based on discount type
      if (submitData.type !== 'product') {
        delete submitData.productId;
      }
      if (submitData.type !== 'category') {
        delete submitData.category;
      }
      if (!submitData.endDate) {
        delete submitData.endDate;
      }

      if (editingDiscount) {
        await axiosInstance.put(`/api/discounts/${editingDiscount._id}`, submitData);
      } else {
        await axiosInstance.post('/api/discounts', submitData);
      }

      await fetchDiscounts();
      resetForm();
      alert(editingDiscount ? 'Discount updated successfully!' : 'Discount created successfully!');
    } catch (error) {
      console.error('Error saving discount:', error);
      alert('Error saving discount: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEdit = (discount) => {
    setEditingDiscount(discount);
    setFormData({
      name: discount.name,
      description: discount.description || '',
      type: discount.type,
      discountType: discount.discountType,
      value: discount.value.toString(),
      productId: discount.productId?._id || '',
      category: discount.category || '',
      endDate: discount.endDate ? new Date(discount.endDate).toISOString().split('T')[0] : ''
    });
    setShowForm(true);
  };

  const handleToggleStatus = async (discountId) => {
    try {
      await axiosInstance.patch(`/api/discounts/${discountId}/toggle`);
      await fetchDiscounts();
    } catch (error) {
      console.error('Error toggling discount status:', error);
      alert('Error updating discount status');
    }
  };

  const handleDelete = async (discountId) => {
    if (window.confirm('Are you sure you want to delete this discount?')) {
      try {
        await axiosInstance.delete(`/api/discounts/${discountId}`);
        await fetchDiscounts();
        alert('Discount deleted successfully!');
      } catch (error) {
        console.error('Error deleting discount:', error);
        alert('Error deleting discount');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: 'product',
      discountType: 'percentage',
      value: '',
      productId: '',
      category: '',
      endDate: ''
    });
    setEditingDiscount(null);
    setShowForm(false);
  };

  const getDiscountTypeColor = (type) => {
    switch (type) {
      case 'product': return 'bg-blue-100 text-blue-800';
      case 'category': return 'bg-green-100 text-green-800';
      case 'global': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDiscountValue = (discount) => {
    if (discount.discountType === 'percentage') {
      return `${discount.value}%`;
    }
    return `₹${discount.value}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-lg">Loading discounts...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Discount Management</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Discount
        </button>
      </div>

      {showForm && (
        <div className="mb-8 p-6 border rounded-lg bg-gray-50">
          <h3 className="text-lg font-semibold mb-4">
            {editingDiscount ? 'Edit Discount' : 'Create New Discount'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="product">Product Specific</option>
                  <option value="category">Category Wide</option>
                  <option value="global">Store Wide</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Value Type *
                </label>
                <select
                  value={formData.discountType}
                  onChange={(e) => setFormData({...formData, discountType: e.target.value})}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (₹)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount Value *
                </label>
                <input
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData({...formData, value: e.target.value})}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  max={formData.discountType === 'percentage' ? 100 : undefined}
                  required
                />
              </div>

              {formData.type === 'product' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Product *
                  </label>
                  <select
                    value={formData.productId}
                    onChange={(e) => setFormData({...formData, productId: e.target.value})}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required={formData.type === 'product'}
                  >
                    <option value="">Choose a product...</option>
                    {products.map(product => (
                      <option key={product._id} value={product._id}>
                        {product.name} - ₹{product.price}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {formData.type === 'category' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required={formData.type === 'category'}
                  >
                    <option value="">Choose a category...</option>
                    {productCategories.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date (Optional)
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
                placeholder="Optional description for this discount..."
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingDiscount ? 'Update Discount' : 'Create Discount'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Name</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Type</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Value</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Target</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">End Date</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {discounts.map((discount) => (
              <tr key={discount._id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div>
                    <div className="font-medium text-gray-900">{discount.name}</div>
                    {discount.description && (
                      <div className="text-sm text-gray-500">{discount.description}</div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDiscountTypeColor(discount.type)}`}>
                    {discount.type}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center">
                    {discount.discountType === 'percentage' ? (
                      <Percent className="h-4 w-4 mr-1 text-green-600" />
                    ) : (
                      <DollarSign className="h-4 w-4 mr-1 text-green-600" />
                    )}
                    <span className="font-medium">{formatDiscountValue(discount)}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {discount.type === 'product' && discount.productId ? (
                    <div className="text-sm">
                      <div className="font-medium">{discount.productId.name}</div>
                      <div className="text-gray-500">₹{discount.productId.price}</div>
                    </div>
                  ) : discount.type === 'category' ? (
                    <span className="text-sm font-medium">{discount.category}</span>
                  ) : (
                    <span className="text-sm font-medium text-purple-600">All Products</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleToggleStatus(discount._id)}
                    className={`flex items-center ${discount.isActive ? 'text-green-600' : 'text-gray-400'}`}
                  >
                    {discount.isActive ? (
                      <ToggleRight className="h-6 w-6" />
                    ) : (
                      <ToggleLeft className="h-6 w-6" />
                    )}
                    <span className="ml-1 text-sm">
                      {discount.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </button>
                </td>
                <td className="px-4 py-3">
                  {discount.endDate ? (
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(discount.endDate).toLocaleDateString()}
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">No expiry</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(discount)}
                      className="p-1 text-blue-600 hover:text-blue-800"
                      title="Edit discount"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(discount._id)}
                      className="p-1 text-red-600 hover:text-red-800"
                      title="Delete discount"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {discounts.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No discounts found. Create your first discount to get started!
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscountManagement;