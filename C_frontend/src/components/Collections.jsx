import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axiosInstance from "../lib/axios";

/* ---------- STATIC COLLECTIONS ---------- */

const divineGods = [
  { name: "Ganesh", image: "/images/ganesha.jpg" },
  { name: "Krishna", image: "/images/krishna.jpg" },
  { name: "Shiv", image: "/images/shiva.jpg" },
  { name: "NATARAJA", image: "/images/natraja.jpg" },
  { name: "Nandi", image: "/images/nandi.jpg" },
  { name: "Buddha", image: "/images/buddha.jpg" },
  { name: "Tirupati Balaji", image: "/images/tirupati.jpg" },
  { name: "Vishnu", image: "/images/vishnu.jpg" },
  { name: "Garuda", image: "/images/garuda.jpg" },
  { name: "RAM", image: "/images/rama.jpg" },
  { name: "Hanuman", image: "/images/hanuman.jpg" },
  { name: "Panchmukhi Hanuman", image: "/images/panchmukhi_hanuman.jpg" },
  { name: "Murugan", image: "/images/murugan.jpg" },
  { name: "Ayyappan", image: "/images/ayyappan.jpg" },
  { name: "Kaal Bhairav", image: "/images/kaal_bhairav.jpg" },
];

const divineGoddesses = [
  { name: "Durga Maa", image: "/images/durgama.jpg" },
  { name: "Kali Maa", image: "/images/kalima.jpg" },
  { name: "Lakshmi", image: "/images/lakshmi.jpg" },
  { name: "Saraswati", image: "/images/saraswati.jpg" },
  { name: "Parvati", image: "/images/parvati.jpg" },
  { name: "Rajeshwari Lalita Devi", image: "/images/rajeshwari.jpg" },
  { name: "Varahi Amman", image: "/images/varahi.jpg" },
  { name: "Mariamman", image: "/images/mariamman.jpg" },
  { name: "Buddhist Tara", image: "/images/buddhist.jpg" },
  { name: "Kaamdhenu Cow", image: "/images/kaamdhenu.jpg" },
];

const STATIC_COLLECTIONS = [...divineGods, ...divineGoddesses];

/* ---------- COMPONENT ---------- */

function Collections() {
  const navigate = useNavigate();
  const [collections, setCollections] = useState([]);

  useEffect(() => {
    const loadCollections = async () => {
      try {
        const res = await axiosInstance.get("/api/category");

        const backendCategories =
          res.data.categories
            ?.filter((c) => c.isActive)
            .map((c) => ({
              name: c.name,
              image: null, // no image from backend
            })) || [];

        // Avoid duplicates (by name)
        const merged = [
          ...STATIC_COLLECTIONS,
          ...backendCategories.filter(
            (b) =>
              !STATIC_COLLECTIONS.some(
                (s) => s.name.toLowerCase() === b.name.toLowerCase()
              )
          ),
        ];

        setCollections(merged);
      } catch (error) {
        console.error("Category fetch failed", error);
        setCollections(STATIC_COLLECTIONS);
      }
    };

    loadCollections();
  }, []);

  const handleCollectionClick = (item) => {
    navigate(`/deity/${encodeURIComponent(item.name)}`);
  };

  const handleBackToHome = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-serif text-gray-800 mb-2">All Collections</h1>
              <p className="text-gray-600">Explore our complete range of spiritual and decorative items</p>
            </div>
            <button 
              onClick={handleBackToHome}
              className="bg-gray-800 text-white px-6 py-2 rounded hover:bg-gray-700 transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {collections.map((item, index) => (
            <div
              key={index}
              onClick={() => handleCollectionClick(item)}
              className="bg-white rounded-lg shadow-md hover:shadow-xl cursor-pointer overflow-hidden"
            >
              <div className="aspect-square bg-gray-100 flex items-center justify-center">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-bold text-gray-600">
                    {item.name[0]}
                  </span>
                )}
              </div>

              <div className="p-4 text-center">
                <h3 className="font-semibold text-lg">{item.name}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Collections;
