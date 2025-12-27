import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  PieChart, 
  Users, 
  Package2, 
  FileText, 
  Settings, 
  ChevronRight, 
  PlusCircle, 
  LogOut, 
  X, 
  ShoppingBag,
  Clock,
  TrendingUp,
  Tag,
  Percent,
  MessageSquare,
  FolderOpen,
  Package,
  Ticket
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../lib/axios";
import CreateProductForm from "../components/CreateProductForm";
import RecentOrders from "../components/RecentOrders";
import OrderManagement from "../components/OrderManagement";
import DiscountManagement from "../components/DiscountManagement";
import HeaderMessageManagement from "../components/HeaderMessage";
import CategoryManagement from "../components/CategoryManagement";
import ProductManagement from "../components/ProductManagement";
import CouponManagement from "../components/CouponManagement";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    pages: 0,
    users: 0,
    orders: {
      pending: 0,
      processing: 0,
      total: 0
    },
    discounts: {
      active: 0,
      total: 0
    },
    headerMessages: {
      active: 0,
      total: 0
    },
    coupons: {
      active: 0,
      total: 0,
      expired: 0,
      used: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showProductManagement, setShowProductManagement] = useState(false);
  const [showOrderManagement, setShowOrderManagement] = useState(false);
  const [showDiscountManagement, setShowDiscountManagement] = useState(false);
  const [showHeaderMessageManagement, setShowHeaderMessageManagement] = useState(false);
  const [showCategoryManagement, setShowCategoryManagement] = useState(false);
  const [showCouponManagement, setShowCouponManagement] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const productRes = await axiosInstance.get("/api/analytics/product-count");
        const productCount = productRes.data?.count || 0;

        const orderRes = await axiosInstance.get("/api/admin/orders/counts");
        const orderCounts = orderRes.data?.data || { pending: 0, processing: 0, total: 0 };

        // Fetch category stats
        let categoryCount = 0;
        try {
          const categoryRes = await axiosInstance.get("/api/category/admin/all");
          categoryCount = categoryRes.data?.categories?.length || 0;
        } catch (categoryError) {
          console.error("Error fetching category stats:", categoryError);
        }

        // Fetch discount stats
        let discountStats = { active: 0, total: 0 };
        try {
          const discountRes = await axiosInstance.get("/api/discounts");
          const discounts = discountRes.data?.discounts || [];
          discountStats = {
            total: discounts.length,
            active: discounts.filter(d => d.isActive).length
          };
        } catch (discountError) {
          console.error("Error fetching discount stats:", discountError);
        }

        // Fetch header message stats
        let headerMessageStats = { active: 0, total: 0 };
        try {
          const messageRes = await axiosInstance.get("/api/header-messages");
          const messages = messageRes.data?.messages || [];
          headerMessageStats = {
            total: messages.length,
            active: messages.filter(m => m.isActive).length
          };
        } catch (messageError) {
          console.error("Error fetching header message stats:", messageError);
        }

        // Fetch coupon stats
        let couponStats = { active: 0, total: 0, expired: 0, used: 0 };
