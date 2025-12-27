import express from "express";
import { createOrder, getUserOrders } from "../controllers/checkout.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// Create a new order
router.post("/", protectRoute, createOrder);

// Get user's orders
router.get("/", protectRoute, getUserOrders);

export default router;