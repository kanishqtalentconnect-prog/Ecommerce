import express from "express";
import { setRate, setNewRate, updateRate, deleteRate } from "../controllers/shippingrate.controller.js";
import { protectRoute, adminRoute } from "../middleware/auth.middleware.js";

const router = express.Router()

router.get("/", setRate)
router.post("/", protectRoute, adminRoute, setNewRate)
router.put("/:id", protectRoute, adminRoute, updateRate)
router.delete("/:id", protectRoute, adminRoute, deleteRate)

export default router;