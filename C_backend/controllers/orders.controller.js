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
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: "Status is required" });
    }

    // Update order
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Populate user AFTER update
    const populatedOrder = await Order.findById(order._id).populate(
      "user",
      "name email"
    );

    // Send email safely
    if (populatedOrder?.user?.email) {
      await sendEmail({
        to: populatedOrder.user.email,
        subject: `📦 Order Status Updated`,
        html: `
          <p>Hello <b>${populatedOrder.user.name}</b>,</p>
          <p>Your order <b>${populatedOrder._id}</b> status is now:</p>
          <h3>${status.toUpperCase()}</h3>
        `,
      });
    }

    return res.json({ success: true, data: populatedOrder });
  } catch (error) {
    console.error("Error updating order status:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
