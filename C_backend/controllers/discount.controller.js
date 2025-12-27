import Discount from "../models/discount.model.js";
import Product from "../models/product.model.js";
import HeaderMessage from "../models/message.model.js"; // Add this import
import { redis } from "../lib/redis.js";

// Create a new discount
export const createDiscount = async (req, res) => {
  try {
    const { name, description, type, discountType, value, productId, category, endDate } = req.body;

    // Validation
    if (!name || !type || !discountType || value === undefined) {
      return res.status(400).json({ 
        success: false, 
        message: "Name, type, discountType, and value are required" 
      });
    }

    // Validate percentage discount
    if (discountType === 'percentage' && value > 100) {
      return res.status(400).json({ 
        success: false, 
        message: "Percentage discount cannot exceed 100%" 
      });
    }

    // Validate product exists for product discount
    if (type === 'product') {
      if (!productId) {
        return res.status(400).json({ 
          success: false, 
          message: "Product ID is required for product discount" 
        });
      }
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ 
          success: false, 
          message: "Product not found" 
        });
      }
    }

    // Validate category for category discount
    if (type === 'category' && !category) {
      return res.status(400).json({ 
        success: false, 
        message: "Category is required for category discount" 
      });
    }

    const discount = new Discount({
      name,
      description,
      type,
      discountType,
      value,
      productId: type === 'product' ? productId : undefined,
      category: type === 'category' ? category : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      createdBy: req.user._id
    });

    await discount.save();

    // Auto-create header message for the discount
    await createDiscountHeaderMessage(discount, req.user._id);

    // Clear relevant caches
    await clearDiscountCaches();

    res.status(201).json({
      success: true,
      message: "Discount created successfully",
      discount
    });
  } catch (error) {
    console.error("Error creating discount:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: error.message 
    });
  }
};

// Get all discounts
export const getAllDiscounts = async (req, res) => {
  try {
    const discounts = await Discount.find()
      .populate('productId', 'name price')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      discounts
    });
  } catch (error) {
    console.error("Error fetching discounts:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: error.message 
    });
  }
};

// Get active discounts
export const getActiveDiscounts = async (req, res) => {
  try {
    const now = new Date();
    const discounts = await Discount.find({
      isActive: true,
      $or: [
        { endDate: { $exists: false } },
        { endDate: null },
        { endDate: { $gte: now } }
      ]
    }).populate('productId', 'name price category');

    res.json({
      success: true,
      discounts
    });
  } catch (error) {
    console.error("Error fetching active discounts:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: error.message 
    });
  }
};

// Update discount
export const updateDiscount = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated directly
    delete updateData._id;
    delete updateData.createdBy;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    const discount = await Discount.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('productId', 'name price');

    if (!discount) {
      return res.status(404).json({ 
        success: false, 
        message: "Discount not found" 
      });
    }

    // Update the associated header message
    await updateDiscountHeaderMessage(discount, req.user._id);

    // Clear relevant caches
    await clearDiscountCaches();

    res.json({
      success: true,
      message: "Discount updated successfully",
      discount
    });
  } catch (error) {
    console.error("Error updating discount:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: error.message 
    });
  }
};

// Toggle discount status
export const toggleDiscountStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const discount = await Discount.findById(id);
    if (!discount) {
      return res.status(404).json({ 
        success: false, 
        message: "Discount not found" 
      });
    }

    discount.isActive = !discount.isActive;
    await discount.save();

    // Toggle the associated header message status
    await toggleDiscountHeaderMessageStatus(discount);

    // Clear relevant caches
    await clearDiscountCaches();

    res.json({
      success: true,
      message: `Discount ${discount.isActive ? 'activated' : 'deactivated'} successfully`,
      discount
    });
  } catch (error) {
    console.error("Error toggling discount status:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: error.message 
    });
  }
};

// Delete discount
export const deleteDiscount = async (req, res) => {
  try {
    const { id } = req.params;

    const discount = await Discount.findByIdAndDelete(id);
    if (!discount) {
      return res.status(404).json({ 
        success: false, 
        message: "Discount not found" 
      });
    }

    // Delete the associated header message
    await deleteDiscountHeaderMessage(discount._id);

    // Clear relevant caches
    await clearDiscountCaches();

    res.json({
      success: true,
      message: "Discount deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting discount:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: error.message 
    });
  }
};

