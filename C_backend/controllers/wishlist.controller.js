import User from "../models/user.model.js";

export const toggleWishlist = async (req, res) => {
  const userId = req.user._id;
  const { productId } = req.body;

  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const index = user.wishlist.indexOf(productId);

  if (index > -1) {
    // Remove from wishlist
    user.wishlist.splice(index, 1);
    await user.save();
    return res.json({ added: false });
  } else {
    // Add to wishlist
    user.wishlist.push(productId);
    await user.save();
    return res.json({ added: true });
  }
};

export const getWishlist = async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate("wishlist");

  res.json(user.wishlist);
};
