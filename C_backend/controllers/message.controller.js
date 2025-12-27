import HeaderMessage from "../models/message.model.js";
import Discount from "../models/discount.model.js";

// Get active header messages for public display
export const getActiveHeaderMessages = async (req, res) => {
  try {
    const now = new Date();
    
    // Get active messages including discount-linked ones
    const messages = await HeaderMessage.find({
      isActive: true,
      $or: [
        { endDate: { $exists: false } },
        { endDate: null },
        { endDate: { $gte: now } }
      ]
    })
    .populate('discountId', 'name isActive endDate')
    .sort({ priority: -1, createdAt: -1 });

    // Filter out messages linked to inactive/expired discounts
    const validMessages = messages.filter(message => {
      if (message.discountId) {
        return message.discountId.isActive && 
               (!message.discountId.endDate || message.discountId.endDate >= now);
      }
      return true;
    });

    res.json({
      success: true,
      messages: validMessages
    });
  } catch (error) {
    console.error("Error fetching active header messages:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: error.message 
    });
  }
};

// Get all header messages (Admin only)
export const getAllHeaderMessages = async (req, res) => {
  try {
    const messages = await HeaderMessage.find()
      .populate('discountId', 'name isActive endDate')
      .populate('createdBy', 'name email')
      .sort({ priority: -1, createdAt: -1 });

    res.json({
      success: true,
      messages
    });
  } catch (error) {
    console.error("Error fetching header messages:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: error.message 
    });
  }
};

// Create new header message (Admin only)
export const createHeaderMessage = async (req, res) => {
  try {
    const { message, type, priority, discountId, endDate } = req.body;

    // Validation
    if (!message) {
      return res.status(400).json({ 
        success: false, 
        message: "Message is required" 
      });
    }

    // If linking to discount, verify it exists
    if (discountId) {
      const discount = await Discount.findById(discountId);
      if (!discount) {
        return res.status(404).json({ 
          success: false, 
          message: "Discount not found" 
        });
      }
    }

    const headerMessage = new HeaderMessage({
      message,
      type: type || 'announcement',
      priority: priority || 1,
      discountId: discountId || undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      createdBy: req.user._id
    });

    await headerMessage.save();
    await headerMessage.populate('discountId', 'name isActive endDate');

    res.status(201).json({
      success: true,
      message: "Header message created successfully",
      headerMessage
    });
  } catch (error) {
    console.error("Error creating header message:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: error.message 
    });
  }
};

// Update header message (Admin only)
export const updateHeaderMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated directly
    delete updateData._id;
    delete updateData.createdBy;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    const headerMessage = await HeaderMessage.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('discountId', 'name isActive endDate');

    if (!headerMessage) {
      return res.status(404).json({ 
        success: false, 
        message: "Header message not found" 
      });
    }

    res.json({
      success: true,
      message: "Header message updated successfully",
      headerMessage
    });
  } catch (error) {
    console.error("Error updating header message:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: error.message 
    });
  }
};

// Toggle header message status (Admin only)
export const toggleHeaderMessageStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const headerMessage = await HeaderMessage.findById(id);
    if (!headerMessage) {
      return res.status(404).json({ 
        success: false, 
        message: "Header message not found" 
      });
    }

    headerMessage.isActive = !headerMessage.isActive;
    await headerMessage.save();

    res.json({
      success: true,
      message: `Header message ${headerMessage.isActive ? 'activated' : 'deactivated'} successfully`,
      headerMessage
    });
  } catch (error) {
    console.error("Error toggling header message status:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: error.message 
    });
  }
};

// Delete header message (Admin only)
export const deleteHeaderMessage = async (req, res) => {
  try {
    const { id } = req.params;

    const headerMessage = await HeaderMessage.findByIdAndDelete(id);
    if (!headerMessage) {
      return res.status(404).json({ 
        success: false, 
        message: "Header message not found" 
      });
    }

    res.json({
      success: true,
      message: "Header message deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting header message:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: error.message 
    });
  }
};

// Auto-create header message when discount is created
export const createDiscountHeaderMessage = async (discount, createdBy) => {
  try {
    const message = `🎉 ${discount.name} - ${discount.discountType === 'percentage' ? `${discount.value}% OFF` : `₹${discount.value} OFF`} ${discount.type === 'global' ? 'on all products' : discount.type === 'category' ? `on ${discount.category}` : 'on selected product'}!`;
    
    const headerMessage = new HeaderMessage({
      message,
      type: 'discount',
      priority: 2, // Higher priority for discounts
      discountId: discount._id,
      endDate: discount.endDate,
      createdBy
    });

    await headerMessage.save();
    return headerMessage;
  } catch (error) {
    console.error("Error creating discount header message:", error);
    return null;
  }
};

// Clean up expired discount messages
export const cleanupExpiredMessages = async () => {
  try {
    const now = new Date();
    
    // Delete messages linked to inactive or expired discounts
    const expiredDiscountMessages = await HeaderMessage.find({
      discountId: { $exists: true }
    }).populate('discountId');

    for (const message of expiredDiscountMessages) {
      if (!message.discountId || 
          !message.discountId.isActive || 
          (message.discountId.endDate && message.discountId.endDate < now)) {
        await HeaderMessage.findByIdAndDelete(message._id);
      }
    }

    // Delete messages with expired endDate
    await HeaderMessage.deleteMany({
      endDate: { $lt: now }
    });

  } catch (error) {
    console.error("Error cleaning up expired messages:", error);
  }
};