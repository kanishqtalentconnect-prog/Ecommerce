import Tracking from "../models/tracking.model.js";
import Order from "../models/order.model.js";

export const trackingInfo = async (req, res) => {
  try {
    const tracking = await Tracking.findOne({ orderId: req.params.id });
    if (!tracking) {
      return res.status(404).json({ message: "Tracking info not found" });
    }
    res.json(tracking);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const setTracking = async (req, res) => {
  try {
    const { status, estimatedDelivery, location } = req.body;
    const tracking = new Tracking({
      orderId: req.params.id,
      status,
      estimatedDelivery,
      location,
    });

    await tracking.save();
    res.status(201).json({ message: "Tracking info added", tracking });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateTracking = async (req, res) => {
  try {
    const tracking = await Tracking.findByIdAndUpdate(
      req.params.trackingId,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );

    if (!tracking) {
      return res.status(404).json({ message: "Tracking info not found" });
    }

    res.json({ message: "Tracking info updated", tracking });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteTracking = async (req, res) => {
  try {
    const tracking = await Tracking.findByIdAndDelete(req.params.trackingId);
    if (!tracking) {
      return res.status(404).json({ message: "Tracking info not found" });
    }

    res.json({ message: "Tracking info deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch user orders", error: error.message });
  }
};