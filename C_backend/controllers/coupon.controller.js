import Coupon from "../models/coupon.model.js";
import Product from "../models/product.model.js";
import { redis } from "../lib/redis.js";

// Admin: Create a new coupon
export const createCoupon = async (req, res) => {
  try {
    const {
      code,
      name,
      description,
      discountType,
      discountValue,
      minimumOrderAmount,
      maximumDiscountAmount,
      usageLimit,
      userUsageLimit,
      startDate,
      expirationDate,
      applicableToProducts,
      applicableToCategories,
      excludeProducts,
      excludeCategories,
      isGlobal
    } = req.body;

    // Validation
    if (!code || !name || !discountType || !discountValue || !expirationDate) {
      return res.status(400).json({
        success: false,
        message: "Code, name, discount type, discount value, and expiration date are required"
      });
    }

    // Check if coupon code already exists
    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      return res.status(400).json({
        success: false,
        message: "Coupon code already exists"
      });
    }

    // Validate percentage discount
    if (discountType === 'percentage' && discountValue > 100) {
      return res.status(400).json({
        success: false,
        message: "Percentage discount cannot exceed 100%"
      });
    }

    // Validate dates
    const expDate = new Date(expirationDate);
    const startDateObj = startDate ? new Date(startDate) : new Date();
    
    if (expDate <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "Expiration date must be in the future"
      });
    }

    if (startDateObj >= expDate) {
      return res.status(400).json({
        success: false,
        message: "Start date must be before expiration date"
      });
    }

    // Validate that referenced products exist
    if (applicableToProducts && applicableToProducts.length > 0) {
      const validProducts = await Product.find({
        _id: { $in: applicableToProducts }
      }).select('_id');
      
      if (validProducts.length !== applicableToProducts.length) {
        return res.status(400).json({
          success: false,
          message: "Some referenced products do not exist"
        });
      }
    }

    if (excludeProducts && excludeProducts.length > 0) {
      const validProducts = await Product.find({
        _id: { $in: excludeProducts }
      }).select('_id');
      
      if (validProducts.length !== excludeProducts.length) {
        return res.status(400).json({
          success: false,
          message: "Some referenced exclude products do not exist"
        });
      }
    }

    const coupon = new Coupon({
      code: code.toUpperCase(),
      name,
      description,
      discountType,
      discountValue,
      minimumOrderAmount: minimumOrderAmount || 0,
      maximumDiscountAmount,
      usageLimit,
      userUsageLimit: userUsageLimit || 1,
      startDate: startDateObj,
      expirationDate: expDate,
      applicableToProducts: applicableToProducts || [],
      applicableToCategories: applicableToCategories || [],
      excludeProducts: excludeProducts || [],
      excludeCategories: excludeCategories || [],
      isGlobal: isGlobal !== false // Default to true if not specified
    });

    await coupon.save();

    // Clear coupon cache
    await clearCouponCache();

    res.status(201).json({
      success: true,
      message: "Coupon created successfully",
      coupon
    });
  } catch (error) {
    console.error("Error creating coupon:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

// Admin: Get all coupons
export const getAllCoupons = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    
    const query = {};
    
    // Filter by status
    if (status === 'active') {
      query.isActive = true;
      query.expirationDate = { $gt: new Date() };
    } else if (status === 'inactive') {
      query.isActive = false;
    } else if (status === 'expired') {
      query.expirationDate = { $lte: new Date() };
    }
    
    // Search by code or name
    if (search) {
      query.$or = [
        { code: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } }
      ];
    }

    const coupons = await Coupon.find(query)
      .populate('applicableToProducts', 'name price category size sku')
      .populate('excludeProducts', 'name price category size sku')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Coupon.countDocuments(query);

    res.json({
      success: true,
      coupons,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalCoupons: total,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error("Error fetching coupons:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

// Admin: Get coupon by ID
export const getCouponById = async (req, res) => {
  try {
    const { id } = req.params;

    const coupon = await Coupon.findById(id)
      .populate('applicableToProducts', 'name price category size sku image')
      .populate('excludeProducts', 'name price category size sku image')
      .populate('usedBy.userId', 'name email');

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found"
      });
    }

    res.json({
      success: true,
      coupon
    });
  } catch (error) {
    console.error("Error fetching coupon:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

// Admin: Update coupon
export const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    console.log("Updating coupon with data:", updateData);

    // Remove fields that shouldn't be updated directly
    delete updateData._id;
    delete updateData.usedCount;
    delete updateData.usedBy;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    // If updating code, ensure it's uppercase and unique
    if (updateData.code) {
      updateData.code = updateData.code.toUpperCase();
      const existingCoupon = await Coupon.findOne({ 
        code: updateData.code, 
        _id: { $ne: id } 
      });
      if (existingCoupon) {
        return res.status(400).json({
          success: false,
          message: "Coupon code already exists"
        });
      }
    }

    // Ensure numeric fields are properly converted
    if (updateData.discountValue) updateData.discountValue = Number(updateData.discountValue);
    if (updateData.minimumOrderAmount) updateData.minimumOrderAmount = Number(updateData.minimumOrderAmount);
    if (updateData.maximumDiscountAmount) updateData.maximumDiscountAmount = Number(updateData.maximumDiscountAmount);
    if (updateData.usageLimit) updateData.usageLimit = Number(updateData.usageLimit);
    if (updateData.userUsageLimit) updateData.userUsageLimit = Number(updateData.userUsageLimit);

    const coupon = await Coupon.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('applicableToProducts', 'name price category size sku');

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found"
      });
    }

    // Clear coupon cache
    await clearCouponCache();

    res.json({
      success: true,
      message: "Coupon updated successfully",
      coupon
    });
  } catch (error) {
    console.error("Error updating coupon:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Admin: Toggle coupon status (enable/disable)
export const toggleCouponStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found"
      });
    }

    coupon.isActive = !coupon.isActive;
    await coupon.save();

    // Clear coupon cache
    await clearCouponCache();

    res.json({
      success: true,
      message: `Coupon ${coupon.isActive ? 'enabled' : 'disabled'} successfully`,
      coupon
    });
  } catch (error) {
    console.error("Error toggling coupon status:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

// Admin: Delete coupon
export const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found"
      });
    }

    // Check if coupon has been used
    if (coupon.usedCount > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete coupon that has been used. You can disable it instead."
      });
    }

    await Coupon.findByIdAndDelete(id);

    // Clear coupon cache
    await clearCouponCache();

    res.json({
      success: true,
      message: "Coupon deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting coupon:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

// User: Get available coupons for user
export const getAvailableCoupons = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();

    const coupons = await Coupon.find({
      isActive: true,
      startDate: { $lte: now },
      expirationDate: { $gt: now },
      $or: [
        { usageLimit: { $exists: false } },
        { usageLimit: null },
        { $expr: { $lt: ["$usedCount", "$usageLimit"] } }
      ]
    }).select('-usedBy');

    // Filter coupons based on user usage limit
    const availableCoupons = coupons.filter(coupon => {
      return coupon.canUserUseCoupon(userId);
    });

    res.json({
      success: true,
      coupons: availableCoupons
    });
  } catch (error) {
    console.error("Error fetching available coupons:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

// User: Validate coupon
export const validateCoupon = async (req, res) => {
  try {
    const { code, orderAmount, productIds } = req.body;
    const userId = req.user._id;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Coupon code is required"
      });
    }

    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
    }).populate('applicableToProducts excludeProducts');

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Invalid coupon code"
      });
    }

    // Check if coupon is valid
    if (!coupon.isValidCoupon()) {
      let message = "Coupon is not available";
      if (!coupon.isActive) message = "Coupon is disabled";
      else if (coupon.isExpired) message = "Coupon has expired";
      else if (coupon.isUsageLimitReached) message = "Coupon usage limit exceeded";
      
      return res.status(400).json({
        success: false,
        message
      });
    }

    // Check user usage limit
    if (!coupon.canUserUseCoupon(userId)) {
      return res.status(400).json({
        success: false,
        message: "You have already used this coupon the maximum number of times"
      });
    }

    // Check minimum order amount
    if (orderAmount && orderAmount < coupon.minimumOrderAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount of ₹${coupon.minimumOrderAmount} required`
      });
    }

    // Get products for validation if productIds provided
    let products = [];
    if (productIds && productIds.length > 0) {
      products = await Product.find({
        _id: { $in: productIds }
      }).select('_id name price category size');
    }

    // Calculate discount
    const discountCalculation = calculateDiscount(coupon, orderAmount, products);

    res.json({
      success: true,
      message: "Coupon is valid",
      coupon: {
        id: coupon._id,
        code: coupon.code,
        name: coupon.name,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minimumOrderAmount: coupon.minimumOrderAmount,
        maximumDiscountAmount: coupon.maximumDiscountAmount
      },
      ...discountCalculation
    });
  } catch (error) {
    console.error("Error validating coupon:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

// User: Apply coupon (used during checkout)
export const applyCoupon = async (req, res) => {
  try {
    const { code, orderAmount, productIds, discountAmount } = req.body;
    const userId = req.user._id;

    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
    });

    if (!coupon || !coupon.isValidCoupon() || !coupon.canUserUseCoupon(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired coupon"
      });
    }

    // Record coupon usage
    coupon.usedBy.push({
      userId: userId,
      usedAt: new Date(),
      orderAmount: orderAmount,
      discountAmount: discountAmount
    });
    coupon.usedCount += 1;

    await coupon.save();

    // Clear coupon cache
    await clearCouponCache();

    res.json({
      success: true,
      message: "Coupon applied successfully",
      discountAmount
    });
  } catch (error) {
    console.error("Error applying coupon:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

// Helper function to calculate discount
const calculateDiscount = (coupon, orderAmount, products = []) => {
  let discountAmount = 0;
  let applicableAmount = orderAmount;

  // For product-specific or category-specific coupons
  if (!coupon.isGlobal && products.length > 0) {
    applicableAmount = 0;
    
    products.forEach(product => {
      let isApplicable = false;
      
      // Check if product is specifically included
      if (coupon.applicableToProducts.length > 0) {
        isApplicable = coupon.applicableToProducts.some(p => 
          p._id.toString() === product._id.toString()
        );
      }
      
      // Check if product category is included
      if (!isApplicable && coupon.applicableToCategories.length > 0) {
        isApplicable = coupon.applicableToCategories.includes(product.category);
      }
      
      // If no specific products or categories, apply to all (for non-global coupons this might be wrong logic)
      if (!isApplicable && coupon.applicableToProducts.length === 0 && coupon.applicableToCategories.length === 0) {
        isApplicable = true;
      }
      
      // Check if product is excluded
      if (isApplicable && coupon.excludeProducts.length > 0) {
        const isExcluded = coupon.excludeProducts.some(p => 
          p._id.toString() === product._id.toString()
        );
        if (isExcluded) isApplicable = false;
      }
      
      // Check if product category is excluded
      if (isApplicable && coupon.excludeCategories.length > 0) {
        const isExcluded = coupon.excludeCategories.includes(product.category);
        if (isExcluded) isApplicable = false;
      }
      
      if (isApplicable) {
        applicableAmount += product.price;
      }
    });
    
    // If no products are applicable, return zero discount
    if (applicableAmount === 0) {
      return {
        discountAmount: 0,
        finalAmount: orderAmount,
        savings: 0,
        applicableAmount: 0
      };
    }
  }

  // Calculate discount
  if (coupon.discountType === 'percentage') {
    discountAmount = (applicableAmount * coupon.discountValue) / 100;
  } else {
    discountAmount = Math.min(coupon.discountValue, applicableAmount);
  }

  // Apply maximum discount limit
  if (coupon.maximumDiscountAmount && discountAmount > coupon.maximumDiscountAmount) {
    discountAmount = coupon.maximumDiscountAmount;
  }

  // Ensure discount doesn't exceed order amount
  discountAmount = Math.min(discountAmount, orderAmount);

  return {
    discountAmount: Math.round(discountAmount * 100) / 100,
    finalAmount: Math.round((orderAmount - discountAmount) * 100) / 100,
    savings: Math.round(discountAmount * 100) / 100,
    applicableAmount: Math.round(applicableAmount * 100) / 100
  };
};

// Helper function to clear coupon cache
const clearCouponCache = async () => {
  try {
    if (!redis) {
      console.log("Redis not available, skipping cache clear");
      return;
    }
    const keys = await redis.keys("coupon:*");
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.error("Error clearing coupon cache:", error);
    // Don't fail the request if cache clearing fails
  }
};

// Admin: Get coupon statistics
export const getCouponStats = async (req, res) => {
  try {
    const totalCoupons = await Coupon.countDocuments();
    const activeCoupons = await Coupon.countDocuments({ 
      isActive: true, 
      expirationDate: { $gt: new Date() } 
    });
    const expiredCoupons = await Coupon.countDocuments({ 
      expirationDate: { $lte: new Date() } 
    });
    const usedCoupons = await Coupon.countDocuments({ 
      usedCount: { $gt: 0 } 
    });

    // Get top used coupons
    const topUsedCoupons = await Coupon.find({ usedCount: { $gt: 0 } })
      .sort({ usedCount: -1 })
      .limit(5)
      .select('code name usedCount discountType discountValue');

    res.json({
      success: true,
      stats: {
        totalCoupons,
        activeCoupons,
        expiredCoupons,
        usedCoupons,
        unusedCoupons: totalCoupons - usedCoupons
      },
      topUsedCoupons
    });
  } catch (error) {
    console.error("Error fetching coupon stats:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};