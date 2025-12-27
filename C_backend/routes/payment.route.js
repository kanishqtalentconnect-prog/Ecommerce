import express from "express";
import { createOrder, verifyPayment, getOrderStatus } from "../controllers/payment.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// Create a Razorpay order
router.post("/create-order", protectRoute, createOrder);

// Verify payment after completion
router.post("/verify-payment", protectRoute, verifyPayment);

// Get order details
router.get("/order/:orderId", protectRoute, getOrderStatus);

export default router;