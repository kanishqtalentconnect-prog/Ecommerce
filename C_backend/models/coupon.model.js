import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        discountType: {
            type: String,
            required: true,
            enum: ['percentage', 'fixed'],
            default: 'percentage',
        },
        discountValue: {
            type: Number,
            required: true,
            min: 0,
        },
        minimumOrderAmount: {
            type: Number,
            default: 0,
            min: 0,
        },
        maximumDiscountAmount: {
            type: Number,
            min: 0,
        },
        usageLimit: {
            type: Number,
            min: 1,
        },
        usedCount: {
            type: Number,
            default: 0,
            min: 0,
        },
        userUsageLimit: {
            type: Number,
            default: 1,
            min: 1,
        },
        startDate: {
            type: Date,
            default: Date.now,
        },
        expirationDate: {
            type: Date,
            required: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        applicableToProducts: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
        }],
        applicableToCategories: [{
            type: String,
        }],
        excludeProducts: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
        }],
        excludeCategories: [{
            type: String,
        }],
        isGlobal: {
            type: Boolean,
            default: true,
        },
        usedBy: [{
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },
            usedAt: {
                type: Date,
                default: Date.now,
            },
            orderAmount: {
                type: Number,
                required: true,
            },
            discountAmount: {
                type: Number,
                required: true,
            }
        }],
    },
    {
        timestamps: true,
    }
);

// CLEAN INDEX DEFINITIONS
// Note: The 'code' field already has unique: true, so MongoDB will automatically create a unique index

// Only add these specific indexes for performance
couponSchema.index({ isActive: 1 });
couponSchema.index({ expirationDate: 1 });

// Compound index for the most common query pattern (active + non-expired coupons)
couponSchema.index({ isActive: 1, expirationDate: 1 });

// Sparse index for user queries - only indexes documents where usedBy array has elements
couponSchema.index({ "usedBy.userId": 1 }, { sparse: true });

// Text index for searching by code or name (optional - only if you need text search)
// couponSchema.index({ code: "text", name: "text" });

// Virtual for checking if coupon is expired
couponSchema.virtual('isExpired').get(function() {
    return this.expirationDate < new Date();
});

// Virtual for checking if coupon has reached usage limit
couponSchema.virtual('isUsageLimitReached').get(function() {
    return this.usageLimit && this.usedCount >= this.usageLimit;
});

// Method to check if coupon is valid
couponSchema.methods.isValidCoupon = function() {
    const now = new Date();
    return (
        this.isActive &&
        this.startDate <= now &&
        this.expirationDate > now &&
        (!this.usageLimit || this.usedCount < this.usageLimit)
    );
};

// Method to check user usage limit
couponSchema.methods.canUserUseCoupon = function(userId) {
    if (!userId) return false;
    
    const userUsage = this.usedBy.filter(usage => 
        usage.userId && usage.userId.toString() === userId.toString()
    ).length;
    
    return userUsage < this.userUsageLimit;
};

// Pre-save middleware to validate discount percentage
couponSchema.pre('save', function(next) {
    if (this.discountType === 'percentage' && this.discountValue > 100) {
        return next(new Error('Percentage discount cannot exceed 100%'));
    }
    
    // Ensure expiration date is in the future for new coupons
    if (this.isNew && this.expirationDate <= new Date()) {
        return next(new Error('Expiration date must be in the future'));
    }
    
    // Validate start date vs expiration date
    if (this.startDate >= this.expirationDate) {
        return next(new Error('Start date must be before expiration date'));
    }
    
    next();
});

// Pre-save hook to ensure code is always uppercase
couponSchema.pre('save', function(next) {
    if (this.code) {
        this.code = this.code.toUpperCase();
    }
    next();
});

const Coupon = mongoose.model("Coupon", couponSchema);

export default Coupon;