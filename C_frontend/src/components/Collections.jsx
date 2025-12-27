import { useNavigate } from "react-router-dom";

// Individual Gods as collections
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

// Individual Goddesses as collections
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

// All collections combined
const allCollections = [...divineGods, ...divineGoddesses];

function Collections() {
  const navigate = useNavigate();

  const handleCollectionClick = (deity) => {
    // Navigate to individual deity page using your existing route structure
    navigate(`/deity/${encodeURIComponent(deity.name)}`);
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

      {/* Collections Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {allCollections.map((deity, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden"
              onClick={() => handleCollectionClick(deity)}
            >
              {/* Image Container */}
              <div className="relative aspect-square overflow-hidden">
                <img
                  src={deity.image}
                  alt={deity.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="text-center text-white">
                    <p className="text-lg font-semibold mb-2">View Collection</p>
                    <p className="text-sm">{deity.name}</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-semibold text-lg text-gray-800 mb-2 group-hover:text-gray-600 transition-colors text-center">
                  {deity.name}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA Section */}
      <div className="bg-white mt-16">
        <div className="max-w-4xl mx-auto text-center py-16 px-4">
          <h2 className="text-3xl font-serif text-gray-800 mb-4">
            Can't Find What You're Looking For?
          </h2>
          <p className="text-gray-600 text-lg mb-8">
            Get in touch with us for custom orders and special requests
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-black text-white px-8 py-3 rounded hover:bg-gray-800 transition-colors">
              Contact Us
            </button>
            <button className="border border-gray-800 text-gray-800 px-8 py-3 rounded hover:bg-gray-800 hover:text-white transition-colors">
              Custom Orders
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Collections;