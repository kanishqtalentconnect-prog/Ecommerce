import React, { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useCurrency } from "../context/CurrencyContext"; // Import the currency hook
import axiosInstance from "../lib/axios";

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("deity") || "";
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { currency, formatCurrency } = useCurrency(); // Use the currency context

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query.trim()) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await axiosInstance.get(`/api/products/search?deity=${query}`);
        if (response.data.success) {
          setProducts(response.data.products);
        } else {
          setError("Failed to fetch search results");
        }
      } catch (err) {
        console.error("Search error:", err);
        setError("An error occurred while searching for products");
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query]);

  // Function to navigate to product details
  const goToProductDetails = (productId) => {
    navigate(`/product/${productId}`);
  };

  // Function to handle adding product to cart
  const addToCart = async (productId) => {
    try {
      const quantity = 1;
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/cart`, 
        { quantity, productId }, 
        { withCredentials: true }
      );
      console.log("Added to cart:", response);
      // You could add a success notification here if desired
    } catch (err) {
      console.error("Error adding to cart:", err);
      // You could add an error notification here if desired
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-medium mb-6 text-center">
        Search Results for "{query}"
      </h2>
      
      {loading && <div className="text-center py-8">Loading...</div>}
      
      {error && <div className="text-red-500 py-4 text-center">{error}</div>}
      
      {!loading && !error && products.length === 0 && (
        <div className="text-center py-8">
          <p>No products found matching "{query}"</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {products.map((product) => {
          const isOnSale = product.originalPrice && product.price < product.originalPrice;
          
          return (
            <div key={product._id} className="flex flex-col relative group">
              {isOnSale && (
                <span className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
                  Sale
                </span>
              )}
              
              <div 
                className="cursor-pointer"
                onClick={() => goToProductDetails(product._id)}
              >
                <div className="mb-2 aspect-square overflow-hidden">
                  <img 
                    src={product.image || "/default.jpg"} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                
                <h3 className="text-center font-medium group-hover:underline transition-all duration-300">
                  {product.name}
                </h3>
                
                <div className="flex items-center justify-center gap-2 mt-1">
                  {product.originalPrice && (
                    <div className="flex items-center gap-1">
                      <span className="text-gray-400 text-sm line-through">
                        {formatCurrency(product.originalPrice,currency)}
                      </span>
                      <span className="text-xs text-gray-500">
                        (₹{product.originalPrice})
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <span className="text-lg font-semibold">
                      {formatCurrency(product.price,currency)}
                    </span>
                    <span className="text-xs text-gray-500">
                      (₹{product.price})
                    </span>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  addToCart(product._id);
                }}
                className="w-full border border-black text-black px-4 py-2 mt-3 rounded-none hover:border-2 transition-all duration-300"
              >
                Add to cart
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SearchPage;