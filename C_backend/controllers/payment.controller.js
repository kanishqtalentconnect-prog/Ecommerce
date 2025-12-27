import Razorpay from 'razorpay';
import Order from '../models/order.model.js';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Razorpay with your API keys
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create Razorpay order
export const createOrder = async (req, res) => {
  try {
    const { amount, orderId } = req.body;
    
    // Validate input
    if (!amount || !orderId) {
      return res.status(400).json({ message: 'Amount and orderId are required' });
    }
    
    // Find the order in our database
    const existingOrder = await Order.findById(orderId);
    if (!existingOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Verify that this user owns this order
    if (existingOrder.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized access to this order' });
    }
    
    // Create Razorpay order (amount in paise - multiply by 100)
    const razorpayOrder = await razorpay.orders.create({
      amount: amount * 100, // Razorpay expects amount in the smallest currency unit (paise)
      currency: 'INR',
      receipt: orderId,
      payment_capture: 1, // Auto capture payment
    });
    
    // Update the order with Razorpay order ID
    existingOrder.razorpayOrderId = razorpayOrder.id;
    await existingOrder.save();
    
    // Return order details to client
    return res.status(200).json({
      orderId: razorpayOrder.id,
      amount: amount,
      currency: 'INR',
      keyId: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return res.status(500).json({ message: 'Error processing payment', error: error.message });
  }
};

// Verify Razorpay payment
export const verifyPayment = async (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      orderId 
    } = req.body;
    
    // Validate input
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
      return res.status(400).json({ message: 'Missing payment verification parameters' });
    }
    
    // Find the order in our database
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Create a signature verification string
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');
    
    // Verify signature
    if (generatedSignature !== razorpay_signature) {
      // Signature verification failed
      order.status = 'failed';
      await order.save();
      return res.status(400).json({ message: 'Payment verification failed' });
    }
    
    // Payment successful, update order
    order.status = 'processing';
    order.paymentId = razorpay_payment_id;
    order.paymentDate = new Date();
    await order.save();
    
    return res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      order: {
        id: order._id,
        amount: order.totalAmount,
        status: order.status,
        createdAt: order.createdAt
      }
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return res.status(500).json({ message: 'Error verifying payment', error: error.message });
  }
};

// Get order status
export const getOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    // Find the order
    const order = await Order.findById(orderId)
      .populate('products.product')
      .populate('shippingDetails.addressId');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check if the user owns this order
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized access to this order' });
    }
    
    return res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    return res.status(500).json({ message: 'Error fetching order details', error: error.message });
  }
};