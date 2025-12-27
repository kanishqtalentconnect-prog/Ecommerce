import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { 
  createReview,
  getProductReviews,
  getUserReviews,
  getReviewableProducts,
  updateReview,
  deleteReview,
  markReviewHelpful,
  getRecentReviews  // Add this import
} from "../controllers/review.controller.js";

const router = express.Router();

// Public routes
router.get("/product/:productId", getProductReviews);
router.get("/recent", getRecentReviews); // Add this route

// Protected routes (require authentication)
router.post("/", protectRoute, createReview);
router.get("/my-reviews", protectRoute, getUserReviews);
router.get("/reviewable", protectRoute, getReviewableProducts);
router.put("/:reviewId", protectRoute, updateReview);
router.delete("/:reviewId", protectRoute, deleteReview);
router.patch("/:reviewId/helpful", protectRoute, markReviewHelpful);

export default router;