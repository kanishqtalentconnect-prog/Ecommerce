import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid"; // ✅ Import UUID

const productSchema = new mongoose.Schema({
 
  sku: { type: String, unique: true, required: true, default: uuidv4 }, //  Ensure unique SKU
  name: { type: String, required: true },
    description:{
        type: String,
        required: true
    },
    price:{
        type: Number,
        min: 0,
        required: true
    },
    image:{
        type: String,
        required: [true, "Image is required"]
    },
    additionalImages: {
        type: [String],
        default: [],
        validate: [
          {
            validator: function(images) {
              return images.length <= 4;
            },
            message: "Cannot add more than 4 additional images"
          }
        ]
      },
    category:{
        type: String,
        required: true
    },
    size: {
        type: String,
        required: true
    },
    isFeatured:{
        type: Boolean,
        default: false
    }
}, {timestamps: true});


const Product = mongoose.model("Product", productSchema);

export default Product

