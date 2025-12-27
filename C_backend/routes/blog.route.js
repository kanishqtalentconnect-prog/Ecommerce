import express from "express";
import { protectRoute, adminRoute } from "../middleware/auth.middleware.js";
import { getAllBlogs, getBlogById, createBlog, updateBlog, deleteBlog } from "../controllers/blog.controller.js";

const router = express.Router();

// Public Routes
router.get("/", getAllBlogs); // Get all blogs
router.get("/:id", getBlogById); // Get a specific blog by ID

// Admin Routes
router.post("/", protectRoute, adminRoute, createBlog); // Create a blog (admin only)
router.put("/:id", protectRoute, adminRoute, updateBlog); // Update a blog (admin only)
router.delete("/:id", protectRoute, adminRoute, deleteBlog); // Delete a blog (admin only)

export default router;