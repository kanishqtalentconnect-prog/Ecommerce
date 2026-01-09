import razorpay from "../lib/razorpay.js";
import Order from '../models/order.model.js';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { sendEmail } from "../utils/sendEmail.js";
import {
  adminOrderPlacedTemplate,
  userOrderPlacedTemplate,
} from "../utils/emailTemplates.js";

dotenv.config();

/**
 * SHARED UTILITY: handleOrderCompletion
 * This ensures that order status updates and emails happen exactly once,
 * whether triggered by the Webhook or the Frontend Verify call.
 */
const handleOrderCompletion = async (orderId, razorpayPaymentId) => {
  const order = await Order.findById(orderId);
  
  if (!order) return null;

  // Idempotency: If already processed, don't send emails again
  if (order.status === "processing" && order.paymentId) {
    console.log(`Order ${orderId} already processed. Skipping emails.`);
    return order;
  }

  // Update Order Status
  order.status = "processing";
  order.paymentId = razorpayPaymentId;
  order.paymentDate = new Date();
  await order.save();

  console.log("📧 Fetching details to send emails...");
  
  const populatedOrder = await Order.findById(order._id)
    .populate("user")
    .populate({
      path: "products.product",
      populate: { path: "owner" }
    });

  // Group products by owner to send vendor notifications
  const ownerMap = {};
  populatedOrder.products.forEach(item => {
    const owner = item.product?.owner;
    if (!owner) return;

    const ownerId = owner._id.toString();
    if (!ownerMap[ownerId]) {
      ownerMap[ownerId] = { owner, products: [] };
    }
    ownerMap[ownerId].products.push(item);
  });

  // 1. Emails to Product Owners (Vendors)
  for (const ownerId in ownerMap) {
    const { owner, products } = ownerMap[ownerId];
    console.log("Sending email to owner:", owner.email);
    await sendEmail({
      to: owner.email,
      subject: "New Order for Your Product",
      html: adminOrderPlacedTemplate({
        order: populatedOrder,
        products,
        owner
      }),
    });
  }

  // 2. Email to the Customer
  console.log("Sending email to user:", populatedOrder.user.email);
  await sendEmail({
    to: populatedOrder.user.email,
    subject: "Order Placed Successfully",
    html: userOrderPlacedTemplate(populatedOrder),
  });

  return order;
};

// --- EXPORTED CONTROLLERS ---

export const razorpayWebhook = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];
    const body = JSON.stringify(req.body); // Use JSON.stringify for body comparison

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    if (signature !== expectedSignature) {
      return res.status(400).send('Invalid signature');
    }

    const event = req.body;

    if (event.event === 'order.paid') {
      const razorpayOrderId = event.payload.order.entity.id;
      const razorpayPaymentId = event.payload.payment.entity.id;

      const order = await Order.findOne({ razorpayOrderId });
      if (order) {
        await handleOrderCompletion(order._id, razorpayPaymentId);
      }
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
    console.error('Webhook error:', err);
    return res.status(200).json({ ok: true }); 
  }
};

export const createOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    const existingOrder = await Order.findById(orderId);
    
    if (!existingOrder) return res.status(404).json({ message: 'Order not found' });
    if (existingOrder.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Reuse existing Razorpay Order if it exists
    if (existingOrder.razorpayOrderId) {
      return res.status(200).json({
        orderId: existingOrder.razorpayOrderId,
        amount: existingOrder.totalAmount,
        currency: 'INR',
        keyId: process.env.RAZORPAY_KEY_ID,
      });
    }

    const razorpayOrder = await razorpay.orders.create({
      amount: existingOrder.totalAmount * 100,
      currency: 'INR',
      receipt: orderId,
    });
    
    existingOrder.razorpayOrderId = razorpayOrder.id;
    await existingOrder.save();
    
    return res.status(200).json({
      orderId: razorpayOrder.id,
      amount: existingOrder.totalAmount,
      currency: 'INR',
      keyId: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return res.status(500).json({ message: 'Payment processing error' });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;
    
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
      return res.status(400).json({ message: 'Missing parameters' });
    }
    
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // 1. Signature Verification
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');
    
    if (generatedSignature !== razorpay_signature) {
      order.status = 'failed';
      await order.save();
      return res.status(400).json({ message: 'Signature mismatch' });
    }

    // 2. Complete Order (This handles the race condition with the Webhook)
    const updatedOrder = await handleOrderCompletion(order._id, razorpay_payment_id);

    return res.status(200).json({
      success: true,
      message: 'Payment processed successfully',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Verify error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('products.product')
      .populate('shippingDetails.addressId');
    
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    return res.status(200).json({ success: true, order });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching order' });
  }
};