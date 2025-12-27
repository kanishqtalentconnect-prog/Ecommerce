import React, { useState, useEffect } from 'react';
import { Edit2, Trash2, Search, Plus, Eye, X, Upload } from 'lucide-react';
import axiosInstance from '../lib/axios';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Edit form state
  const [editFormData, setEditFormData] = useState({
    name: '',
    price: '',
    category: '',
    description: '',
    size: '',
    sku: ''
  });
  const [newMainImage, setNewMainImage] = useState(null);
  const [newAdditionalImages, setNewAdditionalImages] = useState([]);
  const [additionalImagePreviews, setAdditionalImagePreviews] = useState([]);
  const [removeExistingImages, setRemoveExistingImages] = useState([]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/products');
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      setMessage({ text: 'Failed to fetch products', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get('/api/category');
      if (response.data.success) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === '' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setEditFormData({
      name: product.name,
      price: product.price,
      category: product.category,
      description: product.description,
      size: product.size,
      sku: product.sku
    });
    setNewMainImage(null);
    setNewAdditionalImages([]);
    setAdditionalImagePreviews([]);
    setRemoveExistingImages([]);
    setShowEditModal(true);
  };

  const handleDelete = (product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  const handleEditFormChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleMainImageChange = (e) => {
    if (e.target.files[0]) {
      setNewMainImage(e.target.files[0]);
    }
  };

  const handleAdditionalImagesChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length > 4) {
      setMessage({ text: "You can upload a maximum of 4 additional images", type: "error" });
      return;
    }
    
    setNewAdditionalImages(files);
    
    // Create preview URLs
    const previews = files.map(file => URL.createObjectURL(file));
    setAdditionalImagePreviews(previews);
  };

  const removeAdditionalImagePreview = (index) => {
    const updatedImages = [...newAdditionalImages];
    updatedImages.splice(index, 1);
    setNewAdditionalImages(updatedImages);
    
    const updatedPreviews = [...additionalImagePreviews];
    URL.revokeObjectURL(updatedPreviews[index]);
    updatedPreviews.splice(index, 1);
    setAdditionalImagePreviews(updatedPreviews);
  };

  const toggleRemoveExistingImage = (imageUrl) => {
    setRemoveExistingImages(prev => 
      prev.includes(imageUrl) 
        ? prev.filter(url => url !== imageUrl)
        : [...prev, imageUrl]
    );
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setMessage({ text: '', type: '' });

    try {
      const updateData = new FormData();

      // Append form data
      Object.keys(editFormData).forEach((key) => {
        updateData.append(key, editFormData[key]);
      });

      // Append new main image if selected
      if (newMainImage) {
        updateData.append("image", newMainImage);
      }

      // Append new additional images
      newAdditionalImages.forEach((image) => {
        updateData.append("additionalImages", image);
      });

      // Append images to remove
      if (removeExistingImages.length > 0) {
        updateData.append("removeImages", JSON.stringify(removeExistingImages));
      }

      const response = await axiosInstance.put(`/api/products/${selectedProduct._id}`, updateData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setMessage({ text: 'Product updated successfully!', type: 'success' });
      setShowEditModal(false);
      fetchProducts(); // Refresh the products list
    } catch (error) {
      console.error('Error updating product:', error);
      setMessage({
        text: error.response?.data?.message || 'Failed to update product',
        type: 'error',
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteProduct = async () => {
    setDeleting(true);
    try {
      await axiosInstance.delete(`/api/products/${selectedProduct._id}`);
      setMessage({ text: 'Product deleted successfully!', type: 'success' });
      setShowDeleteModal(false);
      fetchProducts(); // Refresh the products list
    } catch (error) {
      console.error('Error deleting product:', error);
      setMessage({
        text: error.response?.data?.message || 'Failed to delete product',
        type: 'error',
      });
    } finally {
      setDeleting(false);
    }
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
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6 border-b">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Product Management</h2>
        
        {message.text && (
          <div className={`mb-4 p-3 rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message.text}
          </div>
        )}

        {/* Search and Filter */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category._id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>

          <div className="text-sm text-gray-500 flex items-center">
            Showing {filteredProducts.length} of {products.length} products
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Featured</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProducts.map((product) => (
              <tr key={product._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-12 w-12 rounded-md object-cover mr-3"
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">{product.description}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{product.sku}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{product.category}</td>
                <td className="px-6 py-4 text-sm text-gray-900">₹{product.price}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{product.size}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    product.isFeatured 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {product.isFeatured ? 'Featured' : 'Regular'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="text-emerald-600 hover:text-emerald-800 p-1 rounded"
                      title="Edit Product"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(product)}
                      className="text-red-600 hover:text-red-800 p-1 rounded"
                      title="Delete Product"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No products found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-700">Edit Product</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleUpdateProduct} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* SKU */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                    <input
                      type="text"
                      name="sku"
                      value={editFormData.sku}
                      onChange={handleEditFormChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>

                  {/* Product Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Name*</label>
                    <input
                      type="text"
                      name="name"
                      value={editFormData.name}
                      onChange={handleEditFormChange}
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (INR)*</label>
                    <input
                      type="number"
                      name="price"
                      value={editFormData.price}
                      onChange={handleEditFormChange}
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category*</label>
                    <select
                      name="category"
                      value={editFormData.category}
                      onChange={handleEditFormChange}
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="">Select a category</option>
                      {categories.map((category) => (
                        <option key={category._id} value={category.name}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Size */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Size*</label>
                    <input
                      type="text"
                      name="size"
                      value={editFormData.size}
                      onChange={handleEditFormChange}
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description*</label>
                  <textarea
                    name="description"
                    value={editFormData.description}
                    onChange={handleEditFormChange}
                    rows="3"
                    required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                {/* Current Main Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Main Image</label>
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    className="h-24 w-24 object-cover rounded border"
                  />
                </div>

                {/* New Main Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Update Main Image (Optional)</label>
                  <input
                    type="file"
                    onChange={handleMainImageChange}
                    accept="image/*"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                  {newMainImage && (
                    <p className="text-sm text-gray-500 mt-1">Selected: {newMainImage.name}</p>
                  )}
                </div>

                {/* Current Additional Images */}
                {selectedProduct.additionalImages && selectedProduct.additionalImages.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Additional Images</label>
                    <div className="flex flex-wrap gap-3">
                      {selectedProduct.additionalImages.map((imageUrl, index) => (
                        <div key={index} className="relative">
                          <img
                            src={imageUrl}
                            alt={`Additional ${index}`}
                            className={`h-24 w-24 object-cover rounded border ${
                              removeExistingImages.includes(imageUrl) ? 'opacity-50' : ''
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => toggleRemoveExistingImage(imageUrl)}
                            className={`absolute -top-2 -right-2 w-6 h-6 rounded-full text-white text-xs ${
                              removeExistingImages.includes(imageUrl) 
                                ? 'bg-red-500 hover:bg-red-600' 
                                : 'bg-gray-500 hover:bg-gray-600'
                            }`}
                          >
                            {removeExistingImages.includes(imageUrl) ? '✓' : '×'}
                          </button>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Click × to mark for removal</p>
                  </div>
                )}

                {/* New Additional Images Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Add New Additional Images (Up to 4)</label>
                  <input
                    type="file"
                    onChange={handleAdditionalImagesChange}
                    multiple
                    accept="image/*"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                  
                  {/* Preview new additional images */}
                  {additionalImagePreviews.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-600 mb-2">New images to add:</p>
                      <div className="flex flex-wrap gap-3">
                        {additionalImagePreviews.map((preview, index) => (
                          <div key={index} className="relative">
                            <img
                              src={preview}
                              alt={`New ${index}`}
                              className="h-24 w-24 object-cover rounded border"
                            />
                            <button
                              type="button"
                              onClick={() => removeAdditionalImagePreview(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updating}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {updating ? 'Updating...' : 'Update Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="bg-red-100 p-3 rounded-full mr-4">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Delete Product</h3>
                  <p className="text-sm text-gray-500">This action cannot be undone.</p>
                </div>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-700">
                  Are you sure you want to delete <strong>{selectedProduct.name}</strong>?
                </p>
                <div className="mt-3 flex items-center">
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    className="h-16 w-16 object-cover rounded mr-3"
                  />
                  <div>
                    <p className="font-medium">{selectedProduct.name}</p>
                    <p className="text-sm text-gray-500">SKU: {selectedProduct.sku}</p>
                    <p className="text-sm text-gray-500">₹{selectedProduct.price}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteProduct}
                  disabled={deleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {deleting ? 'Deleting...' : 'Delete Product'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;