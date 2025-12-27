import express from "express";
import { login, logout, signup, refreshToken, getProfile,checkAuth,googleAuth,googleCallback,linkGoogleAccount,unlinkGoogleAccount } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh-token", refreshToken);
router.get("/profile", protectRoute, getProfile);
router.get("/check-auth", protectRoute, checkAuth);


router.get("/google", googleAuth);
router.get("/google/callback", googleCallback);

// Google account linking routes (for existing users)
router.post("/link-google", protectRoute, linkGoogleAccount);
router.post("/unlink-google", protectRoute, unlinkGoogleAccount);

export default router;