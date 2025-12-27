import express from "express";
import { adminRoute, protectRoute } from "../middleware/auth.middleware.js";
import { getProductVariants, addProductVariant,updateProductVariant, deleteProductVariant } from "../controllers/productVariant.controller.js";

const router = express.Router();

router.get("/", protectRoute, getProductVariants); // Retrieve all variants of a specific product
router.post("/", protectRoute, adminRoute, addProductVariant); // Add a new variant (Admin only)
router.put("/:variantId", protectRoute, adminRoute, updateProductVariant); // Update a variant (Admin only)
router.delete("/:variantId", protectRoute, adminRoute, deleteProductVariant); // Delete a variant (Admin only)

export default router;