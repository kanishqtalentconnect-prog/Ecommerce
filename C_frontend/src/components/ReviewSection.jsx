import React, { useState, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import axios from '../lib/axios';

const ReviewSection = () => {
  const [reviews, setReviews] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentReviews();
  }, []);

  const fetchRecentReviews = async () => {
    try {
      // This would need to be implemented in your backend to get recent reviews across all products
      const response = await axios.get('/api/reviews/recent?limit=6');
      setReviews(response.data.data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      // Fallback to mock data for demonstration
      setReviews(mockReviews);
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === reviews.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? reviews.length - 1 : prevIndex - 1
    );
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  // Mock reviews for demonstration
  const mockReviews = [
    {
      _id: '1',
      user: { name: 'Sarah Johnson' },
      product: { name: 'Handcrafted Leather Wallet', image: '/api/placeholder/100/100' },
      rating: 5,
      comment: 'Absolutely beautiful craftsmanship! The leather quality is exceptional and the attention to detail is remarkable.',
      createdAt: '2024-03-15T10:00:00Z'
    },
    {
      _id: '2',
      user: { name: 'Michael Chen' },
      product: { name: 'Artisan Coffee Mug', image: '/api/placeholder/100/100' },
      rating: 5,
      comment: 'Perfect for my morning coffee ritual. The ceramic work is stunning and it feels great in hand.',
      createdAt: '2024-03-14T14:30:00Z'
    },
    {
      _id: '3',
      user: { name: 'Emma Wilson' },
      product: { name: 'Woven Throw Blanket', image: '/api/placeholder/100/100' },
      rating: 4,
      comment: 'Incredibly soft and warm. The patterns are gorgeous and it adds such character to my living room.',
      createdAt: '2024-03-13T16:45:00Z'
    },
    {
      _id: '4',
      user: { name: 'David Rodriguez' },
      product: { name: 'Handmade Wooden Cutting Board', image: '/api/placeholder/100/100' },
      rating: 5,
      comment: 'Outstanding quality! You can feel the care that went into making this. It\'s both functional and beautiful.',
      createdAt: '2024-03-12T09:15:00Z'
    },
    {
      _id: '5',
      user: { name: 'Lisa Thompson' },
      product: { name: 'Ceramic Dinner Set', image: '/api/placeholder/100/100' },
      rating: 5,
      comment: 'Each piece is unique and beautifully crafted. Our dinner parties have never looked so elegant!',
      createdAt: '2024-03-11T20:00:00Z'
    },
    {
      _id: '6',
      user: { name: 'James Park' },
      product: { name: 'Artisan Jewelry Box', image: '/api/placeholder/100/100' },
      rating: 4,
      comment: 'The intricate details and smooth finish make this a treasured piece. Perfect gift for my wife.',
      createdAt: '2024-03-10T12:30:00Z'
    }
  ];

  const displayReviews = reviews.length > 0 ? reviews : mockReviews;

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading reviews...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            What Our Customers Say
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Real stories from real customers who have experienced the quality and craftsmanship of our handmade products.
          </p>
        </div>

        {/* Reviews Carousel */}
        <div className="relative">
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * (100 / 3)}%)` }}
            >
              {displayReviews.map((review, index) => (
                <div key={review._id} className="w-1/3 flex-shrink-0 px-4">
                  <div className="bg-white rounded-xl shadow-lg p-6 h-full border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                    {/* Quote Icon */}
                    <div className="flex justify-center mb-4">
                      <Quote className="w-8 h-8 text-blue-600 opacity-50" />
                    </div>

                    {/* Rating */}
                    <div className="flex justify-center mb-4">
                      {renderStars(review.rating)}
                    </div>

                    {/* Review Text */}
                    <p className="text-gray-700 text-center mb-6 line-clamp-4 leading-relaxed">
                      "{review.comment}"
                    </p>

                    {/* Product Info */}
                    <div className="flex items-center justify-center mb-4">
                      <img
                        src={review.product?.image || '/api/placeholder/60/60'}
                        alt={review.product?.name}
                        className="w-12 h-12 rounded-lg object-cover mr-3"
                      />
                      <div className="text-center">
                        <p className="font-medium text-gray-900 text-sm">
                          {review.product?.name}
                        </p>
                      </div>
                    </div>

                    {/* Customer Name */}
                    <div className="text-center border-t pt-4">
                      <p className="font-semibold text-gray-900">
                        {review.user?.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        Verified Customer
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-200 z-10"
            aria-label="Previous reviews"
          >
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-200 z-10"
            aria-label="Next reviews"
          >
            <ChevronRight className="w-6 h-6 text-gray-600" />
          </button>

          {/* Dots Indicator */}
          <div className="flex justify-center mt-8 space-x-2">
            {Array.from({ length: Math.ceil(displayReviews.length / 3) }, (_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                  Math.floor(currentIndex / 3) === index
                    ? 'bg-blue-600'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            Join thousands of satisfied customers
          </p>
          <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-300 shadow-md hover:shadow-lg">
            Shop Now
          </button>
        </div>
      </div>
    </section>
  );
};

export default ReviewSection;