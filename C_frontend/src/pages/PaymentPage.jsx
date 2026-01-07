import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { loadScript } from '../utils/scriptLoader';

export default function PaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [razorpayReady, setRazorpayReady] = useState(false);

  
  // Get order ID from URL state or query parameters
  const orderId = location.state?.orderId || new URLSearchParams(location.search).get('orderId');
  useEffect(() => {
    loadRazorpayScript();
}, []);

  useEffect(() => {
    // If no order ID, redirect back to checkout
    if (!orderId) {
      navigate('/checkout');
      return;
    }
    
    // Fetch order details
    fetchOrderDetails();
    
  }, [orderId]);
  
  // Load Razorpay script
  const loadRazorpayScript = async () => {
    try {
      await loadScript('https://checkout.razorpay.com/v1/checkout.js');
      setRazorpayReady(true);
    } catch (error) {
      console.error('Razorpay script failed to load:', error);
      setError('Payment gateway failed to load. Please refresh the page or try again later.');
    }
  };
  
  // Fetch order details from backend
  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/payments/order/${orderId}`,
        { withCredentials: true }
      );
      
      if (response.status === 200) {
        setOrderDetails(response.data.order);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      setError('Failed to load order details. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
const initializePayment = async () => {
  // Prevent double click
  if (processingPayment) return;

  // Prevent re-payment
  if (orderDetails.paymentStatus === 'paid') {
    navigate(`/order-confirmation?orderId=${orderDetails._id}`);
    return;
  }

  setProcessingPayment(true);

  try {
    // Create Razorpay order
    const orderResponse = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/payments/create-order`,
      { orderId: orderDetails._id },
      { withCredentials: true }
    );

    const options = {
      key: orderResponse.data.keyId,
      amount: orderResponse.data.amount,
      currency: orderResponse.data.currency,
      name: 'BudhShiv Store',
      description: `Order #${orderDetails._id}`,
      order_id: orderResponse.data.orderId,
      notes: {
        internal_order_id: orderDetails._id,
        user_id: orderDetails.user,
      },


      handler: async (response) => {
        try {
          const verifyRes = await axios.post(
            `${import.meta.env.VITE_API_URL}/api/payments/verify-payment`,
            {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: orderDetails._id,
            },
            { withCredentials: true }
          );

          if (verifyRes.data.success) {
            setProcessingPayment(false);
            navigate(`/order-confirmation?orderId=${orderDetails._id}`);
          } else {
            setError('Payment verification failed');
            setProcessingPayment(false);
          }
        } catch {
          setError('Payment verification failed');
          setProcessingPayment(false);
        }
      },

      prefill: {
        name:
          orderDetails.shippingDetails.addressId?.fullName ||
          orderDetails.shippingDetails.pickupInfo?.fullName ||
          '',
        email: orderDetails.email || '',
        contact:
          orderDetails.shippingDetails.addressId?.phone ||
          orderDetails.shippingDetails.pickupInfo?.phoneNumber ||
          '',
      },

      theme: { color: '#3399cc' },
    };

    if (!window.Razorpay) {
      setError('Payment gateway not available. Please refresh.');
      setProcessingPayment(false);
      return;
    }
    const razorpay = new window.Razorpay(options);
    

    razorpay.open();

    // Payment failed
    razorpay.on('payment.failed', (response) => {
      setError(response.error.description);
      setProcessingPayment(false);
    });

    // User closed modal
    razorpay.on('modal.closed', () => {
      setProcessingPayment(false);
    });

  } catch (error) {
    console.error(error);
    setError('Failed to initialize payment');
    setProcessingPayment(false);
  }
};
  
  // Cancel order
  const cancelOrder = () => {
    navigate('/cart');
  };
  
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 flex justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg">Loading payment details...</p>
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
          onClick={() => navigate('/checkout')}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg"
        >
          Return to Checkout
        </button>
      </div>
    );
  }
  
  if (!orderDetails) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <p>Order details not found.</p>
        <button
          onClick={() => navigate('/checkout')}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg"
        >
          Return to Checkout
        </button>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h1 className="text-2xl font-bold mb-6">Complete Your Payment</h1>
        
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3">Order Summary</h2>
          <div className="border-t border-b py-4">
            {orderDetails.products.map((item, index) => (
              <div key={index} className="flex justify-between items-center mb-3">
                <div className="flex items-center">
                  <span className="text-gray-700 font-medium">
                    {item.product.name} × {item.quantity}
                  </span>
                </div>
                <span>₹{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          
          <div className="flex justify-between items-center py-4 border-b">
            <span className="font-medium">Delivery Method</span>
            <span className="capitalize">{orderDetails.shippingDetails.deliveryMethod}</span>
          </div>
          
          <div className="flex justify-between items-center py-4 mt-2">
            <span className="text-lg font-semibold">Total Amount</span>
            <span className="text-lg font-bold">₹{orderDetails.totalAmount.toFixed(2)}</span>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={initializePayment}
            disabled={processingPayment || !razorpayReady}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white py-3 px-6 rounded-lg font-medium flex-1 flex justify-center items-center"
          >
            {processingPayment ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              'Pay Now ₹' + orderDetails.totalAmount.toFixed(2)
            )}
          </button>
          
          <button
            onClick={cancelOrder}
            disabled={processingPayment}
            className="border border-gray-300 hover:bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
      
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
        <h3 className="text-lg font-medium mb-2">Secure Payment</h3>
        <p className="text-sm text-gray-600">
          All transactions are secure and encrypted. Your payment information is never stored on our servers.
        </p>
      </div>
    </div>
  );
}