// import React from "react";
// //import { useProductStore } from "../stores/useProductStore";
// import { useNavigate } from "react-router-dom";

// const divineGods = [
//   { name: "Durga Ma", image: "/images/durgama.jpg" },
//   { name: "Kali Ma", image: "/images/kalima.jpg" },
//   { name: "Lakshmi", image: "/images/lakshmi.jpg" },
//   { name: "saraswati", image: "/images/saraswati.jpg" },
//   { name: "PARVATI", image: "/images/parvati.jpg" },
//   { name: "RAJESHWARI LALITA DEVI", image: "/images/rajeshwari.jpg" },
//   { name: "Varahi Amman", image: "/images/varahi.jpg" },
//   { name: "MARIAMMAN", image: "/images/mariamman.jpg" },
//   { name: "Buddhhist Tara", image: "/images/buddhist.jpg" },
//   { name: "Kaamdhenu Cow", image: "/images/kaamdhenu.jpg" },
// ];


// function DivineGoddesses() {
//   const navigate = useNavigate() ;

//   const handleClick = (name) => {
//     navigate(`/deity/${encodeURIComponent(name)}`);
//   };
  
//   return (
//     <div className="max-w-6xl mx-auto mt-4">
//       <h2 className="text-3xl font-semibold ml-11 mb-10">DIVINE GODDESSES</h2>

//       {/* Small Icons in a Single Row */}
//       <div className="flex flex-wrap justify-center gap-2 mt-2 overflow-x-auto px-4">
//         {divineGods.map((god, index) => (
//           <div
//             key={index}
//             className="flex flex-col items-center transition-transform duration-300 transform hover:scale-110"
//           >
//             <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-2 border-gray-300 hover:border-4 hover:border-gray-500 transition-all duration-300">
//               <img
//                 src={god.image}
//                 alt={god.name}
//                 className="w-full h-full object-cover"
//               />
//             </div>
//             <p className="text-sm md:text-base mt-2 overflow-auto">{god.name}</p>
//           </div>
//         ))}
//       </div>
      
//     </div>
//   );
// }

// export default DivineGoddesses;

import React from "react";
import { useNavigate } from "react-router-dom";

const divineGods = [
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

function DivineGoddesses() {
  const navigate = useNavigate();

  const handleClick = (name) => {
    navigate(`/deity/${encodeURIComponent(name)}`);
  };

  return (
    <div className="max-w-6xl mx-auto mt-4">
      <h2 className="text-3xl font-semibold ml-11 mb-10">DIVINE GODDESSES</h2>

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
            <p className="text-sm md:text-base mt-2 overflow-auto">{god.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DivineGoddesses;
