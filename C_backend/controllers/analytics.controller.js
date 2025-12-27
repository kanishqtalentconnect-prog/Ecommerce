import Analytics from "../routes/analytics.route.js";
import Product from "../models/product.model.js";

// Get User Activity
export const getUserActivity = async (req, res) => {
  try {
    const activities = await Analytics.find({ userId: req.user.id }).sort({
      timestamp: -1,
    });
    res.json({ success: true, data: activities });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

//Get Sales Report (Admin)
export const getSalesReport = async (req, res) => {
  try {
    // Example sales report (Replace with real DB query)
    const salesData = [
      { date: "2024-03-01", revenue: 10000, orders: 150 },
      { date: "2024-03-02", revenue: 12000, orders: 180 },
    ];
    res.json({ success: true, data: salesData });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

//Get Product Performance Metrics (Admin)

export const getProductMetrics = async (req, res) => {
  try {
    // Example metrics (Replace with real DB query)
    const productMetrics = [
      { productId: "12345", name: "Laptop", views: 500, purchases: 50 },
      { productId: "67890", name: "Phone", views: 700, purchases: 80 },
    ];
    res.json({ success: true, data: productMetrics });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

//Get User Engagement Metrics (Admin)

export const getUserEngagement = async (req, res) => {
  try {
    // Example engagement data (Replace with real DB query)
    const engagementData = [
      { userId: "user123", name: "Alice", logins: 20, purchases: 5 },
      { userId: "user456", name: "Bob", logins: 15, purchases: 3 },
    ];
    res.json({ success: true, data: engagementData });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getProductCount = async (req, res) => {
  try {
    const count = await Product.countDocuments();
    res.json({ success: true, count });
  } catch (error) {
    console.error("Error fetching product count:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};