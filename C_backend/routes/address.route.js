import express from "express";
import {
  putAddress,
  getAllAddress,
  updateAddress,
  deleteAddress,
  defaultAddress,
} from "../controllers/address.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import axios from "axios";
import Address from "../models/address.model.js";

const router = express.Router();

router.post("/", protectRoute, putAddress);
router.get("/", protectRoute, getAllAddress);
router.put("/:id", protectRoute, updateAddress);
router.delete("/:id", protectRoute, deleteAddress);
router.patch("/:id/default", protectRoute, defaultAddress);
router.get("/default", protectRoute, async (req, res) => {
  const address = await Address.findOne({
    userId: req.user._id,
    isDefault: true,
  });

  res.json(address);
});

router.post("/autofill", protectRoute, async (req, res) => {
  const { lat, lng } = req.body;
  const userId = req.user._id;

  try {
    // Reverse Geocode
    const geoRes = await axios.get(
      "https://nominatim.openstreetmap.org/reverse",
      {
        params: {
          lat,
          lon: lng,
          format: "json",
        },
        headers: {
          "User-Agent": "Ecommerce-App",
        },
      }
    );

    const addr = geoRes.data.address;

    const addressData = {
      userId,
      fullName: req.user.name,
      street: addr.road || "Auto-detected",
      city: addr.city || addr.town || addr.village || "",
      state: addr.state || "",
      zipcode: addr.postcode || "000000",
      country: addr.country || "",
      phone: "0000000000",
      isDefault: true,
    };

    // Remove previous default address
    await Address.updateMany(
      { userId },
      { isDefault: false }
    );

    // Upsert default address
    const savedAddress = await Address.findOneAndUpdate(
      { userId, isDefault: true },
      addressData,
      { new: true, upsert: true }
    );

    res.json(savedAddress);
  } catch (error) {
    console.error("Autofill error:", error.message);
    res.status(500).json({ message: "Failed to save address" });
  }
});

export default router;