import Product from "../models/product.model.js";
import mongoose from "mongoose";

export const getCartProducts = async (req, res) => {
  const user = req.user;
  try {

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // get details of each product and combine with quantity
    const cartProducts = await Promise.all(
      user.cartItems.map(async (item) => {
        const itemID = item._id.toString();
        const product = await Product.findById(itemID);

        return product !== null ? { product, quantity: item.quantity } : null;
      })
    );

    res.json(cartProducts.filter(item => item !== null));
  } catch (error) {
    console.log("Error in getCartProducts controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const user = req.user;

    const productObjectId = new mongoose.Types.ObjectId(productId);
    const existingItem = user.cartItems.find((item) => item._id.equals(productObjectId));

    console.log(existingItem, productObjectId);

    if (existingItem) {
      existingItem.quantity = quantity;
    } else {
      user.cartItems.push({ quantity, _id: productObjectId });
    }

    await user.save();
    res.json("Added!");
  } catch (error) {
    console.log("Error in addToCart controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const removeAllFromCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = req.user;

    user.cartItems = user.cartItems.filter((item) => item.id !== productId);

    await user.save();
    res.json(user.cartItems);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateQuantity = async (req, res) => {
  try {
    const { id: productId } = req.params;
    const { quantity } = req.body;
    const user = req.user;
    const existingItem = user.cartItems.find((item) => item.id === productId);

    if (existingItem) {
      if (quantity === 0) {
        user.cartItems = user.cartItems.filter((item) => item.id !== productId);
        await user.save();
        return res.json(user.cartItems);
      }
      existingItem.quantity = quantity;
      await user.save();
      res.json(user.cartItems);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    console.log("Error in updateQuantity controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const clearCart = async (req, res) => {
  try {
    const user = req.user;
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Empty the cart items array
    user.cartItems = [];
    
    await user.save();
    res.json({ message: "Cart cleared successfully" });
  } catch (error) {
    console.log("Error in clearCart controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};