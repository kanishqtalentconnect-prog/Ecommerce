import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff, Save, X } from 'lucide-react';
import axiosInstance from '../lib/axios';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    title: ''
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get('/api/category/admin/all');
      if (response.data.success) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setMessage({ text: 'Failed to fetch categories', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Auto-generate slug from name
    if (name === 'name' && !editingCategory) {
      const slug = value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      setFormData(prev => ({
        ...prev,
        slug: slug
      }));
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      setMessage({ text: 'Category name is required', type: 'error' });
      return;
    }

    try {
      const dataToSend = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        title: formData.title.trim() || null
      };

      let response;
      if (editingCategory) {
        response = await axiosInstance.put(`/api/category/${editingCategory._id}`, dataToSend);
      } else {
        response = await axiosInstance.post('/api/category', dataToSend);
      }

      if (response.data.success) {
        setMessage({ 
          text: editingCategory ? 'Category updated successfully' : 'Category created successfully', 
          type: 'success' 
        });
        setFormData({ name: '', slug: '', title: '' });
        setShowAddForm(false);
        setEditingCategory(null);
        fetchCategories();
      }
    } catch (error) {
      setMessage({ 
        text: error.response?.data?.message || 'Failed to save category', 
        type: 'error' 
      });
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      title: category.title || ''
    });
    setShowAddForm(true);
  };

  const handleDelete = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category?')) {
      return;
    }

    try {
      const response = await axiosInstance.delete(`/api/category/${categoryId}`);
      if (response.data.success) {
        setMessage({ text: 'Category deleted successfully', type: 'success' });
        fetchCategories();
      }
    } catch (error) {
      setMessage({ 
        text: error.response?.data?.message || 'Failed to delete category', 
        type: 'error' 
      });
    }
  };

  const handleToggleStatus = async (categoryId) => {
    try {
      const response = await axiosInstance.patch(`/api/category/${categoryId}/toggle`);
      if (response.data.success) {
        setMessage({ text: response.data.message, type: 'success' });
        fetchCategories();
      }
    } catch (error) {
      setMessage({ 
        text: error.response?.data?.message || 'Failed to update category status', 
        type: 'error' 
      });
    }
  };

  const resetForm = () => {
    setFormData({ name: '', slug: '', title: '' });
    setShowAddForm(false);
    setEditingCategory(null);
  };

  // Clear message after 5 seconds
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ text: '', type: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Category Management</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Category
        </button>
      </div>

      {message.text && (
        <div className={`mb-4 p-3 rounded-md ${
          message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      {showAddForm && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </h3>
            <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="e.g., Ganesha"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slug *
              </label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="e.g., ganesha"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title (Optional)
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="e.g., Lord Ganesha Collection"
              />
            </div>
            
            <div className="md:col-span-3 flex gap-2">
              <button
                onClick={handleSubmit}
                className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {editingCategory ? 'Update' : 'Create'} Category
              </button>
              <button
                onClick={resetForm}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Slug
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categories.map((category) => (
              <tr key={category._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{category.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{category.slug}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{category.title || '-'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    category.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {category.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(category.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(category)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Edit"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleToggleStatus(category._id)}
                      className={`${category.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                      title={category.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {category.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => handleDelete(category._id)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {categories.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No categories found. Create your first category to get started.
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryManagement;