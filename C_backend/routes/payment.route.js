import express from "express";
import {
  createOrder,
  verifyPayment,
  getOrderStatus,
  razorpayWebhook
} from "../controllers/payment.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

//  USER ROUTES
router.post("/create-order", protectRoute, createOrder);
router.post("/verify-payment", protectRoute, verifyPayment);
router.get("/order/:orderId", protectRoute, getOrderStatus);

// RAZORPAY WEBHOOK (NO AUTH)
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  razorpayWebhook
);

export default router;
