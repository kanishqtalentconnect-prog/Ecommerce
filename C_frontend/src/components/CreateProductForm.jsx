import React, { useState, useEffect } from "react";
import axiosInstance from "../lib/axios";

const CreateProductForm = ({ onSuccess, onCancel }) => {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "",
    description: "",
    size: "",
    sku: "",
  });

  const [image, setImage] = useState(null);
  const [additionalImages, setAdditionalImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [additionalImagePreviews, setAdditionalImagePreviews] = useState([]);

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await axiosInstance.get('/api/category');
      if (response.data.success) {
        setCategories(response.data.categories);
      } else {
        setMessage({ text: 'Failed to load categories', type: 'error' });
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setMessage({ text: 'Failed to load categories', type: 'error' });
      setCategories([]); // Set empty array on error
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleMainImageChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleAdditionalImagesChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length > 4) {
      setMessage({ text: "You can upload a maximum of 4 additional images", type: "error" });
      return;
    }
    
    setAdditionalImages(files);
    
    // Create preview URLs
    const previews = files.map(file => URL.createObjectURL(file));
    setAdditionalImagePreviews(previews);
  };

  const removeAdditionalImage = (index) => {
    const updatedImages = [...additionalImages];
    updatedImages.splice(index, 1);
    setAdditionalImages(updatedImages);
    
    const updatedPreviews = [...additionalImagePreviews];
    URL.revokeObjectURL(updatedPreviews[index]);  // Revoke the URL to prevent memory leaks
    updatedPreviews.splice(index, 1);
    setAdditionalImagePreviews(updatedPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });

    if (!formData.name || !formData.description || !formData.price || !formData.category || !formData.size || !image) {
      setMessage({ text: "Product name, description, price, category, size, and main image are required", type: "error" });
      setLoading(false);
      return;
    }

    try {
      const productData = new FormData();

      // Append form data
      Object.keys(formData).forEach((key) => {
        productData.append(key, formData[key]);
      });

      // Append main image
      productData.append("image", image);

      // Append additional images
      additionalImages.forEach((image) => {
        productData.append("additionalImages", image);
      });

      const response = await axiosInstance.post("/api/products", productData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Response received:", response.data);
      setMessage({ text: "Product added successfully!", type: "success" });

      // Reset form
      setFormData({
        name: "",
        price: "",
        category: "",
        description: "",
        size: "",
        sku: "",
      });
      setImage(null);
      setAdditionalImages([]);
      setAdditionalImagePreviews([]);

      // Reset file inputs
      const mainImageInput = document.getElementById("main-image-upload");
      const additionalImagesInput = document.getElementById("additional-images-upload");
      if (mainImageInput) mainImageInput.value = "";
      if (additionalImagesInput) additionalImagesInput.value = "";

      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error creating product:", error);
      setMessage({
        text: error.response?.data?.message || "Failed to add product",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Clear message after 5 seconds
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ text: "", type: "" });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 mt-16 bg-white shadow-lg rounded-2xl border border-gray-200">
      <h2 className="text-3xl font-serif text-amber-700 text-center mb-8">Add New Product</h2>

      {message.text && (
        <div className={`mb-4 p-3 rounded ${message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SKU */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">SKU (optional)</label>
          <input
            type="text"
            name="sku"
            value={formData.sku}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-amber-500 focus:border-amber-500"
            placeholder="Leave blank to auto-generate"
          />
        </div>

        {/* Product Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Product Name*</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-amber-500 focus:border-amber-500"
            placeholder="e.g., Brass Ganesha Idol"
          />
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Price (INR)*</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-amber-500 focus:border-amber-500"
            placeholder="e.g., 3500"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category*</label>
          {loadingCategories ? (
            <div className="w-full border border-gray-300 rounded-md px-4 py-2 bg-gray-100 animate-pulse">
              Loading categories...
            </div>
          ) : (
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md px-4 py-2 bg-white focus:ring-amber-500 focus:border-amber-500"
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category._id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          )}
          {categories.length === 0 && !loadingCategories && (
            <p className="text-sm text-gray-500 mt-1">
              No categories available. Please contact admin to add categories.
            </p>
          )}
        </div>

        {/* Size */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Size*</label>
          <input
            type="text"
            name="size"
            value={formData.size}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-amber-500 focus:border-amber-500"
            placeholder="e.g., Small, Medium, Large or dimensions"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description*</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            required
            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-amber-500 focus:border-amber-500"
            placeholder="Add details about the product"
          />
        </div>

        {/* Main Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Main Product Image* (Required)</label>
          <input
            id="main-image-upload"
            type="file"
            name="image"
            onChange={handleMainImageChange}
            required
            accept="image/*"
            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-amber-500 focus:border-amber-500"
          />
          {image && (
            <div className="mt-2">
              <p className="text-sm text-gray-500">Selected: {image.name}</p>
            </div>
          )}
        </div>

        {/* Additional Images Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Additional Images (Up to 4 - Optional)
          </label>
          <input
            id="additional-images-upload"
            type="file"
            name="additionalImages"
            onChange={handleAdditionalImagesChange}
            multiple
            accept="image/*"
            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-amber-500 focus:border-amber-500"
          />
          
          {/* Preview of additional images */}
          {additionalImagePreviews.length > 0 && (
            <div className="mt-3">
              <p className="text-sm text-gray-600 mb-2">Selected {additionalImages.length} additional images:</p>
              <div className="flex flex-wrap gap-3">
                {additionalImagePreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    <img
                      src={preview}
                      alt={`Preview ${index}`}
                      className="h-24 w-24 object-cover rounded border"
                    />
                    <button
                      type="button"
                      onClick={() => removeAdditionalImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Submit Buttons */}
        <div className="text-center">
          <button
            type="submit"
            disabled={loading || categories.length === 0}
            className={`bg-amber-600 text-white px-6 py-2 rounded-md hover:bg-amber-700 transition mr-3 ${loading || categories.length === 0 ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Adding Product...' : 'Add Product'}
          </button>
          
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 transition"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default CreateProductForm;