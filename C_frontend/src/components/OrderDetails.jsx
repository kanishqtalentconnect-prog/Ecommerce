import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  ArrowLeft, 
  Package2, 
  User, 
  MapPin, 
  Phone, 
  Mail,
  Clock,
  CheckCircle, 
  Truck, 
  XCircle, 
  ShoppingBag,
  CreditCard,
  Store
} from "lucide-react";
import axiosInstance from "../lib/axios";

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/api/admin/orders/${id}`);
      setOrder(response.data.data);
    } catch (error) {
      console.error("Error fetching order details:", error);
      setError("Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (newStatus) => {
    setUpdatingStatus(true);
    try {
      await axiosInstance.patch(`/api/admin/orders/${id}/status`, { status: newStatus });
      // Refresh order details after status update
      fetchOrderDetails();
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Failed to update order status. Please try again.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
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
        return <Clock className="h-5 w-5" />;
      case "processing":
        return <ShoppingBag className="h-5 w-5" />;
      case "shipped":
        return <Truck className="h-5 w-5" />;
      case "delivered":
        return <CheckCircle className="h-5 w-5" />;
      case "cancelled":
      case "failed":
        return <XCircle className="h-5 w-5" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            </div>
            <div>
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6 text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Order</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={fetchOrderDetails}
              className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
            >
              Retry
            </button>
            <Link
              to="/admin/orders"
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              Back to Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6 text-center">
          <Package2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-4">The requested order could not be found.</p>
          <Link
            to="/admin/orders"
            className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors inline-flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header with back navigation */}
        <div className="mb-6">
          <Link
            to="/admin/orders"
            className="text-emerald-600 hover:text-emerald-800 inline-flex items-center text-sm font-medium"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Orders
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">
            Order #{id.substring(id.length - 6).toUpperCase()}
          </h1>
        </div>

        {/* Order status and actions */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(order.status)}`}>
                {getStatusIcon(order.status)}
                <span className="ml-1 capitalize">{order.status}</span>
              </span>
              <span className="ml-4 text-sm text-gray-500">
                Placed on {formatDate(order.createdAt)}
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
              {order.status === "pending" && (
                <>
                  <button
                    onClick={() => updateOrderStatus("processing")}
                    disabled={updatingStatus}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    Mark Processing
                  </button>
                  <button
                    onClick={() => updateOrderStatus("cancelled")}
                    disabled={updatingStatus}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50"
                  >
                    Cancel Order
                  </button>
                </>
              )}
              
              {order.status === "processing" && (
                <button
                  onClick={() => updateOrderStatus("shipped")}
                  disabled={updatingStatus}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  Mark Shipped
                </button>
              )}
              
              {order.status === "shipped" && (
                <button
                  onClick={() => updateOrderStatus("delivered")}
                  disabled={updatingStatus}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  Mark Delivered
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Order details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Customer information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Customer Information</h2>
            <div className="space-y-3">
              <div className="flex items-start">
                <User className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">{order.user?.name || "Guest Customer"}</p>
                  {order.user?.email && (
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <Mail className="h-4 w-4 mr-1" />
                      {order.user.email}
                    </div>
                  )}
                  {order.user?.phone && (
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <Phone className="h-4 w-4 mr-1" />
                      {order.user.phone}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Delivery Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              {order.shippingDetails?.deliveryMethod === 'pickup' ? 'Pickup Information' : 'Shipping Address'}
            </h2>
            {order.shippingDetails?.deliveryMethod === 'pickup' ? (
              <div className="flex items-start">
                <Store className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                <div className="text-gray-700">
                  <p className="font-medium">In-Store Pickup</p>
                  {order.shippingDetails?.pickupInfo && (
                    <>
                      <p className="mt-2">{order.shippingDetails.pickupInfo.fullName}</p>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <Phone className="h-4 w-4 mr-1" />
                        {order.shippingDetails.pickupInfo.phoneNumber}
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                {order.shippingDetails?.addressId ? (
                  <div className="text-gray-700">
                    <p>{order.shippingDetails.addressId.fullName}</p>
                    <p>{order.shippingDetails.addressId.street}</p>
                    <p>{order.shippingDetails.addressId.city}, {order.shippingDetails.addressId.state} {order.shippingDetails.addressId.zipcode}</p>
                    <p>{order.shippingDetails.addressId.country}</p>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <Phone className="h-4 w-4 mr-1" />
                      {order.shippingDetails.addressId.phone}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">No shipping address provided</p>
                )}
              </div>
            )}
          </div>
          
          {/* Payment Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Payment Information</h2>
            <div className="space-y-3">
              <div className="flex items-start">
                <CreditCard className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <div className="flex flex-col space-y-2">
                    <div>
                      <p className="font-medium text-gray-900">Payment ID</p>
                      <p className="text-gray-700">{order.paymentId || "Not yet processed"}</p>
                    </div>
                    {order.razorpayOrderId && (
                      <div>
                        <p className="font-medium text-gray-900">Razorpay Order ID</p>
                        <p className="text-gray-700">{order.razorpayOrderId}</p>
                      </div>
                    )}
                    {order.paymentDate && (
                      <div>
                        <p className="font-medium text-gray-900">Payment Date</p>
                        <p className="text-gray-700">{formatDate(order.paymentDate)}</p>
                      </div>
                    )}
                    <div className="flex items-center mt-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${order.paymentId ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                        {order.paymentId ? <CheckCircle className="h-4 w-4 mr-1" /> : <Clock className="h-4 w-4 mr-1" />}
                        {order.paymentId ? "Paid" : "Pending"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Order Items</h2>
          
          {order.products && order.products.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {order.products.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-md overflow-hidden">
                            {item.product?.image ? (
                              <img src={item.product.image} alt={item.product.name} className="h-full w-full object-cover" />
                            ) : (
                              <Package2 className="h-full w-full p-2 text-gray-400" />
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {item.product?.name || "Unknown Product"}
                            </div>
                            <div className="text-xs text-gray-500">
                              SKU: {item.product?.sku || "N/A"}
                            </div>
                            {item.product?.size && (
                              <div className="text-xs text-gray-500">
                                Size: {item.product.size}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                        ₹{item.price.toFixed(2)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">No items found in this order</p>
          )}
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-md font-medium text-gray-700 mb-2">Price Details</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Items Total:</span>
                  <span className="font-medium">
                    ₹{order.products?.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2) || "0.00"}
                  </span>
                </div>
                
                {order.shippingFee !== undefined && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping Fee:</span>
                    <span className="font-medium">₹{order.shippingFee.toFixed(2) || "0.00"}</span>
                  </div>
                )}

                {order.tax !== undefined && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax:</span>
                    <span className="font-medium">₹{order.tax.toFixed(2) || "0.00"}</span>
                  </div>
                )}

                {order.discount !== undefined && order.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Discount:</span>
                    <span className="font-medium text-green-600">-₹{order.discount.toFixed(2)}</span>
                  </div>
                )}

                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Total Amount:</span>
                    <span className="font-bold text-lg">₹{order.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-md font-medium text-gray-700 mb-2">Delivery Method</h3>
                <div className="flex items-center">
                  {order.shippingDetails?.deliveryMethod === 'pickup' ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      <Store className="h-4 w-4 mr-1" />
                      In-Store Pickup
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                      <Truck className="h-4 w-4 mr-1" />
                      Shipping
                    </span>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-md font-medium text-gray-700 mb-2">Payment Status</h3>
                <div className="flex items-center">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${order.paymentId ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                    {order.paymentId ? <CheckCircle className="h-4 w-4 mr-1" /> : <Clock className="h-4 w-4 mr-1" />}
                    {order.paymentId ? "Payment Completed" : "Payment Pending"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Notes & History */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Order Notes */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Order Notes</h2>
            {order.notes ? (
              <p className="text-gray-700">{order.notes}</p>
            ) : (
              <p className="text-gray-500">No notes for this order</p>
            )}
          </div>
          
          {/* Order History */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Order History</h2>
            {order.statusHistory && order.statusHistory.length > 0 ? (
              <div className="space-y-4">
                {order.statusHistory.map((history, index) => (
                  <div key={index} className="flex">
                    <div className="mr-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100">
                        {getStatusIcon(history.status)}
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 capitalize">{history.status}</p>
                      <p className="text-sm text-gray-500">{formatDate(history.timestamp)}</p>
                      {history.note && <p className="text-sm text-gray-600 mt-1">{history.note}</p>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex">
                <div className="mr-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100">
                    {getStatusIcon(order.status)}
                  </div>
                </div>
                <div>
                  <p className="font-medium text-gray-900 capitalize">{order.status}</p>
                  <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;