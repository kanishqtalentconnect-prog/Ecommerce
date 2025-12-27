import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500,
  },
  images: [{
    type: String, // URLs of review images
  }],
  helpful: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    isHelpful: Boolean,
  }],
  verified: {
    type: Boolean,
    default: true, // Since reviews are from verified purchases
  },
  status: {
    type: String,
    enum: ['active', 'hidden', 'flagged'],
    default: 'active'
  }
}, { 
  timestamps: true 
});

// Compound index to ensure one review per user per product per order
reviewSchema.index({ user: 1, product: 1, order: 1 }, { unique: true });

// Index for efficient queries
reviewSchema.index({ product: 1, status: 1 });
reviewSchema.index({ user: 1 });

const Review = mongoose.model("Review", reviewSchema);

export default Review;