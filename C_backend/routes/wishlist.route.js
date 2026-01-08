import express from "express";
import { toggleWishlist, getWishlist } from "../controllers/wishlist.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/toggle", protectRoute, toggleWishlist);
router.get("/", protectRoute, getWishlist);

export default router;
