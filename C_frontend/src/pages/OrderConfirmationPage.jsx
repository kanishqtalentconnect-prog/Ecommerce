import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function OrderConfirmationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Get order ID and payment status from state or query parameters
  const orderId = location.state?.orderId || new URLSearchParams(location.search).get('orderId');
  const paymentId = location.state?.paymentId || new URLSearchParams(location.search).get('paymentId');
  const paymentSuccess = location.state?.paymentSuccess || new URLSearchParams(location.search).get('paymentSuccess') === 'true';
  
  useEffect(() => {
    // If no order ID, redirect to home
    if (!orderId) {
      navigate('/');
      return;
    }
    
    // Fetch order details
    fetchOrderDetails();
    
    // Clear cart after successful order
    clearCart();
  }, [orderId]);
  
  // Fetch order details from backend
  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/payments/order/${orderId}`,
        { withCredentials: true }
      );
      
      if (response.status === 200 && response.data.order) {
        setOrderDetails(response.data.order);
      } else {
        throw new Error('Order details not found');
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      setError('Failed to load order details.');
    } finally {
      setLoading(false);
    }
  };
  
  // Clear the user's cart
  const clearCart = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/cart/clear`,
        {},
        { withCredentials: true }
      );
      console.log("Cart cleared successfully");
    } catch (error) {
      console.error('Error clearing cart:', error);
      // Not showing this error to user as it's not critical to their experience
    }
  };
  
  // Format date to readable format
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Navigate to continue shopping
  const continueShopping = () => {
    navigate('/');
  };
  
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 flex justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg">Loading order details...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded mb-6">
          <p>{error}</p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg"
        >
          Return to Home
        </button>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-green-600 mb-2">Order Confirmed!</h1>
          <p className="text-gray-600">Thank you for your purchase. We've received your order.</p>
        </div>
        
        {orderDetails && (
          <>
            <div className="border-t border-b py-4 mb-6">
              <div className="flex justify-between mb-4">
                <span className="font-medium">Order Number:</span>
                <span>{orderDetails._id}</span>
              </div>
              <div className="flex justify-between mb-4">
                <span className="font-medium">Date:</span>
                <span>{formatDate(orderDetails.createdAt)}</span>
              </div>
              {paymentId && (
                <div className="flex justify-between mb-4">
                  <span className="font-medium">Payment ID:</span>
                  <span>{paymentId}</span>
                </div>
              )}
              <div className="flex justify-between mb-4">
                <span className="font-medium">Payment Status:</span>
                <span className={`capitalize ${orderDetails.status === 'processing' || orderDetails.status === 'delivered' ? 'text-green-600' : 'text-yellow-600'}`}>
                  {orderDetails.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Total Amount:</span>
                <span className="font-bold">₹{orderDetails.totalAmount.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
              {orderDetails.products.map((item, index) => (
                <div key={index} className="flex justify-between items-center mb-3">
                  <div className="flex items-center">
                    <span className="text-gray-700 font-medium">
                      {item.product ? item.product.name : 'Product'} × {item.quantity}
                    </span>
                  </div>
                  <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-3">
                {orderDetails.shippingDetails.deliveryMethod === 'ship' ? 'Shipping' : 'Pickup'} Details
              </h2>
              {orderDetails.shippingDetails.deliveryMethod === 'ship' && orderDetails.shippingDetails.addressId && (
                <div className="bg-gray-50 p-4 rounded">
                  <p className="font-medium">{orderDetails.shippingDetails.addressId.fullName}</p>
                  <p>{orderDetails.shippingDetails.addressId.street}</p>
                  <p>{orderDetails.shippingDetails.addressId.city}, {orderDetails.shippingDetails.addressId.state} {orderDetails.shippingDetails.addressId.zipcode}</p>
                  <p>{orderDetails.shippingDetails.addressId.country}</p>
                  <p>Phone: {orderDetails.shippingDetails.addressId.phone}</p>
                </div>
              )}
              {orderDetails.shippingDetails.deliveryMethod === 'pickup' && orderDetails.shippingDetails.pickupInfo && (
                <div className="bg-gray-50 p-4 rounded">
                  <p className="font-medium">Pickup Person: {orderDetails.shippingDetails.pickupInfo.fullName}</p>
                  <p>Phone: {orderDetails.shippingDetails.pickupInfo.phoneNumber}</p>
                  <p className="mt-2">Store: BudhShiv Lajpat Nagar I Lajpat Nagar</p>
                  <p>E 35 basement, New Delhi DL</p>
                </div>
              )}
            </div>
          </>
        )}
        
        <div className="flex justify-center">
          <button
            onClick={continueShopping}
            className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-8 rounded-lg font-medium"
          >
            Continue Shopping
          </button>
        </div>
      </div>
      
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
        <h3 className="text-lg font-medium mb-2">What's Next?</h3>
        <p className="text-sm text-gray-600 mb-2">
          You will receive an order confirmation email with details of your order.
        </p>
        <p className="text-sm text-gray-600">
          {orderDetails?.shippingDetails?.deliveryMethod === 'ship' 
            ? 'Your order will be processed for shipping soon.' 
            : 'Your order will be ready for pickup soon.'}
        </p>
      </div>
    </div>
  );
}