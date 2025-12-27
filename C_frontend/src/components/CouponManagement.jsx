import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Eye, 
  ToggleLeft, 
  ToggleRight,
  Calendar,
  Tag,
  Percent,
  DollarSign,
  Users,
  Package,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";
import axiosInstance from "../lib/axios";

const CouponManagement = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    totalCoupons: 0,
    activeCoupons: 0,
    expiredCoupons: 0,
    usedCoupons: 0
  });
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchCoupons();
    fetchStats();
    fetchCategories();
    fetchProducts();
  }, [currentPage, statusFilter, searchTerm]);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(searchTerm && { search: searchTerm })
      });
      
      const response = await axiosInstance.get(`/api/coupons/admin/all?${params}`);
      setCoupons(response.data.coupons);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      console.error("Error fetching coupons:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axiosInstance.get("/api/coupons/admin/stats");
      setStats(response.data.stats);
    } catch (error) {
      console.error("Error fetching coupon stats:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get("/api/category/admin/all");
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axiosInstance.get("/api/products");
      setProducts(response.data.products || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await axiosInstance.patch(`/api/coupons/admin/${id}/toggle`);
      fetchCoupons();
    } catch (error) {
      console.error("Error toggling coupon status:", error);
    }
  };

  const handleDeleteCoupon = async (id) => {
    if (window.confirm("Are you sure you want to delete this coupon?")) {
      try {
        await axiosInstance.delete(`/api/coupons/admin/${id}`);
        fetchCoupons();
        fetchStats();
      } catch (error) {
        console.error("Error deleting coupon:", error);
        alert(error.response?.data?.message || "Error deleting coupon");
      }
    }
  };

  const getStatusBadge = (coupon) => {
    const now = new Date();
    const expirationDate = new Date(coupon.expirationDate);
    
    if (!coupon.isActive) {
      return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full flex items-center"><XCircle className="h-3 w-3 mr-1" />Disabled</span>;
    }
    
    if (expirationDate <= now) {
      return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-600 rounded-full flex items-center"><Clock className="h-3 w-3 mr-1" />Expired</span>;
    }
    
    return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-600 rounded-full flex items-center"><CheckCircle className="h-3 w-3 mr-1" />Active</span>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDiscount = (coupon) => {
    if (coupon.discountType === 'percentage') {
      return `${coupon.discountValue}%`;
    }
    return `₹${coupon.discountValue}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Coupon Management</h2>
          <button 
            onClick={() => setShowCreateForm(true)}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Coupon
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Tag className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-600">Total Coupons</p>
                <p className="text-2xl font-bold text-blue-900">{stats.totalCoupons}</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-green-600">Active Coupons</p>
                <p className="text-2xl font-bold text-green-900">{stats.activeCoupons}</p>
              </div>
            </div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-red-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-red-600">Expired</p>
                <p className="text-2xl font-bold text-red-900">{stats.expiredCoupons}</p>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-purple-600">Used Coupons</p>
                <p className="text-2xl font-bold text-purple-900">{stats.usedCoupons}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search coupons..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="expired">Expired</option>
          </select>
        </div>
      </div>

      {/* Coupons Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading coupons...</p>
          </div>
        ) : coupons.length === 0 ? (
          <div className="p-8 text-center">
            <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No coupons found</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coupon</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usage</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Validity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {coupons.map((coupon) => (
                <tr key={coupon._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{coupon.code}</div>
                      <div className="text-sm text-gray-500">{coupon.name}</div>
                      {coupon.description && <div className="text-xs text-gray-400 mt-1">{coupon.description}</div>}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatDiscount(coupon)}</div>
                    {coupon.minimumOrderAmount > 0 && (
                      <div className="text-xs text-gray-500">Min: ₹{coupon.minimumOrderAmount}</div>
                    )}
                    {coupon.maximumDiscountAmount && (
                      <div className="text-xs text-gray-500">Max: ₹{coupon.maximumDiscountAmount}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{coupon.usedCount || 0} used</div>
                    {coupon.usageLimit && (
                      <div className="text-xs text-gray-500">Limit: {coupon.usageLimit}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatDate(coupon.startDate)}</div>
                    <div className="text-sm text-gray-500">to {formatDate(coupon.expirationDate)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(coupon)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleToggleStatus(coupon._id)}
                        className="text-blue-600 hover:text-blue-900"
                        title={coupon.isActive ? "Disable" : "Enable"}
                      >
                        {coupon.isActive ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
                      </button>
                      <button
                        onClick={() => {
                          setEditingCoupon(coupon);
                          setShowEditForm(true);
                        }}
                        className="text-emerald-600 hover:text-emerald-900"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCoupon(coupon._id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                        disabled={coupon.usedCount > 0}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex space-x-1">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Create/Edit Form Modal */}
      {(showCreateForm || showEditForm) && (
        <CouponFormModal
          isOpen={showCreateForm || showEditForm}
          onClose={() => {
            setShowCreateForm(false);
            setShowEditForm(false);
            setEditingCoupon(null);
          }}
          coupon={editingCoupon}
          categories={categories}
          products={products}
          onSuccess={() => {
            fetchCoupons();
            fetchStats();
            setShowCreateForm(false);
            setShowEditForm(false);
            setEditingCoupon(null);
          }}
        />
      )}
    </div>
  );
};

// Coupon Form Modal Component
const CouponFormModal = ({ isOpen, onClose, coupon, categories, products, onSuccess }) => {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    minimumOrderAmount: '',
    maximumDiscountAmount: '',
    usageLimit: '',
    userUsageLimit: '1',
    startDate: '',
    expirationDate: '',
    applicableToProducts: [],
    applicableToCategories: [],
    excludeProducts: [],
    excludeCategories: [],
    isGlobal: true
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (coupon) {
      setFormData({
        code: coupon.code || '',
        name: coupon.name || '',
        description: coupon.description || '',
        discountType: coupon.discountType || 'percentage',
        discountValue: coupon.discountValue || '',
        minimumOrderAmount: coupon.minimumOrderAmount || '',
        maximumDiscountAmount: coupon.maximumDiscountAmount || '',
        usageLimit: coupon.usageLimit || '',
        userUsageLimit: coupon.userUsageLimit || '1',
        startDate: coupon.startDate ? new Date(coupon.startDate).toISOString().split('T')[0] : '',
        expirationDate: coupon.expirationDate ? new Date(coupon.expirationDate).toISOString().split('T')[0] : '',
        applicableToProducts: coupon.applicableToProducts?.map(p => p._id) || [],
        applicableToCategories: coupon.applicableToCategories || [],
        excludeProducts: coupon.excludeProducts?.map(p => p._id) || [],
        excludeCategories: coupon.excludeCategories || [],
        isGlobal: coupon.isGlobal !== false
      });
    }
  }, [coupon]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        discountValue: parseFloat(formData.discountValue),
        minimumOrderAmount: formData.minimumOrderAmount ? parseFloat(formData.minimumOrderAmount) : 0,
        maximumDiscountAmount: formData.maximumDiscountAmount ? parseFloat(formData.maximumDiscountAmount) : null,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
        userUsageLimit: parseInt(formData.userUsageLimit)
      };

      if (coupon) {
        await axiosInstance.put(`/api/coupons/admin/${coupon._id}`, submitData);
      } else {
        await axiosInstance.post('/api/coupons/admin/create', submitData);
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving coupon:', error);
      alert(error.response?.data?.message || 'Error saving coupon');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {coupon ? 'Edit Coupon' : 'Create New Coupon'}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Basic Information</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Coupon Code *</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Coupon Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  rows={3}
                />
              </div>
            </div>

            {/* Discount Settings */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Discount Settings</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type *</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount Value * {formData.discountType === 'percentage' ? '(%)' : '(₹)'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Order Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.minimumOrderAmount}
                    onChange={(e) => setFormData({ ...formData, minimumOrderAmount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Discount Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.maximumDiscountAmount}
                    onChange={(e) => setFormData({ ...formData, maximumDiscountAmount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Usage Limits & Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Usage Limits</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Usage Limit</label>
                  <input
                    type="number"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Unlimited"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Per User Limit</label>
                  <input
                    type="number"
                    value={formData.userUsageLimit}
                    onChange={(e) => setFormData({ ...formData, userUsageLimit: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    min="1"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Validity Period</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiration Date *</label>
                  <input
                    type="date"
                    value={formData.expirationDate}
                    onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Applicability Settings */}
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isGlobal"
                checked={formData.isGlobal}
                onChange={(e) => setFormData({ ...formData, isGlobal: e.target.checked })}
                className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
              />
              <label htmlFor="isGlobal" className="ml-2 text-sm text-gray-700">
                Apply to all products (Global coupon)
              </label>
            </div>

            {!formData.isGlobal && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Apply To</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Categories</label>
                    <select
                      multiple
                      value={formData.applicableToCategories}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        applicableToCategories: Array.from(e.target.selectedOptions, option => option.value)
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      size={4}
                    >
                      {categories.map(category => (
                        <option key={category._id} value={category.name}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Specific Products</label>
                    <select
                      multiple
                      value={formData.applicableToProducts}
                      onChange={(e) => setFormData({ 
                        ...formData,applicableToProducts: Array.from(e.target.selectedOptions, option => option.value)
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      size={4}
                    >
                      {products.map(product => (
                        <option key={product._id} value={product._id}>
                          {product.name} - ₹{product.price}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Exclude From</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Categories</label>
                    <select
                      multiple
                      value={formData.excludeCategories}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        excludeCategories: Array.from(e.target.selectedOptions, option => option.value)
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      size={4}
                    >
                      {categories.map(category => (
                        <option key={category._id} value={category.name}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Specific Products</label>
                    <select
                      multiple
                      value={formData.excludeProducts}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        excludeProducts: Array.from(e.target.selectedOptions, option => option.value)
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      size={4}
                    >
                      {products.map(product => (
                        <option key={product._id} value={product._id}>
                          {product.name} - ₹{product.price}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 border border-transparent rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block mr-2"></div>
                  {coupon ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                coupon ? 'Update Coupon' : 'Create Coupon'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CouponManagement;