import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/autoplay";
import { FaStar } from "react-icons/fa";
import { MdVerified } from "react-icons/md";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import googleLogo from "../assets/google-logo.png";

const reviews = [
  {
    id: 1,
    name: "Neha Pandey",
    date: "12 March 2025",
    profilePic: "/images/neha.jpg",
    rating: 5,
    comment: "Received a big surprise! Lord Maa Durga from BudhShiv. Thanks a lot!",
  },
  {
    id: 2,
    name: "S Taneja",
    date: "10 March 2025",
    profilePic: "/images/taneja.jpg",
    rating: 5,
    comment: "Amazing collection. Ordered a Murti to Australia, and it was as expected!",
  },
  {
    id: 3,
    name: "Durga",
    date: "8 March 2025",
    profilePic: "/images/durga.jpg",
    rating: 5,
    comment: "Nice idol, looks so cute...",
  },
  {
    id: 4,
    name: "Suresh Jadhav",
    date: "3 March 2025",
    profilePic: "/images/suresh.jpg",
    rating: 5,
    comment: "BudhShiv is the best idol maker with excellent craftsmanship!",
  },
  {
    id: 5,
    name: "Amit Kumar",
    date: "5 March 2025",
    profilePic: "/images/amit.jpg",
    rating: 5,
    comment: "Highly recommended! The quality is amazing.",
  },
  {
    id: 6,
    name: "Priya Sharma",
    date: "7 March 2025",
    profilePic: "/images/priya.jpg",
    rating: 5,
    comment: "The best experience shopping with BudhShiv!",
  },
  {
    id: 7,
    name: "Sourav Rakshit",
    date: "8 January 2025",
    profilePic: "/images/sourav.jpg",
    rating: 5,
    comment: "Excellent craftsmanship and quality! The brass idol I purchased from BudhShiv exceeded my expectations....",
  },
  {
    id: 8,
    name: "Meenakshi Govindar...",
    date: "26 December 2024",
    profilePic: "/images/meenakshi.jpg",
    rating: 5,
    comment: "Special thanks to Mr. Arjun Mahajan for going out of the way to ship Natraj Statues to USA 🙏🙏🙏. This help means ...",
  },
  {
    id: 9,
    name: "Richa Rathor",
    date: "25 December 2024",
    profilePic: "/images/richa.jpg",
    rating: 5,
    comment: "First time purchase from BudhShiv, got the exact idol which I was looking for, very nicely packed, and very elegant",
  },
  {
    id: 10,
    name: "Subrata Pal",
    date: "20 December 2024",
    profilePic: "",
    rating: 5,
    comment: "Excellent product with very good finished statue.",
  },
];

function CustomerReviewSlider() {
  return (
    <div className="py-10 bg-white relative  mx-auto">
      <h2 className="text-lg font-medium text-center mb-6 ">
        Trusted by Lakhs of customers worldwide. Google verified reviews below
      </h2>

      {/* Custom Navigation Buttons */}
      <button
        className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white p-2 rounded-full shadow-lg"
        id="prev-slide"
      >
        <IoChevronBack size={24} />
      </button>
      <button
        className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white p-2 rounded-full shadow-lg"
        id="next-slide"
      >
        <IoChevronForward size={24} />
      </button>

      <Swiper
        modules={[Navigation, Autoplay]}
        spaceBetween={0} // Remove gaps between cards
        slidesPerView={3} // Ensure exactly 3 cards are shown
        navigation={{ prevEl: "#prev-slide", nextEl: "#next-slide" }}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        loop
        className="px-6" // Add padding to keep cards aligned with page edges
      >
        {reviews.map((review) => (
          <SwiperSlide key={review.id}>
            <div className="bg-gray-100 p-4 rounded-xl shadow-md w-80 h-56 flex flex-col justify-between border border-gray-300 relative">
              {/* Google Logo */}
              <img
                src={googleLogo}
                alt="Google Verified"
                className="w-5 h-5 absolute top-3 right-3"
              />

              {/* User Profile */}
              <div className="flex items-center space-x-3">
                {review.profilePic ? (
                  <img
                    src={review.profilePic}
                    alt={review.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white text-lg font-semibold">
                    {review.name.charAt(0)}
                  </div>
                )}

                <div>
                  <h4 className="font-semibold text-gray-900 text-sm truncate w-32">
                    {review.name}
                  </h4>
                  <p className="text-xs text-gray-500">{review.date}</p>
                </div>
              </div>

              {/* Star Rating + Verified Badge */}
              <div className="flex items-center mt-1">
                {[...Array(review.rating)].map((_, i) => (
                  <FaStar key={i} className="text-yellow-500 text-sm mr-1" />
                ))}
                <MdVerified className="text-blue-500 text-sm ml-1" />
              </div>

              {/* Review Text */}
              <p className="text-gray-800 text-sm leading-relaxed mt-2">
                {review.comment.length > 80
                  ? review.comment.slice(0, 80) + "..."
                  : review.comment}
              </p>

              <p className="text-blue-600 text-xs mt-2 cursor-pointer">Read more</p>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

export default CustomerReviewSlider;