import mongoose from "mongoose";

const productVariantSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, default: 0 },
    attributes: { type: Object }, // Example: { size: "M", color: "red" }
  },
  { timestamps: true }
);

const ProductVariant = mongoose.model("ProductVariant", productVariantSchema);
export default ProductVariant;