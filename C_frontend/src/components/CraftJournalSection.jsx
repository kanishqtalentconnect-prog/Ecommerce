import React, { useState } from 'react';
import budh from '../assets/budh.png'; // Adjust the path as necessary
import ganeshji from '../assets/ganeshji.png'; // Adjust the path as necessary
import devi from '../assets/devi.png'; // Adjust the path as necessary
import ganesh from '../assets/ganesh.jpg'; // Adjust the path as necessary

const CraftJournalSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const journalData = [
    {
      id: 1,
      image: budh,
      category: "Category",
      date: "April 15, 2025",
      title: "The Art of Brass Crafting",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros."
    },
    {
      id: 2,
      image: devi,
      category: "Category",
      date: "March 28, 2025",
      title: "What is the Significance of Navratri?",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros."
    },
    {
      id: 3,
      image: ganeshji,
      category: "Category",
      date: "July 10, 2024",
      title: "Best Brass Diwali Gifting Ideas",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros."
    },
    {
      id: 4,
      image: ganesh,
      category: "Category",
      date: "June 05, 2024",
      title: "Sacred Rituals and Brass Vessels",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros."
    }
  ];

  const itemsPerSlide = 3;
  const totalSlides = Math.ceil(journalData.length / itemsPerSlide);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const getCurrentItems = () => {
    const startIndex = currentSlide * itemsPerSlide;
    return journalData.slice(startIndex, startIndex + itemsPerSlide);
  };

  return (
    <div className="bg-white py-20">
      <div className="container mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-3xl font-light text-gray-800">Craft Journal</h2>
          <button className="px-6 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 font-light text-sm transition-colors duration-200">
            View all
          </button>
        </div>

        {/* Journal Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {getCurrentItems().map((item) => (
            <div key={item.id} className="group cursor-pointer">
              {/* Image */}
              <div className="mb-4 overflow-hidden rounded-lg">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Content */}
              <div className="space-y-3">
                {/* Category and Date */}
                <div className="flex items-center text-sm text-gray-500 space-x-4">
                  <span className="font-light">{item.category}</span>
                  <span className="font-light">{item.date}</span>
                </div>

                {/* Title */}
                <h3 className="text-xl font-normal text-gray-800 group-hover:text-gray-600 transition-colors duration-200">
                  {item.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 font-light text-sm leading-relaxed">
                  {item.description}
                </p>

                {/* Read More Link */}
                <button className="inline-flex items-center text-gray-700 hover:text-gray-900 font-light text-sm transition-colors duration-200">
                  Read more
                  <span className="ml-2 text-xs">›</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Dots */}
        <div className="flex justify-center space-x-2">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                currentSlide === index ? 'bg-gray-800' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        {/* Navigation Arrows (Hidden on mobile, visible on larger screens) */}
        <div className="hidden lg:flex justify-center space-x-4 mt-8">
          <button
            onClick={prevSlide}
            className="w-10 h-10 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors duration-200"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={nextSlide}
            className="w-10 h-10 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors duration-200"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CraftJournalSection;