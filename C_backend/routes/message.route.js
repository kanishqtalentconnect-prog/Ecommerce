import express from "express";
import {
  getActiveHeaderMessages,
  getAllHeaderMessages,
  createHeaderMessage,
  updateHeaderMessage,
  toggleHeaderMessageStatus,
  deleteHeaderMessage
} from "../controllers/message.controller.js";
import { adminRoute, protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes
router.get("/active", getActiveHeaderMessages);

// Admin routes
router.get("/", protectRoute, adminRoute, getAllHeaderMessages);
router.post("/", protectRoute, adminRoute, createHeaderMessage);
router.put("/:id", protectRoute, adminRoute, updateHeaderMessage);
router.patch("/:id/toggle", protectRoute, adminRoute, toggleHeaderMessageStatus);
router.delete("/:id", protectRoute, adminRoute, deleteHeaderMessage);

export default router;