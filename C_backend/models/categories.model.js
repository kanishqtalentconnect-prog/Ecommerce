import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true
  },
  slug: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true
  },
  title: { 
    type: String, 
    trim: true // Optional field for display purposes
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Pre-save middleware to generate slug from name if not provided
categorySchema.pre('save', function(next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
  }
  next();
});

export const Category = mongoose.model("Category", categorySchema);