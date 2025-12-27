import express from "express";
import { protectRoute, adminRoute } from "../middleware/auth.middleware.js";
import { 
  getAllOrders, 
  getRecentOrders, 
  getOrderCounts,
  getOrderById,
  updateOrderStatus
} from "../controllers/orders.controller.js";

const router = express.Router();

// Debug middleware to log all requests
router.use((req, res, next) => {
  console.log(`Orders Route - Method: ${req.method}, Path: ${req.path}, Full URL: ${req.originalUrl}`);
  next();
});

// Admin routes - Order matters! More specific routes should come first
router.get("/recent", protectRoute, adminRoute, getRecentOrders);
router.get("/counts", protectRoute, adminRoute, getOrderCounts);
router.patch("/:id/status", protectRoute, adminRoute, updateOrderStatus);
router.get("/:id", protectRoute, adminRoute, getOrderById);
router.get("/", protectRoute, adminRoute, getAllOrders);

export default router;