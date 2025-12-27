import React, { useState } from 'react';
import art from '../assets/art.png'; // Adjust the path as necessary

const HeritageSection = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = () => {
    // Handle email submission here
    console.log('Email submitted:', email);
    setEmail('');
  };

  return (
    <>
      {/* Heritage Section */}
      <div className="bg-gray-100 py-20">
        <div className="container mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Content - Our Heritage */}
            <div className="lg:pr-12">
              <h2 className="text-3xl font-light text-gray-800 mb-6 leading-tight">
                Our Heritage
              </h2>
              <p className="text-gray-600 leading-relaxed text-base mb-8 font-light">
                For over seven decades, we have been preserving the ancient art of brass 
                craftsmanship. Each piece is meticulously hand-crafted by skilled artisans, 
                carrying forward a tradition of excellence and devotion.
              </p>
              <button className="inline-flex items-center text-gray-700 hover:text-gray-900 font-normal text-sm transition-colors duration-200">
                Learn More 
                <span className="ml-2 text-xs">›</span>
              </button>
            </div>

            {/* Right Image */}
            <div className="lg:pl-8">
              <div className="rounded-lg overflow-hidden shadow-lg">
                <img 
                  src={art}
                  alt="Skilled artisan crafting brass items in traditional workshop"
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="bg-gray-800 py-16">
        <div className="container mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl font-light text-white mb-4 leading-tight">
            Join Our Sacred Journey
          </h2>
          <p className="text-gray-300 mb-8 font-light">
            Subscribe to receive updates about new collections and special offers
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 bg-transparent border border-gray-600 rounded-none text-white placeholder-gray-400 focus:outline-none focus:border-amber-600 transition-colors duration-200"
            />
            <button
              onClick={handleSubmit}
              className="px-8 py-3 bg-amber-700 hover:bg-amber-800 text-white font-normal rounded-none transition-colors duration-200"
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default HeritageSection;