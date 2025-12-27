import mongoose from "mongoose";

const discountSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['product', 'category', 'global'],
    required: true
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true
  },
  value: {
    type: Number,
    required: true,
    min: 0
  },
  // For product-specific discounts
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: function() { return this.type === 'product'; }
  },
  // For category-specific discounts
  category: {
    type: String,
    required: function() { return this.type === 'category'; }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for better query performance
discountSchema.index({ type: 1, isActive: 1 });
discountSchema.index({ productId: 1, isActive: 1 });
discountSchema.index({ category: 1, isActive: 1 });

const Discount = mongoose.model("Discount", discountSchema);

export default Discount;