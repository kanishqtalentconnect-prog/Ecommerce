import React from "react";
import { useNavigate } from "react-router-dom";

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
];

const largeGods = [
  { name: "Murugan", image: "/images/murugan.jpg" },
  { name: "Ayyappan", image: "/images/ayyappan.jpg" },
  { name: "Kaal Bhairav", image: "/images/kaal_bhairav.jpg" },
];

function DivineGods() {
  const navigate = useNavigate();

  const handleClick = (name) => {
    navigate(`/deity/${encodeURIComponent(name)}`);
  };

  return (
    <div className="max-w-6xl mx-auto mt-4">
      <h2 className="text-3xl font-semibold ml-11 mb-10">DIVINE GODS</h2>

      {/* Small Icons in a Single Row */}
      <div className="flex flex-wrap justify-center gap-2 mt-2 overflow-x-auto px-4">
        {divineGods.map((god, index) => (
          <div
            key={index}
            className="flex flex-col items-center transition-transform duration-300 transform hover:scale-110 cursor-pointer"
            onClick={() => handleClick(god.name)}
          >
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-2 border-gray-300 hover:border-4 hover:border-gray-500 transition-all duration-300">
              <img
                src={god.image}
                alt={god.name}
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-sm md:text-base mt-2">{god.name}</p>
          </div>
        ))}
      </div>

      {/* Large Icons */}
      <div className="flex flex-wrap justify-center gap-10 mt-8">
        {largeGods.map((god, index) => (
          <div
            key={index}
            className="flex flex-col items-center transition-transform duration-300 transform hover:scale-110 cursor-pointer"
            onClick={() => handleClick(god.name)}
          >
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-2 border-gray-400 hover:border-4 hover:border-gray-600 transition-all duration-300">
              <img
                src={god.image}
                alt={god.name}
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-lg font-medium mt-2">{god.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DivineGods;
