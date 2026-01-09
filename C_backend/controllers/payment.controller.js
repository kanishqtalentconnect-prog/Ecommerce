import razorpay from "../lib/razorpay.js";
import Order from "../models/order.model.js";
import crypto from "crypto";
import dotenv from "dotenv";
import { sendEmail } from "../utils/sendEmail.js";
import {
  adminOrderPlacedTemplate,
  userOrderPlacedTemplate,
} from "../utils/emailTemplates.js";

dotenv.config();


// BACKGROUND EMAIL SENDER (RUNS ONLY ONCE)

const sendOrderEmails = async (orderId) => {
  try {
    const order = await Order.findById(orderId);
    if (!order || order.emailSent) {
      console.log("📭 Emails already sent or order missing");
      return;
    }

    const populatedOrder = await Order.findById(orderId)
      .populate("user")
      .populate({
        path: "products.product",
        populate: { path: "owner" },
      });

    if (!populatedOrder?.user?.email) {
      console.warn("⚠️ User email missing, skipping emails");
      return;
    }

    /* GROUP PRODUCTS BY OWNER */
    const ownerMap = {};
    populatedOrder.products.forEach((item) => {
      const owner = item.product?.owner;
      if (!owner?.email) return;

      const ownerId = owner._id.toString();
      if (!ownerMap[ownerId]) {
        ownerMap[ownerId] = { owner, products: [] };
      }
      ownerMap[ownerId].products.push(item);
    });

    /* EMAIL TO PRODUCT OWNERS */
    for (const id in ownerMap) {
      const { owner, products } = ownerMap[id];

      await sendEmail({
        to: owner.email,
        subject: "🛒 New Order for Your Product",
        html: adminOrderPlacedTemplate({
          order: populatedOrder,
          products,
          owner,
        }),
      });
    }

    /* EMAIL TO CUSTOMER */
    
    await sendEmail({
      to: populatedOrder.user.email,
      subject: "✅ Order Placed Successfully",
      html: userOrderPlacedTemplate(populatedOrder),
    });

    order.emailSent = true;
    await order.save();

    console.log("All emails sent successfully");
  } catch (error) {
    console.error("Email Background Error:", error.message);
  }
};


// CREATE RAZORPAY ORDER

export const createOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);

    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (order.razorpayOrderId) {
      return res.status(200).json({
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

    res.status(200).json({
      orderId: razorpayOrder.id,
      amount: order.totalAmount,
      currency: "INR",
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error("Create Order Error:", err);
    res.status(500).json({ message: "Payment processing error" });
  }
};


//   VERIFY PAYMENT (FRONTEND CALLBACK)
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    if (!orderId) {
      console.log("X. Fail: No orderId");
      return res.status(400).json({ message: "Missing orderId" });
    }

    const order = await Order.findById(orderId).maxTimeMS(5000); // 5 second timeout
    
    if (!order) {
      console.log("X. Fail: Order not found in DB");
      return res.status(404).json({ message: "Order not found" });
    }

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      console.log("X. Fail: Signature mismatch");
      return res.status(400).json({ message: "Signature mismatch" });
    }

    order.status = "processing";
    order.paymentId = razorpay_payment_id;
    order.paymentDate = new Date();
    await order.save();

    res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      orderId: order._id,
    });

    setImmediate(() => {
      sendOrderEmails(order._id).catch(e => console.error("Email BG Error:", e));
    });

  } catch (err) {
    console.error("!!! CRITICAL ERROR !!!", err);
    if (!res.headersSent) {
      res.status(500).json({ message: "Internal server error", error: err.message });
    }
  }
};

//RAZORPAY WEBHOOK

export const razorpayWebhook = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers["x-razorpay-signature"];

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (signature !== expectedSignature) {
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

        setImmediate(() => sendOrderEmails(order._id));
      }
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Webhook Error:", err);
    res.status(200).json({ ok: true });
  }
};


// GET ORDER STATUS

export const getOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate("products.product")
      .populate("shippingDetails.addressId");

    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    res.status(200).json({ success: true, order });
  } catch (err) {
    res.status(500).json({ message: "Error fetching order" });
  }
};
