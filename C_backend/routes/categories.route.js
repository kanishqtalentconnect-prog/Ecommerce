import express from "express";
import { protectRoute, adminRoute } from "../middleware/auth.middleware.js";
import { 
  getCategories, 
  getAllCategoriesAdmin,
  getCategoryById,
  createCategory, 
  updateCategory, 
  deleteCategory,
  toggleCategoryStatus
} from "../controllers/categories.controller.js";

const router = express.Router();

// Public routes
router.get("/", getCategories); // Get active categories for public use
router.get("/:id", getCategoryById); // Get single category

// Admin routes
router.get("/admin/all", protectRoute, adminRoute, getAllCategoriesAdmin); // Get all categories for admin
router.post("/", protectRoute, adminRoute, createCategory); // Create category
router.put("/:id", protectRoute, adminRoute, updateCategory); // Update category
router.delete("/:id", protectRoute, adminRoute, deleteCategory); // Delete category
router.patch("/:id/toggle", protectRoute, adminRoute, toggleCategoryStatus); // Toggle active status

export default router;