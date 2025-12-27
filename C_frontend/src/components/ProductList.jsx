import { useNavigate } from "react-router-dom";

// Individual Gods as collections (from your DivineGods.jsx)
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

// Individual Goddesses as collections (from your DivineGoddesses.jsx)
const divineGoddesses = [
  { name: "Durga Maa", image: "/images/durgama.jpg" },
  { name: "Kali Maa", image: "/images/kalima.jpg" },
  { name: "Lakshmi", image: "/images/lakshmi.jpg" },
  { name: "saraswati", image: "/images/saraswati.jpg" },
  { name: "PARVATI", image: "/images/parvati.jpg" },
  { name: "RAJESHWARI LALITA DEVI", image: "/images/rajeshwari.jpg" },
  { name: "Varahi Amman", image: "/images/varahi.jpg" },
  { name: "MARIAMMAN", image: "/images/mariamman.jpg" },
  { name: "Buddhhist Tara", image: "/images/buddhist.jpg" },
  { name: "Kaamdhenu Cow", image: "/images/kaamdhenu.jpg" },
];

// Combine all deities
const allCollections = [...divineGods, ...divineGoddesses];

function ProductList() {
  const navigate = useNavigate();

  const handleCollectionClick = (deity) => {
    // Navigate to individual deity page using your existing route structure
    navigate(`/deity/${encodeURIComponent(deity.name)}`);
  };

  const handleViewAllClick = () => {
    navigate("/collections");
  };

  return (
    <div id="collections-section" className="p-5">
      {/* Our Collections Header */}
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-serif text-gray-800 mb-8 text-left ml-11">
          Our Collections
        </h1>

        {/* Collections Grid - Show first 8 collections */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-4 mb-8">
          {allCollections.slice(0, 8).map((deity, index) => (
            <div
              key={index}
              className="relative cursor-pointer group overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
              onClick={() => handleCollectionClick(deity)}
            >
              <div className="aspect-square bg-gray-100">
                <img
                  src={deity.image}
                  alt={deity.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="text-center text-white">
                    <h3 className="font-semibold text-lg mb-1">{deity.name}</h3>
                    <p className="text-sm opacity-90">View Collection</p>
                  </div>
                </div>
              </div>
              {/* Collection Name Below Image */}
              <div className="p-3 bg-white">
                <h3 className="font-medium text-gray-800 text-center text-sm">
                  {deity.name}
                </h3>
              </div>
            </div>
          ))}
        </div>

        {/* View All Collections Button */}
        <div className="text-center">
          <button 
            onClick={handleViewAllClick}
            className="bg-black text-white px-8 py-3 rounded hover:bg-gray-800 transition-colors duration-300 font-medium"
          >
            View All Collections
          </button>
        </div>

        {/* About Section */}
        <div className="bg-gradient-to-b from-gray-50 to-white py-20 mt-20">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-serif text-gray-800 mb-6">
                Crafting Divine Elegance Since Generations
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-amber-600 to-yellow-500 mx-auto mb-8"></div>
              <p className="text-xl text-gray-700 leading-relaxed mb-8 font-light">
                At <span className="font-semibold text-amber-700">BudhShiv</span>, we specialize in creating exquisite brass handicrafts that embody the essence of divine beauty and spiritual tranquility.
              </p>
              <div className="grid md:grid-cols-3 gap-8 mt-12">
                <div className="text-center">
                  <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🎨</span>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">Masterful Craftsmanship</h3>
                  <p className="text-gray-600 text-sm">Each piece is meticulously crafted by skilled Indian artisans with decades of experience</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">✨</span>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">Divine Essence</h3>
                  <p className="text-gray-600 text-sm">Every creation radiates a serene and blissful aura, perfect for sacred spaces</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🏛️</span>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">Timeless Heritage</h3>
                  <p className="text-gray-600 text-sm">Preserving ancient traditions while creating modern spiritual masterpieces</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductList;