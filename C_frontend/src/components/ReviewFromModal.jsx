import React, { useState } from "react";
import { 
  X, 
  Star, 
  Upload, 
  Image,
  Trash2,
  AlertCircle
} from "lucide-react";
import axiosInstance from "../lib/axios";

const ReviewFormModal = ({ isOpen, onClose, product, orderId, onReviewSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    const newErrors = {};
    if (rating === 0) newErrors.rating = "Please select a rating";
    if (!comment.trim()) newErrors.comment = "Please write a comment";
    if (comment.trim().length < 10) newErrors.comment = "Comment must be at least 10 characters";
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    try {
      const reviewData = {
        orderId,
        productId: product._id,
        rating,
        comment: comment.trim(),
        images
      };

      const response = await axiosInstance.post("/api/reviews", reviewData);
      
      if (response.data.success) {
        onReviewSubmitted?.(response.data.data);
        handleClose();
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      setErrors({ 
        submit: error.response?.data?.message || "Failed to submit review. Please try again." 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setImages(prev => [...prev, event.target.result]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleClose = () => {
    setRating(0);
    setHoverRating(0);
    setComment("");
    setImages([]);
    setErrors({});
    onClose();
  };

  const renderStars = () => {
    return [...Array(5)].map((_, index) => {
      const starValue = index + 1;
      return (
        <button
          key={index}
          type="button"
          onClick={() => setRating(starValue)}
          onMouseEnter={() => setHoverRating(starValue)}
          onMouseLeave={() => setHoverRating(0)}
          className="p-1 transition-colors"
        >
          <Star
            className={`h-8 w-8 ${
              starValue <= (hoverRating || rating)
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        </button>
      );
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Write a Review</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Product Info */}
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <div className="h-16 w-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
              {product.images?.[0] ? (
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <Image className="h-8 w-8 text-gray-400" />
                </div>
              )}
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{product.name}</h3>
              <p className="text-sm text-gray-500">₹{product.price}</p>
            </div>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating *
            </label>
            <div className="flex items-center space-x-1">
              {renderStars()}
              {rating > 0 && (
                <span className="ml-2 text-sm text-gray-600">
                  {rating} star{rating !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            {errors.rating && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.rating}
              </p>
            )}
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Review *
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 resize-none"
              placeholder="Share your experience with this product..."
              maxLength={500}
            />
            <div className="flex justify-between mt-1">
              {errors.comment && (
                <p className="text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.comment}
                </p>
              )}
              <p className="text-sm text-gray-500 ml-auto">
                {comment.length}/500
              </p>
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add Photos (Optional)
            </label>
            <div className="space-y-4">
              {images.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Review ${index + 1}`}
                        className="h-24 w-full object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {images.length < 5 && (
                <div>
                  <label className="cursor-pointer flex items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg hover:border-emerald-400 transition-colors">
                    <div className="text-center">
                      <Upload className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Upload photos</p>
                    </div>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    You can upload up to 5 photos
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                {errors.submit}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || rating === 0 || !comment.trim()}
              className="px-6 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewFormModal;