import { useEffect, useState } from "react";
import axiosInstance from "../lib/axios";
import ProductCard from "./ProductCard";
import { Link } from "react-router-dom";

function DiscountedProducts() {
  const [discountedProducts, setDiscountedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDiscountedProducts = async () => {
      try {
        const response = await axiosInstance.get("/api/products");
        console.log("API Response:", response.data);
        
        const allProducts = response.data.products;
        
        if (!allProducts || !Array.isArray(allProducts)) {
          console.error("Products not found or not an array:", allProducts);
          setError("Failed to load products");
          setLoading(false);
          return;
        }

        // Filter products that have active discounts
        const productsWithDiscounts = allProducts.filter(product => 
          product.hasDiscount && product.discountAmount > 0
        );

        // Sort by discount percentage (highest discount first)
        const sortedByDiscount = productsWithDiscounts.sort((a, b) => {
          const discountA = ((a.originalPrice - a.finalPrice) / a.originalPrice) * 100;
          const discountB = ((b.originalPrice - b.finalPrice) / b.originalPrice) * 100;
          return discountB - discountA;
        });
        
        setDiscountedProducts(sortedByDiscount);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching discounted products:", error);
        setError("Failed to load discounted products");
        setLoading(false);
      }
    };

    fetchDiscountedProducts();
  }, []);

  if (loading) return <p className="text-center text-lg font-semibold mt-4">Loading discounted products...</p>;
  if (error) return <h2 className="text-center text-red-500 text-xl">{error}</h2>;

  return (
    <div className="p-5 mt-64">
      <div className="text-center mb-8">
        <h1 className="text-4xl italic mb-4">🎉 Special Offers & Discounts</h1>
        <p className="text-gray-600 mb-2">Save big on these amazing products!</p>
        {discountedProducts.length > 0 && (
          <p className="text-sm text-green-600 font-medium">
            {discountedProducts.length} products on discount
          </p>
        )}
      </div>

      {/* Grid Layout for Discounted Products */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-6 px-4 max-w-6xl mx-auto">
        {discountedProducts.length > 0 ? (
          discountedProducts.map((product) => (
            <ProductCard key={product._id} product={product} showDiscount={true} />
          ))
        ) : (
          <div className="col-span-full text-center text-gray-600 py-12">
            <div className="mb-4">
              <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Discounts</h3>
            <p className="text-gray-600 mb-4">Check back soon for amazing deals and offers!</p>
            <Link 
              to="/products" 
              className="inline-block bg-black text-white px-6 py-2 rounded hover:bg-gray-800 transition"
            >
              Browse All Products
            </Link>
          </div>
        )}
      </div>

      {/* Back Button */}
      <div className="text-center mt-8">
        <Link to="/" className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 transition">
          Back to Home
        </Link>
      </div>
    </div>
  );
}

export default DiscountedProducts;