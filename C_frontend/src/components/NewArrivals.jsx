import { useEffect, useState } from "react";
import axiosInstance from "../lib/axios";
import ProductCard from "./ProductCard";
import { Link } from "react-router-dom";

function NewArrivals() {
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNewArrivals = async () => {
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

        // Sort by creation date (newest first) and get all new arrivals
        const sortedByDate = [...allProducts].sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        
        setNewArrivals(sortedByDate);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching new arrivals:", error);
        setError("Failed to load new arrivals");
        setLoading(false);
      }
    };

    fetchNewArrivals();
  }, []);

  if (loading) return <p className="text-center text-lg font-semibold mt-4">Loading new arrivals...</p>;
  if (error) return <h2 className="text-center text-red-500 text-xl">{error}</h2>;

  return (
    <div className="p-5 mt-64">
      <h1 className="text-4xl italic mb-4 text-center">New Arrivals</h1>
      <p className="text-center text-gray-600 mb-8">Discover our latest products, freshly added to our collection</p>

      {/* Grid Layout for New Arrivals */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-6 px-4 max-w-6xl mx-auto">
        {newArrivals.length > 0 ? (
          newArrivals.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))
        ) : (
          <div className="col-span-full text-center text-gray-600">
            <p>No new arrivals available at the moment.</p>
          </div>
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

export default NewArrivals;