try {
  const couponRes = await axiosInstance.get("/api/coupons/admin/stats");
  const data = couponRes.data?.stats;
  if (data) {
    couponStats = {
      active: data.activeCoupons || 0,
      total: data.totalCoupons || 0,
      expired: data.expiredCoupons || 0,
      used: data.usedCoupons || 0
    };
  }
} catch (couponError) {
  console.error("Error fetching coupon stats:", couponError);
}

        setStats({
          products: productCount,
          categories: categoryCount,
          pages: 5,
          users: 156,
          orders: orderCounts,
          discounts: discountStats,
          headerMessages: headerMessageStats,
          coupons: couponStats
        });

        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleProductCreated = async () => {
    try {
      const res = await axiosInstance.get("/api/analytics/product-count");
      setStats({
        ...stats,
        products: res.data?.count || stats.products + 1
      });
    } catch (error) {
      console.error("Error updating product count:", error);
    }
  };

  const handleProductUpdated = async () => {
    try {
      const res = await axiosInstance.get("/api/analytics/product-count");
      setStats({
        ...stats,
        products: res.data?.count || stats.products
      });
    } catch (error) {
      console.error("Error updating product count:", error);
    }
  };

  const handleCategoryUpdated = async () => {
    try {
      const categoryRes = await axiosInstance.get("/api/category/admin/all");
      const categoryCount = categoryRes.data?.categories?.length || 0;
      setStats({
        ...stats,
        categories: categoryCount
      });
    } catch (error) {
      console.error("Error updating category count:", error);
    }
  };

  const handleCouponUpdated = async () => {
    try {
      const couponRes = await axiosInstance.get("/api/coupons/admin/stats");
      const couponStats = couponRes.data?.stats || { active: 0, total: 0, expired: 0, used: 0 };
      setStats({
        ...stats,
        coupons: couponStats
      });
    } catch (error) {
      console.error("Error updating coupon stats:", error);
    }
  };

  // Helper function to close all management panels
  const closeAllPanels = () => {
    setShowProductForm(false);
    setShowProductManagement(false);
    setShowOrderManagement(false);
    setShowDiscountManagement(false);
    setShowHeaderMessageManagement(false);
    setShowCategoryManagement(false);
    setShowCouponManagement(false);
  };

  const statCards = [
    { title: "Products", value: stats.products, icon: <Package2 className="h-8 w-8 text-emerald-500" /> },
    { title: "Categories", value: stats.categories, icon: <FileText className="h-8 w-8 text-emerald-500" /> },
    { title: "Active Discounts", value: stats.discounts.active, icon: <Tag className="h-8 w-8 text-emerald-500" />, highlight: stats.discounts.active > 0 },
    { title: "Active Coupons", value: stats.coupons.active, icon: <Ticket className="h-8 w-8 text-emerald-500" />, highlight: stats.coupons.active > 0 },
    { title: "Active Messages", value: stats.headerMessages.active, icon: <MessageSquare className="h-8 w-8 text-emerald-500" />, highlight: stats.headerMessages.active > 0 },
    { title: "Pending Orders", value: stats.orders.pending + stats.orders.processing, icon: <ShoppingBag className="h-8 w-8 text-emerald-500" />, highlight: stats.orders.pending > 0 },
    { title: "Total Orders", value: stats.orders.total, icon: <TrendingUp className="h-8 w-8 text-emerald-500" /> }
  ];

  const quickLinks = [
    { 
      name: "Add New Product", 
      action: () => { 
        closeAllPanels();
        setShowProductForm(!showProductForm); 
      }, 
      icon: <PlusCircle className="h-5 w-5 text-emerald-500" /> 
    },
    { 
      name: "Manage Products", 
      action: () => { 
        closeAllPanels();
        setShowProductManagement(!showProductManagement); 
      }, 
      icon: <Package className="h-5 w-5 text-emerald-500" /> 
    },
    { 
      name: "Manage Categories", 
      action: () => { 
        closeAllPanels();
        setShowCategoryManagement(!showCategoryManagement); 
      }, 
      icon: <FolderOpen className="h-5 w-5 text-emerald-500" /> 
    },
    { 
      name: "Manage Coupons", 
      action: () => { 
        closeAllPanels();
        setShowCouponManagement(!showCouponManagement); 
      }, 
      icon: <Ticket className="h-5 w-5 text-emerald-500" /> 
    },
    { 
      name: "Manage Discounts", 
      action: () => { 
        closeAllPanels();
        setShowDiscountManagement(!showDiscountManagement); 
      }, 
      icon: <Percent className="h-5 w-5 text-emerald-500" /> 
    },
    { 
      name: "Manage Header Messages", 
      action: () => { 
        closeAllPanels();
        setShowHeaderMessageManagement(!showHeaderMessageManagement); 
      }, 
      icon: <MessageSquare className="h-5 w-5 text-emerald-500" /> 
    },
    { 
      name: "Manage Orders", 
      action: () => { 
        closeAllPanels();
        setShowOrderManagement(!showOrderManagement); 
      }, 
      icon: <ShoppingBag className="h-5 w-5 text-emerald-500" /> 
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-gray-800 text-white py-6 px-4 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <PieChart className="h-8 w-8 mr-3" />
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-gray-300 text-sm">Manage your UtsaviMart store</p>
            </div>
          </div>

          <div className="flex items-center">
            <div className="mr-4 text-right">
              <p className="font-medium">{user?.name || 'Admin'}</p>
              <p className="text-sm text-gray-300">{user?.email}</p>
            </div>
            <button onClick={handleLogout} className="p-2 bg-red-600 rounded-full hover:bg-red-700 transition-colors" title="Logout">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Overview</h2>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4 mb-8">
            {[1,2,3,4,5,6,7].map(i => (
              <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                <div className="h-8 w-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-1"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4 mb-8">
            {statCards.map((card,i) => (
              <div key={i} className={`bg-white rounded-lg shadow-md p-6 transition-transform hover:scale-105 ${card.highlight ? 'border-l-4 border-yellow-500' : ''}`}>
                {card.icon}
                <h3 className="text-gray-500 mt-2 text-sm">{card.title}</h3>
                <p className={`text-2xl font-bold ${card.highlight ? 'text-yellow-600' : 'text-gray-800'}`}>{card.value}</p>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Quick Actions</h2>
            <div className="space-y-3">
              {quickLinks.map((link,idx) => (
                <button key={idx} onClick={link.action} className="flex items-center justify-between p-3 w-full bg-gray-50 rounded-md hover:bg-emerald-50 transition-colors">
                  <span className="font-medium text-gray-700">{link.name}</span>
                  {link.icon}
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-2">
            <RecentOrders />
          </div>
        </div>

        {showProductForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8 transition-all">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-700">Add New Product</h2>
              <button onClick={() => setShowProductForm(false)} className="text-gray-500 hover:text-gray-700" aria-label="Close form"><X className="h-6 w-6" /></button>
            </div>
            <CreateProductForm onSuccess={handleProductCreated} onCancel={() => setShowProductForm(false)} />
          </div>
        )}

        {showProductManagement && (
          <div className="mb-8 transition-all">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-700">Product Management</h2>
              <button onClick={() => setShowProductManagement(false)} className="text-gray-500 hover:text-gray-700" aria-label="Close product management">
                <X className="h-6 w-6" />
              </button>
            </div>
            <ProductManagement onProductUpdated={handleProductUpdated} />
          </div>
        )}

        {showCategoryManagement && (
          <div className="mb-8 transition-all">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-700">Category Management</h2>
              <button onClick={() => setShowCategoryManagement(false)} className="text-gray-500 hover:text-gray-700" aria-label="Close category management">
                <X className="h-6 w-6" />
              </button>
            </div>
            <CategoryManagement onCategoryUpdated={handleCategoryUpdated} />
          </div>
        )}

        {showCouponManagement && (
          <div className="mb-8 transition-all">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-700">Coupon Management</h2>
              <button onClick={() => setShowCouponManagement(false)} className="text-gray-500 hover:text-gray-700" aria-label="Close coupon management">
                <X className="h-6 w-6" />
              </button>
            </div>
            <CouponManagement onCouponUpdated={handleCouponUpdated} />
          </div>
        )}

        {showOrderManagement && (
          <div className="mb-8 transition-all"><OrderManagement /></div>
        )}

        {showDiscountManagement && (
          <div className="mb-8 transition-all"><DiscountManagement /></div>
        )}

        {showHeaderMessageManagement && (
          <div className="mb-8 transition-all"><HeaderMessageManagement /></div>
        )}

        {!showProductForm && !showProductManagement && !showOrderManagement && !showDiscountManagement && !showHeaderMessageManagement && !showCategoryManagement && !showCouponManagement && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">Order Status</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="bg-yellow-100 p-2 rounded-full mr-3"><Clock className="h-5 w-5 text-yellow-600" /></div>
                    <span className="font-medium">Pending Orders</span>
                  </div>
                  <span className="text-lg font-bold">{stats.orders.pending || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-2 rounded-full mr-3"><ShoppingBag className="h-5 w-5 text-blue-600" /></div>
                    <span className="font-medium">Processing Orders</span>
                  </div>
                  <span className="text-lg font-bold">{stats.orders.processing || 0}</span>
                </div>
                <div className="pt-4 border-t border-gray-100">
                  <Link to="/admin/orders" className="text-emerald-600 hover:text-emerald-800 font-medium text-sm flex items-center justify-center">
                    View All Orders<ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">Store Statistics</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center"><span className="text-gray-600">Products in Stock</span><span className="font-bold">{stats.products}</span></div>
                <div className="flex justify-between items-center"><span className="text-gray-600">Total Categories</span><span className="font-bold">{stats.categories}</span></div>
                <div className="flex justify-between items-center"><span className="text-gray-600">Active Discounts</span><span className="font-bold text-green-600">{stats.discounts.active}</span></div>
                <div className="flex justify-between items-center"><span className="text-gray-600">Total Discounts</span><span className="font-bold">{stats.discounts.total}</span></div>
                <div className="flex justify-between items-center"><span className="text-gray-600">Active Coupons</span><span className="font-bold text-blue-600">{stats.coupons.active}</span></div>
                <div className="flex justify-between items-center"><span className="text-gray-600">Total Coupons</span><span className="font-bold">{stats.coupons.total}</span></div>
                <div className="flex justify-between items-center"><span className="text-gray-600">Expired Coupons</span><span className="font-bold text-red-600">{stats.coupons.expired}</span></div>
                <div className="flex justify-between items-center"><span className="text-gray-600">Active Messages</span><span className="font-bold text-purple-600">{stats.headerMessages.active}</span></div>
                <div className="flex justify-between items-center"><span className="text-gray-600">Registered Users</span><span className="font-bold">{stats.users}</span></div>
                <div className="flex justify-between items-center"><span className="text-gray-600">Total Orders</span><span className="font-bold">{stats.orders.total}</span></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;