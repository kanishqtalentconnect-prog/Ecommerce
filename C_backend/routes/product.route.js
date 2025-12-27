import express from "express";
import { 
    getAllProducts,
    getFeaturedProducts,
    getRecommendedProducts,
    getProductByCategory,
    searchByName,
    createProduct,
    updateProduct, // NEW: Import updateProduct
    toggleFeaturedProduct,
    deleteProduct,
    getProductsById
} from "../controllers/product.controller.js";
import multer from "multer";
import { adminRoute, protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// Update multer config to handle multiple file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Configure multer for multiple file fields
const multipleUpload = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'additionalImages', maxCount: 4 }
]);

// Public routes
router.get("/", getAllProducts);
router.get("/search", searchByName);
router.get("/featured", getFeaturedProducts);
router.get("/category/:category", getProductByCategory);
router.get("/recommendations", getRecommendedProducts);
router.get("/:id", getProductsById);

// Protected admin routes
router.post("/", protectRoute, adminRoute, multipleUpload, createProduct);
router.put("/:id", protectRoute, adminRoute, multipleUpload, updateProduct); // NEW: Update route
router.patch("/:id", protectRoute, adminRoute, toggleFeaturedProduct);
router.delete("/:id", protectRoute, adminRoute, deleteProduct);

export default router;