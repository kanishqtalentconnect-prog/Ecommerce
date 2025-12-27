import React from "react";
import hero from "../assets/test.png"

const Hero = () => {
  const scrollToCollections = () => {
    const collectionsSection = document.getElementById('collections-section');
    if (collectionsSection) {
      collectionsSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <div className="relative w-full h-[600px] md:h-[700px]">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${hero})`,
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      >
        {/* Try removing this to debug the black background */}
        {/* <div className="absolute inset-0 bg-black bg-opacity-20"></div> */}

        <div className="absolute inset-0 flex flex-col items-start justify-center text-white px-8 md:px-16 lg:px-20">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
              Timeless God Idols
            </h1>
            <p className="text-lg md:text-xl mb-2 font-medium">
              Handcrafted Excellence Since 1962
            </p>
            <button 
              onClick={scrollToCollections}
              className="mt-6 px-8 py-3 bg-amber-700 hover:bg-amber-800 text-white font-semibold rounded-md transition-colors duration-300 shadow-lg cursor-pointer"
            >
              Explore Collections
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;