import express from "express";
import {
  putAddress,
  getAllAddress,
  updateAddress,
  deleteAddress,
  defaultAddress,
} from "../controllers/address.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protectRoute, putAddress);
router.get("/", protectRoute, getAllAddress);
router.put("/:id", protectRoute, updateAddress);
router.delete("/:id", protectRoute, deleteAddress);
router.patch("/:id/default", protectRoute, defaultAddress);

export default router;