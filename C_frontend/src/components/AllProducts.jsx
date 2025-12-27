import { useEffect, useState } from "react";
import axiosInstance from "../lib/axios";
import ProductCard from "./ProductCard";
import { Link } from "react-router-dom";

function AllProducts() {
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axiosInstance
      .get("api/products")
      .then((response) => {
        setAllProducts(response.data.products);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching all products:", error);
        setError("Failed to load products");
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="text-center text-lg font-semibold mt-4">Loading products...</p>;
  if (error) return <h2 className="text-center text-red-500 text-xl">{error}</h2>;

  return (
    <div className="p-5 mt-64">
      <h1 className="text-4xl italic mb-4 text-center">All Products</h1>

      {/* Grid Layout for All Products */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-6 px-4 max-w-6xl mx-auto">

        {allProducts.length > 0 ? (
          allProducts.map((product) => <ProductCard key={product._id} product={product} />)
        ) : (
          <p className="text-center text-gray-600">No products available.</p>
        )}
      </div>

      {/* Back Button */}
      <div className="text-center mt-6">
        <Link to="/" className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 transition">
          Back to Home
        </Link>
      </div>
    </div>
  );
}

export default AllProducts;
