import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Package2, ArrowRight, Truck, CheckCircle, XCircle, Clock, ShoppingBag } from "lucide-react";
import axiosInstance from "../lib/axios";

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [orderCounts, setOrderCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;

  useEffect(() => {
    fetchOrders();
    fetchOrderCounts();
  }, [selectedStatus]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const url = selectedStatus === "all" 
        ? "/api/admin/orders" 
        : `/api/admin/orders?status=${selectedStatus}`;
      
      const response = await axiosInstance.get(url);
      setOrders(response.data.data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderCounts = async () => {
    try {
      const response = await axiosInstance.get("/api/admin/orders/counts");
      setOrderCounts(response.data.data || {});
    } catch (error) {
      console.error("Error fetching order counts:", error);
    }
  };

  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      pending: "bg-yellow-100 text-yellow-800",
      processing: "bg-blue-100 text-blue-800",
      shipped: "bg-purple-100 text-purple-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      failed: "bg-gray-100 text-gray-800"
    };
    return statusClasses[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "processing":
        return <ShoppingBag className="h-4 w-4" />;
      case "shipped":
        return <Truck className="h-4 w-4" />;
      case "delivered":
        return <CheckCircle className="h-4 w-4" />;
      case "cancelled":
      case "failed":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Pagination logic
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(orders.length / ordersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-700">Order Management</h2>
        <div className="flex space-x-2">
          <button 
            onClick={() => setSelectedStatus("all")}
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              selectedStatus === "all" ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-700"
            }`}
          >
            All ({orderCounts.total || 0})
          </button>
          <button 
            onClick={() => setSelectedStatus("pending")}
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              selectedStatus === "pending" ? "bg-yellow-600 text-white" : "bg-yellow-100 text-yellow-800"
            }`}
          >
            Pending ({orderCounts.pending || 0})
          </button>
          <button 
            onClick={() => setSelectedStatus("processing")}
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              selectedStatus === "processing" ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-800"
            }`}
          >
            Processing ({orderCounts.processing || 0})
          </button>
          <button 
            onClick={() => setSelectedStatus("shipped")}
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              selectedStatus === "shipped" ? "bg-purple-600 text-white" : "bg-purple-100 text-purple-800"
            }`}
          >
            Shipped ({orderCounts.shipped || 0})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="border rounded-lg p-4">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : orders.length > 0 ? (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{order._id.substring(order._id.length - 6).toUpperCase()}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.user?.name || "Guest"}
                      {order.user?.email && (
                        <div className="text-xs text-gray-400">{order.user.email}</div>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      ₹{order.totalAmount.toFixed(2)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="ml-1 capitalize">{order.status}</span>
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link 
                        to={`/admin/orders/${order._id}`}
                        className="text-emerald-600 hover:text-emerald-800 inline-flex items-center"
                      >
                        View
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <nav className="inline-flex rounded-md shadow">
                <button 
                  onClick={() => paginate(currentPage > 1 ? currentPage - 1 : 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-l-md text-sm font-medium ${
                    currentPage === 1 
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Previous
                </button>
                {[...Array(totalPages).keys()].map(number => (
                  <button
                    key={number + 1}
                    onClick={() => paginate(number + 1)}
                    className={`px-3 py-1 text-sm font-medium ${
                      currentPage === number + 1
                        ? "bg-emerald-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {number + 1}
                  </button>
                ))}
                <button 
                  onClick={() => paginate(currentPage < totalPages ? currentPage + 1 : totalPages)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded-r-md text-sm font-medium ${
                    currentPage === totalPages
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <Package2 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {selectedStatus === "all" 
              ? "There are no orders in the system yet."
              : `No orders with '${selectedStatus}' status were found.`}
          </p>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;