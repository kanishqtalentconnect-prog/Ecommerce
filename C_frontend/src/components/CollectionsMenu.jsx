import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../lib/axios';
import bell from '../assets/brassbell.webp';
import uril from '../assets/Brassuril.webp';
import brassp from '../assets/brassp.webp';
import show from '../assets/show.webp';
import diya from '../assets/diya.webp';
import kalpavrisk from '../assets/Kalpavrisk.webp';
import box from '../assets/box.webp';
import shank from '../assets/shank.webp';

const CollectionsMenu = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Hardcoded categories with imported images
    setCategories([
      { name: 'Brass Bells', slug: 'brass-bells', image: bell },
      { name: 'Brass Diyas and Lamps', slug: 'lamps', image: diya },
      { name: 'Brass Prabhavalis', slug: 'brass-prabhavalis', image: brassp },
      { name: 'Brass Shankh', slug: 'brass-shankh', image: shank },
      { name: 'Brass Urli', slug: 'brass-urli', image: uril },
      { name: 'Brass Show Pieces', slug: 'brass-showpieces', image: show },
      { name: 'Brass Kalpavrisk', slug: 'brass-kalpavrisk', image: kalpavrisk },
      { name: 'Brass Treasure Box', slug: 'brass-treasure-boxes', image: box }
    ]);
    setLoading(false);
  }, []);

  const handleCategoryClick = (category) => {
    navigate(`/${category.slug}`);
  };

  if (loading) {
    return (
      <div id="collections-menu" className="p-5">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-serif text-gray-800 mb-8 text-left ml-11">
            Our Collections
          </h1>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-4 mb-8">
            {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square bg-gray-200 rounded-lg mb-2"></div>
                <div className="p-3 bg-white rounded-b-lg">
                  <div className="bg-gray-200 rounded h-4 w-3/4 mx-auto"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="collections-menu" className="p-5">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-serif text-gray-800 mb-8 text-left ml-11">
          Our Collections
        </h1>

        {/* Collections Grid - Show all categories */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-4 mb-8">
          {categories.map((category, index) => (
            <div
              key={category.slug || index}
              className="relative cursor-pointer group overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
              onClick={() => handleCategoryClick(category)}
            >
              <div className="aspect-square bg-gradient-to-br from-amber-100 to-yellow-100 relative overflow-hidden">
                {category.image ? (
                  <img 
                    src={category.image} 
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      // Fallback to icon if image fails to load
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                {/* Fallback icon (shown when no image or image fails to load) */}
                <div 
                  className={`w-full h-full flex items-center justify-center ${category.image ? 'hidden' : 'flex'}`}
                  style={{ display: category.image ? 'none' : 'flex' }}
                >
                  <div className="w-16 h-16 bg-amber-600 rounded-full flex items-center justify-center text-white font-bold text-2xl group-hover:scale-110 transition-transform duration-300">
                    {category.name.charAt(0)}
                  </div>
                </div>
                {/* Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="text-center text-white">
                    <h3 className="font-semibold text-lg mb-1">{category.name}</h3>
                    <p className="text-sm opacity-90">View Collection</p>
                  </div>
                </div>
              </div>
              {/* Collection Name Below */}
              <div className="p-3 bg-white">
                <h3 className="font-medium text-gray-800 text-center text-sm">
                  {category.name}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CollectionsMenu;