import Order from "../models/order.model.js";
import Address from "../models/address.model.js";

export const createOrder = async (req, res) => {
  try {
    const { products, totalAmount, shippingAddress, deliveryMethod, pickupInfo } = req.body;
    
    // Validate required fields
    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: "Products array is required" });
    }
    
    if (totalAmount === undefined || totalAmount < 0) {
      return res.status(400).json({ message: "Valid total amount is required" });
    }
    
    // For shipping method, verify shipping address exists
    if (deliveryMethod === 'ship' && shippingAddress) {
      const address = await Address.findOne({
        _id: shippingAddress,
        userId: req.user._id
      });
      
      if (!address) {
        return res.status(404).json({ message: "Shipping address not found" });
      }
    }
    
    // Create the order
    const newOrder = new Order({
      user: req.user._id,
      products,
      totalAmount,
      shippingDetails: {
        deliveryMethod,
        addressId: deliveryMethod === 'ship' ? shippingAddress : null,
        pickupInfo: deliveryMethod === 'pickup' ? pickupInfo : null
      }
    });
    
    await newOrder.save();
    
    res.status(201).json({
      message: "Order created successfully",
      order: newOrder
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ 
      message: "Failed to create order", 
      error: error.message 
    });
  }
};

// Get orders for the authenticated user
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('products.product')
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ 
      message: "Failed to fetch orders", 
      error: error.message 
    });
  }
};