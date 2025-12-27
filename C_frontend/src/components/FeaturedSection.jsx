import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../lib/axios";
import { useCurrency } from "../context/CurrencyContext";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

const FeaturedSections = () => {
  const [newArrivals, setNewArrivals] = useState([]);
  const [discountedItems, setDiscountedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const newArrivalsRef = useRef(null);
  const discountedRef = useRef(null);
  
  const { currency, formatCurrency } = useCurrency();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const productsResponse = await axiosInstance.get("/api/products");
        console.log("API Response:", productsResponse.data);
        
        const allProducts = productsResponse.data.products;
        console.log("All Products:", allProducts);

        if (!allProducts || !Array.isArray(allProducts)) {
          console.error("Products not found or not an array:", allProducts);
          setLoading(false);
          return;
        }

        // Get new arrivals (latest 10 products) - sorted by creation date descending
        const sortedByDate = [...allProducts].sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        console.log("Sorted by date (newest first):", sortedByDate.slice(0, 10));
        setNewArrivals(sortedByDate.slice(0, 10));

        // Get discounted items (products that have active discounts)
        const discountedProducts = allProducts.filter(product => 
          product.hasDiscount && product.discountAmount > 0
        );
        
        // Sort discounted products by discount percentage (highest first)
        const sortedDiscounted = discountedProducts.sort((a, b) => {
          const discountA = ((a.originalPrice - a.finalPrice) / a.originalPrice) * 100;
          const discountB = ((b.originalPrice - b.finalPrice) / b.originalPrice) * 100;
          return discountB - discountA;
        });
        
        console.log("Discounted products:", sortedDiscounted);
        setDiscountedItems(sortedDiscounted.slice(0, 10));
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching featured products:", error);
        console.error("Error details:", error.response?.data);
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  const scroll = (ref, direction) => {
    if (ref.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      ref.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const goToProductDetails = (productId) => {
    navigate(`/product/${productId}`);
  };

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    // Use the final price from backend calculation
    const productForCart = {
      ...product,
      price: product.hasDiscount ? product.finalPrice : product.price
    };
    addToCart(productForCart, 1);
  };

  const ProductCardFeatured = ({ product, showDiscount = false }) => {
    const hasDiscount = product.hasDiscount && product.discountAmount > 0;
    const displayPrice = hasDiscount ? product.finalPrice : product.price;
    const originalPrice = hasDiscount ? product.originalPrice : product.price;
    
    const discountPercentage = hasDiscount 
      ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100)
      : 0;

    return (
      <div 
        className="w-[220px] text-center flex-shrink-0 relative cursor-pointer group"
        onClick={() => goToProductDetails(product._id)}
      >
        {/* Discount Badge */}
        {showDiscount && hasDiscount && (
          <span className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded z-10">
            -{discountPercentage}%
          </span>
        )}
        
        {/* New Arrival Badge */}
        {!showDiscount && (
          <span className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded z-10">
            NEW
          </span>
        )}
        
        <div className="overflow-hidden rounded-none">
          <img
            src={product.image || "/default.jpg"}
            alt={product.name || "Product"}
            className="w-full h-60 object-cover transition-transform duration-300 group-hover:scale-110"
          />
        </div>
        
        <h3 className="text-md font-normal mt-2 transition-all duration-300 group-hover:underline">
          {product.name || "No Name"}
        </h3>
        
        <div className="flex flex-col items-center mt-1">
          <div className="flex items-center justify-center gap-2">
            {hasDiscount && showDiscount && (
              <span className="text-gray-400 text-sm line-through">
                {formatCurrency(originalPrice, currency)}
              </span>
            )}
            <span className={`text-lg font-semibold ${hasDiscount && showDiscount ? 'text-red-600' : ''}`}>
              {formatCurrency(displayPrice, currency)}
            </span>
          </div>

          {/* Discount information */}
          {showDiscount && hasDiscount && product.discount && (
            <div className="text-xs text-green-600 mt-1">
              <span className="font-medium">
                {product.discount.name}
              </span>
              {product.discount.type === 'global' && (
                <div className="text-xs text-blue-600">Site-wide offer!</div>
              )}
            </div>
          )}
        </div>
        
        <button
          onClick={(e) => handleAddToCart(e, product)}
          className="w-full border border-black text-black px-4 py-2 mt-3 rounded-none hover:border-2 transition-all duration-300"
        >
          Add to cart
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="py-12">
        <div className="text-center">
          <p className="text-lg font-semibold">Loading featured products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 bg-white">
      {/* New Arrivals Section */}
      <div className="max-w-7xl mx-auto px-4 mb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-light text-gray-900">New Arrivals</h2>
          <Link 
            to="/new-arrivals" 
            className="text-sm text-gray-600 hover:text-gray-900 border border-gray-300 px-4 py-2 hover:border-gray-900 transition-colors"
          >
            View all
          </Link>
        </div>
        
        {newArrivals.length > 0 ? (
          <div className="relative">
            <button
              onClick={() => scroll(newArrivalsRef, 'left')}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white shadow-md p-2 rounded-full z-10 hover:shadow-lg transition-shadow"
              style={{ marginLeft: '-20px' }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <div
              ref={newArrivalsRef}
              className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {newArrivals.map((product) => (
                <ProductCardFeatured key={product._id} product={product} />
              ))}
            </div>
            
            <button
              onClick={() => scroll(newArrivalsRef, 'right')}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white shadow-md p-2 rounded-full z-10 hover:shadow-lg transition-shadow"
              style={{ marginRight: '-20px' }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            
            {/* Dots indicator */}
            <div className="flex justify-center mt-6 gap-2">
              {Array.from({ length: Math.min(5, newArrivals.length) }).map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full ${index === 0 ? 'bg-amber-600' : 'bg-gray-300'}`}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-600">
            <p>No new arrivals available at the moment.</p>
          </div>
        )}
      </div>

      {/* Discounted Items Section */}
      {discountedItems.length > 0 && (
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-light text-gray-900">Discounted Items</h2>
            <Link 
              to="/discounted-products" 
              className="text-sm text-gray-600 hover:text-gray-900 border border-gray-300 px-4 py-2 hover:border-gray-900 transition-colors"
            >
              View all
            </Link>
          </div>
          
          <div className="relative">
            <button
              onClick={() => scroll(discountedRef, 'left')}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white shadow-md p-2 rounded-full z-10 hover:shadow-lg transition-shadow"
              style={{ marginLeft: '-20px' }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <div
              ref={discountedRef}
              className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {discountedItems.map((product) => (
                <ProductCardFeatured key={product._id} product={product} showDiscount={true} />
              ))}
            </div>
            
            <button
              onClick={() => scroll(discountedRef, 'right')}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white shadow-md p-2 rounded-full z-10 hover:shadow-lg transition-shadow"
              style={{ marginRight: '-20px' }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            
            {/* Dots indicator */}
            <div className="flex justify-center mt-6 gap-2">
              {Array.from({ length: Math.min(5, discountedItems.length) }).map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full ${index === 0 ? 'bg-amber-600' : 'bg-gray-300'}`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeaturedSections;