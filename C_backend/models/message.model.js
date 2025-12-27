import mongoose from "mongoose";

const headerMessageSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['announcement', 'discount', 'promotion'],
    default: 'announcement'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  priority: {
    type: Number,
    default: 1 // Higher number = higher priority
  },
  // Link discount messages to actual discounts
  discountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Discount'
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
headerMessageSchema.index({ isActive: 1, priority: -1 });
headerMessageSchema.index({ type: 1, isActive: 1 });

const HeaderMessage = mongoose.model("HeaderMessage", headerMessageSchema);

export default HeaderMessage;