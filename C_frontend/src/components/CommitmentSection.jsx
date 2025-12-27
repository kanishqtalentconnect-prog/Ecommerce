import React from 'react';

const CommitmentSection = () => {
  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 py-16 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Left Content */}
          <div className="space-y-6">
            <h2 className="text-4xl font-bold text-gray-800 leading-tight">
              Our Commitment
            </h2>
            <p className="text-gray-600 leading-relaxed text-lg">
              For over 25 years, we have been dedicated to preserving the ancient art of brass 
              craftsmanship. Each piece is handcrafted with reverence and precision, ensuring 
              that the spiritual essence of our artifacts remains intact.
            </p>
            <button className="inline-flex items-center text-amber-600 hover:text-amber-700 font-medium transition-colors duration-200">
              Learn More 
              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Right Stats Grid */}
          <div className="grid grid-cols-2 gap-8">
            <div className="text-center">
              <div className="text-5xl font-bold text-amber-600 mb-2">6000+</div>
              <div className="text-gray-600 text-sm uppercase tracking-wide">Unique Pieces</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-amber-600 mb-2">100%</div>
              <div className="text-gray-600 text-sm uppercase tracking-wide">Authentic Materials</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-amber-600 mb-2">25+</div>
              <div className="text-gray-600 text-sm uppercase tracking-wide">Years of Excellence</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-amber-600 mb-2">1000+</div>
              <div className="text-gray-600 text-sm uppercase tracking-wide">Happy Customers</div>
            </div>
          </div>
        </div>

        {/* Bottom Services Section */}
        <div className="bg-white bg-opacity-60 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Free Shipping */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-amber-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Free India-wide Shipping</h3>
              <p className="text-gray-600 text-sm">On orders above ₹2999</p>
            </div>

            {/* Same Day Delivery */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-amber-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Same-Day Delhi NCR Delivery</h3>
              <p className="text-gray-600 text-sm">For ready items</p>
            </div>

            {/* Physical Showroom */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-amber-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Physical Showroom Experience</h3>
              <p className="text-gray-600 text-sm">Visit our store in Delhi</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommitmentSection;