import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import axios from "../lib/axios";
import Navbar from "../components/Navbar";

function DeityProducts() {
  const { name } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`/api/products/search?deity=${name}`)
      .then((res) => {
        setProducts(res.data.products);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching deity products", err);
        setLoading(false);
      });
  }, [name]);

  const formatName = (str) =>
    str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

  const handleContactClick = () => {
    navigate("/contact");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
            <p className="mt-4 text-xl text-gray-600 font-light">Loading divine collection...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center">
            <div className="inline-block mb-4">
              <div className="w-16 h-1 bg-gradient-to-r from-amber-600 to-yellow-500 mx-auto mb-6"></div>
            </div>
            <h1 className="text-4xl md:text-5xl font-serif text-gray-800 mb-4">
              {formatName(name)}
            </h1>
            <p className="text-lg text-gray-600 font-light max-w-2xl mx-auto">
              Discover our exquisite collection of handcrafted brass artifacts dedicated to {formatName(name)}
            </p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        {products.length === 0 ? (
          // No Products Found - Coming Soon Section
          <div className="text-center py-20">
            <div className="max-w-2xl mx-auto">
              <div className="mb-8">
                <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl">🎨</span>
                </div>
                <h2 className="text-3xl font-serif text-gray-800 mb-4">
                  Coming Soon
                </h2>
                <p className="text-xl text-gray-600 mb-8 font-light leading-relaxed">
                  Our artisans are carefully crafting exclusive {formatName(name)} collection pieces. 
                  Each artifact will embody divine elegance and spiritual essence.
                </p>
                <div className="w-32 h-1 bg-gradient-to-r from-amber-600 to-yellow-500 mx-auto mb-8"></div>
              </div>
              
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                  Get Notified First
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Want to be the first to know when our {formatName(name)} collection launches? 
                  Contact us for exclusive updates and early access.
                </p>
                <button 
                  onClick={handleContactClick}
                  className="inline-flex items-center bg-gradient-to-r from-amber-600 to-yellow-600 text-white px-8 py-4 rounded-lg hover:from-amber-700 hover:to-yellow-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <span className="mr-2">📞</span>
                  Contact Us for More Info
                </button>
              </div>

              {/* Additional Info Cards */}
              <div className="grid md:grid-cols-3 gap-6 mt-12">
                <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-xl">⚱️</span>
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-2">Handcrafted Excellence</h4>
                  <p className="text-gray-600 text-sm">Each piece meticulously crafted by master artisans</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-xl">✨</span>
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-2">Premium Quality</h4>
                  <p className="text-gray-600 text-sm">Finest brass and traditional techniques</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-xl">🏛️</span>
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-2">Sacred Heritage</h4>
                  <p className="text-gray-600 text-sm">Preserving ancient spiritual traditions</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Products Grid
          <div>
            <div className="text-center mb-12">
              <p className="text-gray-600 font-light">
                {products.length} exquisite piece{products.length !== 1 ? 's' : ''} in our {formatName(name)} collection
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
              {products.map((product) => (
                <div key={product._id} className="transform hover:scale-105 transition-transform duration-300">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom CTA Section */}
      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-t">
        <div className="max-w-7xl mx-auto px-6 py-16 text-center">
          <h3 className="text-2xl font-serif text-gray-800 mb-4">
            Can't Find What You're Looking For?
          </h3>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            We create custom pieces and take special orders. Let us know your requirements and we'll craft something unique for you.
          </p>
          <button 
            onClick={handleContactClick}
            className="inline-flex items-center bg-white text-amber-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors duration-300 font-medium shadow-md border border-amber-200"
          >
            Get in Touch
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeityProducts;