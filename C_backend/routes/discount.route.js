import express from "express";
import {
  createDiscount,
  getAllDiscounts,
  getActiveDiscounts,
  updateDiscount,
  toggleDiscountStatus,
  deleteDiscount,
  getProductDiscounts,
  getDiscountById
} from "../controllers/discount.controller.js";
import { adminRoute, protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes
router.get("/active", getActiveDiscounts);
router.get("/product/:productId", getProductDiscounts);
router.get("/:id", getDiscountById); // New route to get individual discount

// Admin routes
router.get("/", protectRoute, adminRoute, getAllDiscounts);
router.post("/", protectRoute, adminRoute, createDiscount);
router.put("/:id", protectRoute, adminRoute, updateDiscount);
router.patch("/:id/toggle", protectRoute, adminRoute, toggleDiscountStatus);
router.delete("/:id", protectRoute, adminRoute, deleteDiscount);

export default router;