import razorpay from "../lib/razorpay.js";
import Order from "../models/order.model.js";
import crypto from "crypto";
import { sendEmail } from "../utils/sendEmail.js";
import {
  adminOrderPlacedTemplate,
  userOrderPlacedTemplate,
} from "../utils/emailTemplates.js";

/* ================= CREATE ORDER ================= */

export const createOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);

    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (order.razorpayOrderId) {
      return res.json({
        orderId: order.razorpayOrderId,
        amount: order.totalAmount,
        currency: "INR",
        keyId: process.env.RAZORPAY_KEY_ID,
      });
    }

    const razorpayOrder = await razorpay.orders.create({
      amount: order.totalAmount * 100,
      currency: "INR",
      receipt: orderId,
    });

    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    res.json({
      orderId: razorpayOrder.id,
      amount: order.totalAmount,
      currency: "INR",
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error("Create order error:", err);
    res.status(500).json({ message: "Payment error" });
  }
};

/* ================= VERIFY PAYMENT ================= */

export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = req.body;

    if (!orderId) {
      return res.status(400).json({ message: "Missing orderId" });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // 🔐 Signature verification
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      order.status = "failed";
      await order.save();
      return res.status(400).json({ message: "Signature mismatch" });
    }

    // ✅ Idempotency
    if (order.paymentId) {
      return res.json({ success: true, message: "Already verified" });
    }

    // ✅ Update order
    order.status = "processing";
    order.paymentId = razorpay_payment_id;
    order.paymentDate = new Date();
    await order.save();

    // ✅ Populate once
    const populatedOrder = await Order.findById(order._id)
      .populate("user")
      .populate({
        path: "products.product",
        populate: { path: "owner" },
      });

    /* ===== SEND EMAILS (INLINE – REQUIRED FOR VERCEL) ===== */

    const ownerMap = {};
    populatedOrder.products.forEach((item) => {
      const owner = item.product?.owner;
      if (!owner?.email) return;

      const id = owner._id.toString();
      if (!ownerMap[id]) ownerMap[id] = { owner, products: [] };
      ownerMap[id].products.push(item);
    });

    // Vendor emails
    for (const id in ownerMap) {
      const { owner, products } = ownerMap[id];
      await sendEmail({
        to: owner.email,
        subject: "🛒 New Order Received",
        html: adminOrderPlacedTemplate({
          order: populatedOrder,
          products,
          owner,
        }),
      });
    }

    // User email
    await sendEmail({
      to: populatedOrder.user.email,
      subject: "✅ Order Placed Successfully",
      html: userOrderPlacedTemplate(populatedOrder),
    });

    res.json({
      success: true,
      message: "Payment verified & emails sent",
      order: populatedOrder,
    });
  } catch (err) {
    console.error("Verify payment error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

/* ================= WEBHOOK (BACKUP ONLY) ================= */

export const razorpayWebhook = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers["x-razorpay-signature"];

    const expected = crypto
      .createHmac("sha256", secret)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (signature !== expected) {
      return res.status(400).send("Invalid signature");
    }

    const event = req.body;

    if (event.event === "order.paid") {
      const razorpayOrderId = event.payload.order.entity.id;
      const razorpayPaymentId = event.payload.payment.entity.id;

      const order = await Order.findOne({ razorpayOrderId });
      if (order && !order.paymentId) {
        order.status = "processing";
        order.paymentId = razorpayPaymentId;
        order.paymentDate = new Date();
        await order.save();
      }
    }

    res.json({ ok: true });
  } catch (err) {
    console.error("Webhook error:", err);
    res.json({ ok: true });
  }
};
// ================= GET ORDER STATUS (USER) =================

export const getOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({ message: "Order ID is required" });
    }

    const order = await Order.findById(orderId)
      .populate("user", "name email phone")
      .populate({
        path: "products.product",
        populate: { path: "owner", select: "name email" },
      })
      .populate("shippingDetails.addressId");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // 🔐 Ownership check (VERY IMPORTANT)
    if (order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Get order status error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch order status",
    });
  }
};
