import express from "express";
import { protectRoute, adminRoute } from "../middleware/auth.middleware.js";
import {
  // Admin routes
  createCoupon,
  getAllCoupons,
  getCouponById,
  updateCoupon,
  toggleCouponStatus,
  deleteCoupon,
  getCouponStats,
  
  // User routes
  getAvailableCoupons,
  validateCoupon,
  applyCoupon
} from "../controllers/coupon.controller.js";

const router = express.Router();

// Admin routes - require admin authentication
router.post("/admin/create", protectRoute, adminRoute, createCoupon);
router.get("/admin/all", protectRoute, adminRoute, getAllCoupons);
router.get("/admin/stats", protectRoute, adminRoute, getCouponStats);
router.get("/admin/:id", protectRoute, adminRoute, getCouponById);
router.put("/admin/:id", protectRoute, adminRoute, updateCoupon);
router.patch("/admin/:id/toggle", protectRoute, adminRoute, toggleCouponStatus);
router.delete("/admin/:id", protectRoute, adminRoute, deleteCoupon);

// User routes - require user authentication
router.get("/available", protectRoute, getAvailableCoupons);
router.post("/validate", protectRoute, validateCoupon);
router.post("/apply", protectRoute, applyCoupon);

export default router;