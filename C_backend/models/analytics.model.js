const mongoose = require("mongoose");

const analyticsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  action: { type: String, required: true }, // e.g., "product_view", "purchase"
  timestamp: { type: Date, default: Date.now },
  metadata: { type: Object }, // Additional details like product ID, page viewed, etc.
});

const Analytics = mongoose.model("Analytics", analyticsSchema);

module.exports = Analytics;