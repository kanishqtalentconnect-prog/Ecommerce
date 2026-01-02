import Address from "../models/address.model.js";
import axios from "axios";

export const putAddress = async (req, res) => {
  try {
    const address = new Address({ ...req.body, userId: req.user._id });
    await address.save();
    res.status(201).json(address);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to create address", error: error.message });
  }
};

export const getAllAddress = async (req, res) => {
  try {
    const addresses = await Address.find({ userId: req.user._id });
    res.json(addresses);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch addresses", error: error.message });
  }
};

export const updateAddress = async (req, res) => {
  try {
    const address = await Address.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true }
    );

    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    res.json(address);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to update address", error: error.message });
  }
};

export const deleteAddress = async (req, res) => {
  try {
    const address = await Address.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    res.json({ message: "Address deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete address", error: error.message });
  }
};

export const defaultAddress = async (req, res) => {
  try {
    // Remove default from all user's addresses
    await Address.updateMany({ userId: req.user._id }, { isDefault: false });

    // Set the selected address as default
    const address = await Address.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isDefault: true },
      { new: true }
    );

    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    res.json(address);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to set default address", error: error.message });
  }
};

export const saveLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    const geoRes = await axios.get(
      "https://maps.googleapis.com/maps/api/geocode/json",
      {
        params: {
          latlng: `${latitude},${longitude}`,
          key: process.env.GOOGLE_MAPS_API_KEY,
        },
      }
    );

    const address = geoRes.data.results[0]?.formatted_address;

    await Address.findOneAndUpdate(
      { user: req.user._id },
      {
        user: req.user._id,
        latitude,
        longitude,
        fullAddress: address,
      },
      { upsert: true, new: true }
    );

    res.json({ success: true, address });
  } catch (error) {
    console.error("Location save error:", error);
    res.status(500).json({ message: "Failed to save location" });
  }
};