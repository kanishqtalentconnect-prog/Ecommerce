import ProductVariant from "../models/productVariant.model.js";

export const getProductVariants = async (req, res) => {
  try {
    const { id } = req.params;
    const variants = await ProductVariant.find({ productId: id });
    res.status(200).json({ success: true, variants });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addProductVariant = async (req, res) => {
  try {
    const { id } = req.params;
    const newVariant = new ProductVariant({ productId: id, ...req.body });
    await newVariant.save();
    res.status(201).json({ success: true, variant: newVariant });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProductVariant = async (req, res) => {
  try {
    const { variantId } = req.params;
    const updatedVariant = await ProductVariant.findByIdAndUpdate(
      variantId,
      req.body,
      { new: true }
    );
    if (!updatedVariant)
      return res
        .status(404)
        .json({ success: false, message: "Variant not found" });
    res.status(200).json({ success: true, variant: updatedVariant });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteProductVariant = async (req, res) => {
  try {
    const { variantId } = req.params;
    const deletedVariant = await ProductVariant.findByIdAndDelete(variantId);
    if (!deletedVariant)
      return res
        .status(404)
        .json({ success: false, message: "Variant not found" });
    res
      .status(200)
      .json({ success: true, message: "Variant deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};