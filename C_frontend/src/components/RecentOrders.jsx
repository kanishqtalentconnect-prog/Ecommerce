import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Package2, Clock, ChevronRight, RefreshCcw } from "lucide-react";
import axiosInstance from "../lib/axios";

const RecentOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRecentOrders();
  }, []);

  const fetchRecentOrders = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axiosInstance.get("/api/admin/orders/recent");
      setOrders(response.data.data || []);
    } catch (error) {
      console.error("Error fetching recent orders:", error);
      setError("Failed to load recent orders");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    
    // If the date is today, show time only
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // If the date is yesterday, show "Yesterday" and time
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // Otherwise show date and time
    return date.toLocaleDateString() + ', ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getTimeSince = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now - date) / 1000);
    
    let interval = Math.floor(seconds / 86400); // days
    if (interval >= 1) {
      return interval === 1 ? `${interval} day ago` : `${interval} days ago`;
    }
    
    interval = Math.floor(seconds / 3600); // hours
    if (interval >= 1) {
      return interval === 1 ? `${interval} hour ago` : `${interval} hours ago`;
    }
    
    interval = Math.floor(seconds / 60); // minutes
    if (interval >= 1) {
      return interval === 1 ? `${interval} minute ago` : `${interval} minutes ago`;
    }
    
    return 'Just now';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 h-full">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Recent Orders</h2>
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex justify-between p-4 border-b border-gray-100">
              <div className="w-full">
                <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-700">Recent Orders</h2>
        
        <button 
          onClick={fetchRecentOrders}
          className="text-gray-500 hover:text-gray-700"
          title="Refresh orders"
        >
          <RefreshCcw className="h-5 w-5" />
        </button>
      </div>

      {error ? (
        <div className="text-center py-6 border border-gray-100 rounded-lg">
          <p className="text-red-500 mb-2">{error}</p>
          <button 
            onClick={fetchRecentOrders}
            className="text-emerald-600 hover:text-emerald-800 inline-flex items-center text-sm"
          >
            <RefreshCcw className="h-4 w-4 mr-1" />
            Try Again
          </button>
        </div>
      ) : orders.length > 0 ? (
        <div className="divide-y divide-gray-100">
          {orders.map((order) => (
            <div key={order._id} className="py-3">
              <Link 
                to={`/admin/orders/${order._id}`}
                className="flex items-start justify-between hover:bg-gray-50 p-2 rounded-md transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center">
                    <div className="bg-emerald-100 p-1.5 rounded-full mr-3">
                      <Package2 className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        #{order._id.substring(order._id.length - 6).toUpperCase()}
                      </p>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {order.user?.name || "Guest Customer"} • ₹{order.totalAmount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="text-right mr-3">
                    <p className="text-xs text-gray-500 flex items-center justify-end">
                      <Clock className="h-3 w-3 mr-1" />
                      {getTimeSince(order.createdAt)}
                    </p>
                    <p className={`text-sm mt-0.5 uppercase font-medium ${
                      order.status === "pending" ? "text-yellow-600" : 
                      order.status === "processing" ? "text-blue-600" : 
                      "text-gray-600"
                    }`}>
                      {order.status}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </Link>
            </div>
          ))}
          
          <div className="pt-3">
            <Link 
              to="/admin/orders"
              className="text-emerald-600 hover:text-emerald-800 font-medium text-sm flex items-center justify-center"
            >
              View All Orders
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 border border-gray-100 rounded-lg">
          <Package2 className="mx-auto h-8 w-8 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No recent orders</h3>
          <p className="mt-1 text-xs text-gray-500">
            New orders requiring processing will appear here.
          </p>
        </div>
      )}
    </div>
  );
};

export default RecentOrders;