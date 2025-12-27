import { redis } from "../lib/redis.js";
import Product from "../models/product.model.js";
import cloudinary from "../lib/cloudinary.js";
import { dirname } from "path";
import mongoose from "mongoose";  
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";
import { calculateProductDiscount } from "./discount.controller.js";

// ✅ Define __dirname manually for ES Modules
const __dirname = dirname(fileURLToPath(import.meta.url));

// Helper function to apply discounts to products
const applyDiscountsToProducts = async (products) => {
  if (!Array.isArray(products)) {
    const discountInfo = await calculateProductDiscount(products);
    return {
      ...products.toObject ? products.toObject() : products,
      ...discountInfo
    };
  }

  return Promise.all(products.map(async (product) => {
    const discountInfo = await calculateProductDiscount(product);
    return {
      ...product.toObject ? product.toObject() : product,
      ...discountInfo
    };
  }));
};

export const searchByName = async (req, res) => {
  try {
    const deity = req.query.deity || req.query.name; // fallback if name is passed

    if (!deity || typeof deity !== "string") {
      return res.status(400).json({ success: false, message: "Missing or invalid deity query parameter" });
    }

    const trimmedDeity = deity.trim();

    // Escape special regex characters
    const escapedDeity = trimmedDeity.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Generate prefixes (e.g., "R", "Ra", "Ram", "Rama" for "Rama")
    const prefixes = [];
    for (let i = 1; i <= trimmedDeity.length; i++) {
      prefixes.push(trimmedDeity.substring(0, i));
    }

    const escapedPrefixes = prefixes.map(p => 
      p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    );

    const regexPattern = `(${escapedDeity})|^(${escapedPrefixes.join('|')})$`;

    const products = await Product.find({
      $or: [
        { name: { $regex: regexPattern, $options: "i" } },
        { category: { $regex: regexPattern, $options: "i" } }
      ]
    });

    // Apply discounts to products
    const productsWithDiscounts = await applyDiscountsToProducts(products);

    res.json({ success: true, products: productsWithDiscounts });
  } catch (error) {
    console.error("Search error:", error); // log the actual error
    res.status(500).json({ success: false, message: "Server Error.." });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find(); // find all products
    
    // Apply discounts to products
    const productsWithDiscounts = await applyDiscountsToProducts(products);
    
    res.json({ products: productsWithDiscounts });
  } catch (error) {
    console.log("Error in getAllProducts controller", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const getProductsById = async (req, res) => {
  const productId = req.params.id;
  try {
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Apply discount to single product
    const productWithDiscount = await applyDiscountsToProducts(product);
    
    res.status(200).json({ msg: productWithDiscount });
  } catch (error) {
    console.log("Error in getProductsById controller", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const getFeaturedProducts = async (req, res) => {
  try {
    let featuredProducts = await redis.get("featured_products");
    if (featuredProducts) {
      const parsedProducts = JSON.parse(featuredProducts);
      // Apply current discounts even to cached products
      const productsWithDiscounts = await applyDiscountsToProducts(parsedProducts);
      return res.json(productsWithDiscounts);
    }
    
    // if not in redis, fetch from mongodb
    featuredProducts = await Product.find({ isFeatured: true }).lean();

    if (!featuredProducts || featuredProducts.length === 0) {
      return res.status(404).json({ message: "No featured products found" });
    }

    // Apply discounts to products
    const productsWithDiscounts = await applyDiscountsToProducts(featuredProducts);

    // Store in redis for future quick access (without discounts to keep cache fresh)
    await redis.set("featured_products", JSON.stringify(featuredProducts));

    res.json(productsWithDiscounts);
  } catch (error) {
    console.log("Error in getFeaturedProducts controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, size, sku } = req.body;
    
    // Check for the main image (required)
    if (!req.files || !req.files.image) {
      return res.status(400).json({ message: "Main image is required" });
    }

    const image = req.files.image[0];
    let additionalImagesUrls = [];
    
    // Process optional additional images (up to 4)
    if (req.files.additionalImages) {
      if (req.files.additionalImages.length > 4) {
        return res.status(400).json({ message: "Maximum 4 additional images allowed" });
      }
      
      // Upload additional images to cloudinary
      const additionalImagesPromises = req.files.additionalImages.map(async (image) => {
        try {
          const result = await cloudinary.uploader.upload(image.path, {
            folder: "products",
          });
          return result.secure_url;
        } catch (err) {
          console.log("Error uploading additional image:", err);
          // Don't fail the whole request if one additional image fails
          return null;
        }
      });
      
      additionalImagesUrls = (await Promise.all(additionalImagesPromises)).filter(url => url !== null);
    }

    // Upload main image to cloudinary
    let mainImageUrl;
    try {
      const mainImageResult = await cloudinary.uploader.upload(image.path, {
        folder: "products",
      });
      mainImageUrl = mainImageResult.secure_url;
    } catch (cloudinaryError) {
      console.log("Cloudinary Upload Error:", cloudinaryError);
      return res.status(400).json({
        message: "Main image upload failed",
        error: cloudinaryError.message,
      });
    }

    // Create the product with all images
    const product = await Product.create({
      sku: sku || uuidv4(),
      name,
      description,
      price,
      image: mainImageUrl,
      additionalImages: additionalImagesUrls,
      category,
      size,
    });

    // Apply discounts to the newly created product
    const productWithDiscount = await applyDiscountsToProducts(product);

    res.status(201).json(productWithDiscount);
  } catch (error) {
    console.log("Error in createProduct controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// NEW: Update Product Function
export const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const { name, description, price, category, size, sku, removeImages } = req.body;

    // Find the existing product
    const existingProduct = await Product.findById(productId);
    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    let updatedData = {
      name: name || existingProduct.name,
      description: description || existingProduct.description,
      price: price || existingProduct.price,
      category: category || existingProduct.category,
      size: size || existingProduct.size,
      sku: sku || existingProduct.sku,
    };

    // Handle main image update
    if (req.files && req.files.image) {
      try {
        // Delete old main image from cloudinary
        if (existingProduct.image) {
          const publicId = existingProduct.image.split("/").pop().split(".")[0];
          await cloudinary.uploader.destroy(`products/${publicId}`);
        }

        // Upload new main image
        const mainImageResult = await cloudinary.uploader.upload(req.files.image[0].path, {
          folder: "products",
        });
        updatedData.image = mainImageResult.secure_url;
      } catch (cloudinaryError) {
        console.log("Error updating main image:", cloudinaryError);
        return res.status(400).json({ message: "Failed to update main image" });
      }
    }

    // Handle additional images
    let updatedAdditionalImages = [...existingProduct.additionalImages];

    // Remove images marked for deletion
    if (removeImages) {
      const imagesToRemove = JSON.parse(removeImages);
      for (const imageUrl of imagesToRemove) {
        try {
          const publicId = imageUrl.split("/").pop().split(".")[0];
          await cloudinary.uploader.destroy(`products/${publicId}`);
          updatedAdditionalImages = updatedAdditionalImages.filter(img => img !== imageUrl);
        } catch (error) {
          console.log("Error removing image from cloudinary:", error);
        }
      }
    }

    // Add new additional images
    if (req.files && req.files.additionalImages) {
      const newImagesCount = req.files.additionalImages.length;
      const currentImagesCount = updatedAdditionalImages.length;
      
      if (currentImagesCount + newImagesCount > 4) {
        return res.status(400).json({ 
          message: `Cannot add ${newImagesCount} images. Maximum 4 additional images allowed. Currently have ${currentImagesCount}.` 
        });
      }

      const newImagePromises = req.files.additionalImages.map(async (image) => {
        try {
          const result = await cloudinary.uploader.upload(image.path, {
            folder: "products",
          });
          return result.secure_url;
        } catch (err) {
          console.log("Error uploading new additional image:", err);
          return null;
        }
      });

      const newImageUrls = (await Promise.all(newImagePromises)).filter(url => url !== null);
      updatedAdditionalImages = [...updatedAdditionalImages, ...newImageUrls];
    }

    updatedData.additionalImages = updatedAdditionalImages;

    // Update the product
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      updatedData,
      { new: true, runValidators: true }
    );

    // Apply discounts to updated product
    const productWithDiscount = await applyDiscountsToProducts(updatedProduct);

    res.json({
      message: "Product updated successfully",
      product: productWithDiscount
    });

  } catch (error) {
    console.log("Error in updateProduct controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update the delete function to remove all images from cloudinary
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Delete main image from cloudinary
    if (product.image) {
      try {
        const publicId = product.image.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`products/${publicId}`);
      } catch (error) {
        console.log("Error deleting main image from cloudinary", error);
      }
    }

    // Delete additional images from cloudinary
    if (product.additionalImages && product.additionalImages.length > 0) {
      try {
        const deletePromises = product.additionalImages.map(async (imageUrl) => {
          const publicId = imageUrl.split("/").pop().split(".")[0];
          return cloudinary.uploader.destroy(`products/${publicId}`);
        });
        await Promise.all(deletePromises);
      } catch (error) {
        console.log("Error deleting additional images from cloudinary", error);
      }
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.log("Error in deleteProduct controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getRecommendedProducts = async (req, res) => {
  try {
    const products = await Product.aggregate([
      {
        $sample: { size: 3 },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          image: 1,
          price: 1,
          category: 1,
        },
      },
    ]);

    // Apply discounts to recommended products
    const productsWithDiscounts = await applyDiscountsToProducts(products);
    
    res.json(productsWithDiscounts);
  } catch (error) {
    console.log("Error in getRecommendedProducts controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getProductByCategory = async (req, res) => {
  try {
    const rawCategory = req.params.category;
    const category = rawCategory.replace(/-/g, " ");
    
    const regex = new RegExp(`^${category}$`, "i");
    console.log({$regex:regex})

    const products = await Product.find({
      category: {$regex:regex},
    });

    // Apply discounts to products
    const productsWithDiscounts = await applyDiscountsToProducts(products);

    res.status(200).json(productsWithDiscounts);
  } catch (error) {
    console.error("Error fetching category:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const toggleFeaturedProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      product.isFeatured = !product.isFeatured;
      const updateProduct = await product.save();
      await updateFeaturedProductsCache();
      
      // Apply discounts to the updated product
      const productWithDiscount = await applyDiscountsToProducts(updateProduct);
      
      res.json(productWithDiscount);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    console.log("Error in toggleFeaturedProduct controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

async function updateFeaturedProductsCache() {
  try {
    const featuredProducts = await Product.find({ isFeatured: true }).lean();
    await redis.set("featured_products", JSON.stringify(featuredProducts));
  } catch (error) {
    console.log("error in update cache function");
  }
}