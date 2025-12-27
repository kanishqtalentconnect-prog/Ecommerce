import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { AllSubscriptionPlan, SubscribePlan, updatePlan, deletePlan } from "../controllers/subscription.controller.js"

const router = express.Router();

router.get("/", AllSubscriptionPlan);
router.post("/", protectRoute, SubscribePlan);
router.put("/:id", protectRoute, updatePlan);
router.delete("/:id", protectRoute, deletePlan);

export default router;