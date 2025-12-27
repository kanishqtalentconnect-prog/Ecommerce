import express from "express";
import { body } from "express-validator";

import { adminRoute, protectRoute } from "../middleware/auth.middleware.js";
import { getAllFaq, addNewFaq, updateFaq, deleteFaq } from "../controllers/faq.controller.js";

const router = express.Router();

// ✅ Get all FAQs
router.get("/", getAllFaq);

// ✅ Create new FAQ (Fix: Middleware for validation)
router.post(
  "/",
  protectRoute,
  adminRoute,
  [
    body("question").notEmpty().withMessage("Question is required"),
    body("answer").notEmpty().withMessage("Answer is required"),
  ],
  addNewFaq
);

// ✅ Update FAQ by ID
router.put(
  "/:id",
  protectRoute,
  adminRoute,
  [
    body("question").optional().notEmpty().withMessage("Question cannot be empty"),
    body("answer").optional().notEmpty().withMessage("Answer cannot be empty"),
  ],
  updateFaq
);

// ✅ Delete FAQ by ID
router.delete("/:id", protectRoute, adminRoute, deleteFaq);

export default router;