// Calculate discount for a product
export const calculateProductDiscount = async (product) => {
  try {
    const now = new Date();
    
    // Get active discounts
    const activeDiscounts = await Discount.find({
      isActive: true,
      $or: [
        { endDate: { $exists: false } },
        { endDate: null },
        { endDate: { $gte: now } }
      ]
    });

    let bestDiscount = null;
    let discountAmount = 0;

    // Priority: Product > Category > Global
    for (const discount of activeDiscounts) {
      let isApplicable = false;
      let tempDiscountAmount = 0;

      if (discount.type === 'product' && discount.productId.toString() === product._id.toString()) {
        isApplicable = true;
      } else if (discount.type === 'category' && discount.category.toLowerCase() === product.category.toLowerCase()) {
        isApplicable = true;
      } else if (discount.type === 'global') {
        isApplicable = true;
      }

      if (isApplicable) {
        if (discount.discountType === 'percentage') {
          tempDiscountAmount = (product.price * discount.value) / 100;
        } else {
          tempDiscountAmount = Math.min(discount.value, product.price);
        }

        // Apply priority and choose best discount
        if (!bestDiscount || 
            (discount.type === 'product' && bestDiscount.type !== 'product') ||
            (discount.type === 'category' && bestDiscount.type === 'global') ||
            (discount.type === bestDiscount.type && tempDiscountAmount > discountAmount)) {
          bestDiscount = discount;
          discountAmount = tempDiscountAmount;
        }
      }
    }

    return {
      originalPrice: product.price,
      discountAmount: Math.round(discountAmount * 100) / 100,
      finalPrice: Math.round((product.price - discountAmount) * 100) / 100,
      discount: bestDiscount,
      hasDiscount: bestDiscount !== null
    };
  } catch (error) {
    console.error("Error calculating product discount:", error);
    return {
      originalPrice: product.price,
      discountAmount: 0,
      finalPrice: product.price,
      discount: null,
      hasDiscount: false
    };
  }
};

// Get discounts for specific product
export const getProductDiscounts = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: "Product not found" 
      });
    }

    const discountInfo = await calculateProductDiscount(product);

    res.json({
      success: true,
      ...discountInfo
    });
  } catch (error) {
    console.error("Error getting product discounts:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: error.message 
    });
  }
};

// Helper function to create header message for discount
const createDiscountHeaderMessage = async (discount, userId) => {
  try {
    const discountValue = discount.discountType === 'percentage' 
      ? `${discount.value}% OFF` 
      : `₹${discount.value} OFF`;
    
    let messageText = "";
    
    if (discount.type === 'global') {
      messageText = `🎉 ${discountValue} on All Products! Limited Time Offer`;
    } else if (discount.type === 'category') {
      messageText = `🎉 ${discountValue} on ${discount.category} Items! Shop Now`;
    } else if (discount.type === 'product') {
      const product = await Product.findById(discount.productId);
      messageText = `🎉 Special ${discountValue} on ${product?.name || 'Selected Product'}! Don't Miss Out`;
    }

    const headerMessage = new HeaderMessage({
      message: messageText,
      type: 'discount',
      priority: 1, // High priority for discounts
      discountId: discount._id,
      endDate: discount.endDate,
      isActive: discount.isActive,
      createdBy: userId
    });

    await headerMessage.save();
    console.log(`Created header message for discount: ${discount.name}`);
  } catch (error) {
    console.error("Error creating discount header message:", error);
  }
};

// Helper function to update header message for discount
const updateDiscountHeaderMessage = async (discount, userId) => {
  try {
    const discountValue = discount.discountType === 'percentage' 
      ? `${discount.value}% OFF` 
      : `₹${discount.value} OFF`;
    
    let messageText = "";
    
    if (discount.type === 'global') {
      messageText = `🎉 ${discountValue} on All Products! Limited Time Offer`;
    } else if (discount.type === 'category') {
      messageText = `🎉 ${discountValue} on ${discount.category} Items! Shop Now`;
    } else if (discount.type === 'product') {
      const product = await Product.findById(discount.productId);
      messageText = `🎉 Special ${discountValue} on ${product?.name || 'Selected Product'}! Don't Miss Out`;
    }

    await HeaderMessage.findOneAndUpdate(
      { discountId: discount._id },
      {
        message: messageText,
        endDate: discount.endDate,
        isActive: discount.isActive
      }
    );

    console.log(`Updated header message for discount: ${discount.name}`);
  } catch (error) {
    console.error("Error updating discount header message:", error);
  }
};

// Helper function to toggle header message status for discount
const toggleDiscountHeaderMessageStatus = async (discount) => {
  try {
    await HeaderMessage.findOneAndUpdate(
      { discountId: discount._id },
      { isActive: discount.isActive }
    );
    console.log(`Toggled header message status for discount: ${discount.name}`);
  } catch (error) {
    console.error("Error toggling discount header message status:", error);
  }
};

// Helper function to delete header message for discount
const deleteDiscountHeaderMessage = async (discountId) => {
  try {
    await HeaderMessage.findOneAndDelete({ discountId: discountId });
    console.log(`Deleted header message for discount ID: ${discountId}`);
  } catch (error) {
    console.error("Error deleting discount header message:", error);
  }
};

// Helper function to clear discount-related caches
const clearDiscountCaches = async () => {
  try {
    // Clear any discount-related Redis cache keys
    const keys = await redis.keys("discount:*");
    if (keys.length > 0) {
      await redis.del(...keys);
    }
    
    // Also clear featured products cache as prices might have changed
    await redis.del("featured_products");
    
    // Clear header messages cache
    await redis.del("header_messages_active");
  } catch (error) {
    console.error("Error clearing discount caches:", error);
  }
};

export const getDiscountById = async (req, res) => {
  try {
    const { id } = req.params;

    const discount = await Discount.findById(id)
      .populate('productId', 'name price category')
      .populate('createdBy', 'name email');

    if (!discount) {
      return res.status(404).json({ 
        success: false, 
        message: "Discount not found" 
      });
    }

    res.json({
      success: true,
      discount
    });
  } catch (error) {
    console.error("Error fetching discount:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: error.message 
    });
  }
};