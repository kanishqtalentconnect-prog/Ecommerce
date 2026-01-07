import razorpay from "../lib/razorpay.js";
import Order from '../models/order.model.js';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Razorpay with your API keys

export const razorpayWebhook = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];
    const body = req.body.toString();

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    if (signature !== expectedSignature) {
      return res.status(400).send('Invalid signature');
    }

    const event = JSON.parse(body);

    if (event.event === 'order.paid') {
      const razorpayOrderId = event.payload.order.entity.id;
      const razorpayPaymentId = event.payload.payment.entity.id;

      const order = await Order.findOne({ razorpayOrderId });
      if (!order) return res.status(200).json({ ok: true });

      // 🔐 DO NOT overwrite if already processed
      if (order.paymentId) {
        return res.status(200).json({ ok: true });
      }

      order.status = 'processing';
      order.paymentId = razorpayPaymentId;
      order.paymentDate = new Date();
      await order.save();
    }

    if (event.event === 'payment.failed') {
      const razorpayOrderId = event.payload.payment.entity.order_id;
      const order = await Order.findOne({ razorpayOrderId });

      if (order && !order.paymentId) {
        order.status = 'failed';
        await order.save();
      }
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Webhook error', err);
    return res.status(200).json({ ok: true }); 
  }
};


// Create Razorpay order
export const createOrder = async (req, res) => {
  try {
    const {orderId } = req.body;
    
    // Find the order in our database
    const existingOrder = await Order.findById(orderId);
    if (!existingOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const amount = existingOrder.totalAmount;
    
    // Validate input
    if (!orderId) {
      return res.status(400).json({ message: 'orderId are required' });
    }
    
    
    // Verify that this user owns this order
    if (existingOrder.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized access to this order' });
    }
    
    //Checking IDEMPOTENCY
    if (existingOrder.razorpayOrderId) {
      return res.status(200).json({
        orderId: existingOrder.razorpayOrderId,
        amount: existingOrder.totalAmount,
        currency: 'INR',
        keyId: process.env.RAZORPAY_KEY_ID,
      });
    }

    // Create Razorpay order (amount in paise - multiply by 100)
    const razorpayOrder = await razorpay.orders.create({
      amount: amount * 100, // Razorpay expects amount in the smallest currency unit (paise)
      currency: 'INR',
      receipt: orderId,
    });
    
    // Update the order with Razorpay order ID
    existingOrder.status = 'processing';
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

    //Ownership check
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    
    //Prevent Cross-order payment 
    if (order.razorpayOrderId !== razorpay_order_id) {
      return res.status(400).json({ message: 'Order ID mismatch' });
    }

    //Check if already paid
    if (order.paymentId) {
      return res.status(200).json({
        success: true,
        message: 'Payment already verified',
      });
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