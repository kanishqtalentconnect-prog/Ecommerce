import Review from "../models/review.model.js";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";

// Create a review for a product from a delivered order
export const createReview = async (req, res) => {
  try {
    const { orderId, productId, rating, comment, images } = req.body;
    const userId = req.user._id;

    // Validate required fields
    if (!orderId || !productId || !rating || !comment) {
      return res.status(400).json({ 
        success: false, 
        message: "Order ID, Product ID, rating, and comment are required" 
      });
    }

    // Check if the order exists and belongs to the user
    const order = await Order.findOne({ 
      _id: orderId, 
      user: userId,
      status: 'delivered' // Only allow reviews for delivered orders
    });
    
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: "Delivered order not found" 
      });
    }

    // Check if the product was part of this order
    const productInOrder = order.products.find(
      item => item.product.toString() === productId
    );
    
    if (!productInOrder) {
      return res.status(400).json({ 
        success: false, 
        message: "Product not found in this order" 
      });
    }

    // Check if user has already reviewed this product for this order
    const existingReview = await Review.findOne({
      user: userId,
      product: productId,
      order: orderId
    });

    if (existingReview) {
      return res.status(400).json({ 
        success: false, 
        message: "You have already reviewed this product for this order" 
      });
    }

    // Create the review
    const review = new Review({
      user: userId,
      product: productId,
      order: orderId,
      rating: Number(rating),
      comment: comment.trim(),
      images: images || []
    });

    await review.save();

    // Populate the review for response
    await review.populate([
      { path: 'user', select: 'name' },
      { path: 'product', select: 'name image' }
    ]);

    // Update product's average rating
    await updateProductAverageRating(productId);

    res.status(201).json({ 
      success: true, 
      message: "Review created successfully",
      data: review 
    });
  } catch (error) {
    console.error("Error creating review:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get reviews for a specific product
export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10, sort = 'newest' } = req.query;

    let sortOption = { createdAt: -1 }; // Default: newest first
    
    if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    } else if (sort === 'rating_high') {
      sortOption = { rating: -1, createdAt: -1 };
    } else if (sort === 'rating_low') {
      sortOption = { rating: 1, createdAt: -1 };
    }

    const reviews = await Review.find({ 
      product: productId, 
      status: 'active' 
    })
      .populate('user', 'name')
      .sort(sortOption)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalReviews = await Review.countDocuments({ 
      product: productId, 
      status: 'active' 
    });

    // Get rating distribution
    const ratingStats = await Review.aggregate([
      { $match: { product: mongoose.Types.ObjectId(productId), status: 'active' } },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 },
          avgRating: { $avg: '$rating' }
        }
      },
      { $sort: { _id: -1 } }
    ]);

    const totalRatings = ratingStats.reduce((sum, stat) => sum + stat.count, 0);
    const averageRating = totalRatings > 0 
      ? (ratingStats.reduce((sum, stat) => sum + (stat._id * stat.count), 0) / totalRatings)
      : 0;

    res.json({ 
      success: true, 
      data: {
        reviews,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(totalReviews / limit),
          totalReviews,
          hasMore: page * limit < totalReviews
        },
        stats: {
          averageRating: Number(averageRating.toFixed(1)),
          totalRatings,
          ratingDistribution: ratingStats.map(stat => ({
            rating: stat._id,
            count: stat.count,
            percentage: ((stat.count / totalRatings) * 100).toFixed(1)
          }))
        }
      }
    });
  } catch (error) {
    console.error("Error fetching product reviews:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get user's reviews
export const getUserReviews = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10 } = req.query;

    const reviews = await Review.find({ user: userId })
      .populate('product', 'name image price')
      .populate('order', 'createdAt')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalReviews = await Review.countDocuments({ user: userId });

    res.json({ 
      success: true, 
      data: {
        reviews,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(totalReviews / limit),
          totalReviews,
          hasMore: page * limit < totalReviews
        }
      }
    });
  } catch (error) {
    console.error("Error fetching user reviews:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get reviewable products for a user (from delivered orders)
export const getReviewableProducts = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get all delivered orders for the user
    const deliveredOrders = await Order.find({
      user: userId,
      status: 'delivered'
    }).populate('products.product', 'name image price');

    // Get all existing reviews by the user
    const existingReviews = await Review.find({ user: userId })
      .select('product order');

    // Create a set of reviewed product-order combinations
    const reviewedCombinations = new Set(
      existingReviews.map(review => `${review.product}_${review.order}`)
    );

    // Find products that can be reviewed
    const reviewableItems = [];
    
    deliveredOrders.forEach(order => {
      order.products.forEach(item => {
        const combinationKey = `${item.product._id}_${order._id}`;
        
        if (!reviewedCombinations.has(combinationKey)) {
          reviewableItems.push({
            orderId: order._id,
            orderDate: order.createdAt,
            product: item.product,
            quantity: item.quantity,
            price: item.price
          });
        }
      });
    });

    res.json({ 
      success: true, 
      data: reviewableItems
    });
  } catch (error) {
    console.error("Error fetching reviewable products:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update a review
export const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment, images } = req.body;
    const userId = req.user._id;

    const review = await Review.findOne({ 
      _id: reviewId, 
      user: userId 
    });

    if (!review) {
      return res.status(404).json({ 
        success: false, 
        message: "Review not found" 
      });
    }

    // Update fields if provided
    if (rating) review.rating = Number(rating);
    if (comment) review.comment = comment.trim();
    if (images !== undefined) review.images = images;

    await review.save();

    // Update product's average rating
    await updateProductAverageRating(review.product);

    await review.populate([
      { path: 'user', select: 'name' },
      { path: 'product', select: 'name images' }
    ]);

    res.json({ 
      success: true, 
      message: "Review updated successfully",
      data: review 
    });
  } catch (error) {
    console.error("Error updating review:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Delete a review
export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user._id;

    const review = await Review.findOneAndDelete({ 
      _id: reviewId, 
      user: userId 
    });

    if (!review) {
      return res.status(404).json({ 
        success: false, 
        message: "Review not found" 
      });
    }

    // Update product's average rating
    await updateProductAverageRating(review.product);

    res.json({ 
      success: true, 
      message: "Review deleted successfully" 
    });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Mark review as helpful/unhelpful
export const markReviewHelpful = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { isHelpful } = req.body;
    const userId = req.user._id;

    const review = await Review.findById(reviewId);
    
    if (!review) {
      return res.status(404).json({ 
        success: false, 
        message: "Review not found" 
      });
    }

    // Remove existing helpful marking by this user
    review.helpful = review.helpful.filter(
      item => item.user.toString() !== userId.toString()
    );

    // Add new helpful marking if specified
    if (typeof isHelpful === 'boolean') {
      review.helpful.push({
        user: userId,
        isHelpful
      });
    }

    await review.save();

    res.json({ 
      success: true, 
      message: "Review helpfulness updated" 
    });
  } catch (error) {
    console.error("Error marking review helpful:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Helper function to update product's average rating
const updateProductAverageRating = async (productId) => {
  try {
    const stats = await Review.aggregate([
      { $match: { product: mongoose.Types.ObjectId(productId), status: 'active' } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 }
        }
      }
    ]);

    const averageRating = stats.length > 0 ? Number(stats[0].averageRating.toFixed(1)) : 0;
    const totalReviews = stats.length > 0 ? stats[0].totalReviews : 0;

    await Product.findByIdAndUpdate(productId, {
      averageRating,
      totalReviews
    });
  } catch (error) {
    console.error("Error updating product average rating:", error);
  }
};

export const getRecentReviews = async (req, res) => {
  try {
    const { limit = 6 } = req.query;

    const reviews = await Review.find({ 
      status: 'active',
      rating: { $gte: 2 } // Only show 4+ star reviews on homepage
    })
      .populate('user', 'name')
      .populate('product', 'name image')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({ 
      success: true, 
      data: reviews
    });
  } catch (error) {
    console.error("Error fetching recent reviews:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};