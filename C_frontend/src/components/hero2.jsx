import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ganesh from '../assets/ganesh.jpg'; // Make sure the path is correct

const Hero2 = () => {
  const [imageError, setImageError] = useState(false);
  const navigate = useNavigate();

  const handleDiscoverTreasures = () => {
    navigate('/collection/allproduct');
  };

  const handleExploreLegacy = () => {
    const collectionsMenu = document.getElementById('collections-menu');
    if (collectionsMenu) {
      collectionsMenu.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <div className="relative min-h-screen w-full text-white overflow-hidden">
      {/* Background Image */}
      {!imageError && (
        <img
          src={ganesh}
          alt="Ganesha statue collection"
          className="absolute inset-0 w-full h-full object-cover object-center z-0"
          onError={() => setImageError(true)}
          onLoad={() => console.log('Image loaded successfully')}
        />
      )}

      {/* Show dark overlay ONLY if image fails to load */}
      {imageError && (
        <div className="absolute inset-0 bg-black z-0"></div>
      )}

      {/* Foreground Content */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 py-16 lg:py-24 min-h-screen flex items-center">
        <div className="max-w-2xl">
          <h1 className="text-5xl lg:text-6xl xl:text-7xl font-light leading-tight mb-8 text-shadow-lg">
            <span className="block">The Timeless</span>
            <span className="block">Collection</span>
          </h1>

          <div className="flex flex-wrap gap-4 mb-12">
            <button 
              onClick={handleDiscoverTreasures}
              className="bg-white text-black px-8 py-4 text-sm font-medium hover:bg-gray-100 transition-colors duration-300 shadow-lg cursor-pointer"
            >
              Discover Our Treasures
            </button>
            <button 
              onClick={handleExploreLegacy}
              className="border-2 border-white text-white px-8 py-4 text-sm font-medium hover:bg-white hover:text-black transition-all duration-300 cursor-pointer"
            >
              Explore the Legacy
            </button>
          </div>

          <p className="text-white text-base leading-relaxed opacity-90 max-w-lg">
            A curated legacy of handcrafted brass, bronze, and gold artifacts,
            embodying centuries of devotion and artistry.
          </p>
        </div>
      </div>

      {/* Decorative Circles */}
      <div className="absolute top-1/4 right-1/4 w-32 h-32 border border-amber-400 rounded-full opacity-20 z-20"></div>
      <div className="absolute bottom-1/4 right-1/3 w-24 h-24 border border-amber-300 rounded-full opacity-15 z-20"></div>
      <div className="absolute top-1/3 left-1/4 w-16 h-16 border border-yellow-400 rounded-full opacity-10 z-20"></div>
    </div>
  );
};

export default Hero2;