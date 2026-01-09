import Order from "../models/order.model.js";
import { sendEmail } from "../utils/sendEmail.js";

// Get all orders (Admin)
export const getAllOrders = async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = {};
    
    // If status filter is provided
    if (status) {
      query.status = status;
    }
    
    const orders = await Order.find(query)
      .populate("user", "name email")
      .populate("products.product", "name price images")
      .sort({ createdAt: -1 });
      
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get recent orders that need processing (Admin)
export const getRecentOrders = async (req, res) => {
  try {
    const recentOrders = await Order.find({ 
      status: { $in: ['pending', 'processing'] },
      paymentId: { $exists: true, $ne: null } // Only orders with confirmed payment
    })
      .populate("user", "name email")
      .populate("products.product", "name price images")
      .sort({ createdAt: -1 })
      .limit(10);
      
    res.json({ success: true, data: recentOrders });
  } catch (error) {
    console.error("Error fetching recent orders:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get order counts by status (Admin)
export const getOrderCounts = async (req, res) => {
  try {
    const counts = await Order.aggregate([
      {
        $match: {
          paymentId: { $exists: true, $ne: null } // Only count orders with confirmed payment
        }
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Initialize with default values to prevent undefined
    const formattedCounts = {
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0
    };
    
    // Update with actual counts
    counts.forEach(item => {
      formattedCounts[item._id] = item.count;
    });
    
    // Add total count
    const totalCount = await Order.countDocuments({ 
      paymentId: { $exists: true, $ne: null } 
    });
    formattedCounts.total = totalCount;
    
    res.json({ success: true, data: formattedCounts });
  } catch (error) {
    console.error("Error fetching order counts:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get order by ID (Admin)
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email")
      .populate("products.product", "name price image sku")
      .populate("shippingDetails.addressId");
      
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    
    res.json({ success: true, data: order });
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update order status (Admin)
export const updateOrderStatus = async (req, res) => {
  try {
    console.log("Update order status called");
    console.log("Order ID:", req.params.id);
    console.log("Request body:", req.body);
    
    const { status } = req.body;
    
    if (!status) {
      console.log("Status missing in request");
      return res.status(400).json({ success: false, message: "Status is required" });
    }
    
    console.log("Attempting to update order with status:", status);
    
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    
    if (!order) {
      console.log("Order not found for ID:", req.params.id);
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    await sendEmail({
      to: order.user.email,
      subject: `📦 Order Status Updated: ${status}`,
      html: `<p>Your order <b>${order._id}</b> status is now <b>${status}</b></p>`,
    });
    console.log("Order updated successfully:", order.status);
    res.json({ success: true, data: order });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};