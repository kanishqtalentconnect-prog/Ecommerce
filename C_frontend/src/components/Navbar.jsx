import React, { useState, useEffect } from "react";
import {
  Search,
  User,
  ShoppingBag,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  X,
  LogOut,
  MapPin
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import DropdownMenu from "./DropdownMenu1";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../lib/axios.js";
import { useCurrency } from '../context/CurrencyContext';
import Flag from 'react-world-flags';


const Navbar = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [headerMessages, setHeaderMessages] = useState([]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const { user, logout} = useAuth();

 
  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);
const { currency, setCurrency, loading } = useCurrency();

  
  // Fetch categories from database
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get("/api/category");
        if (response.data.success) {
          setCategories(response.data.categories);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Fetch active header messages
  useEffect(() => {
    const fetchHeaderMessages = async () => {
      try {
        const response = await axiosInstance.get("/api/header-messages/active");
        if (response.data.success && response.data.messages.length > 0) {
          setHeaderMessages(response.data.messages);
        } else {
          setHeaderMessages([{
            message: "SAME DAY DELIVERY IN DELHI NCR FOR ITEMS WHICH ARE READY.",
            type: "announcement"
          }]);
        }
      } catch (error) {
        console.error("Error fetching header messages:", error);
        setHeaderMessages([{
          message: "SAME DAY DELIVERY IN DELHI NCR FOR ITEMS WHICH ARE READY.",
          type: "announcement"
        }]);
      }
    };

    fetchHeaderMessages();
    const interval = setInterval(fetchHeaderMessages, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Rotate messages every 5 seconds if multiple messages
  useEffect(() => {
    if (headerMessages.length > 1) {
      const interval = setInterval(() => {
        setCurrentMessageIndex((prevIndex) => 
          (prevIndex + 1) % headerMessages.length
        );
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [headerMessages.length]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?deity=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Handle header message click navigation
  const handleHeaderMessageClick = async (message) => {
    if (!message.discountId) return;
    
    try {
      const discountId = typeof message.discountId === 'object' ? message.discountId._id : message.discountId;
      const response = await axiosInstance.get(`/api/discounts/${discountId}`);
      const discount = response.data.discount;
      
      if (discount.type === 'product' && discount.productId) {
        const productId = typeof discount.productId === 'object' ? discount.productId._id : discount.productId;
        navigate(`/product/${productId}`);
      } else if (discount.type === 'category' && discount.category) {
        const categoryUrl = discount.category.toLowerCase().replace(/\s+/g, '-');
        navigate(`/${categoryUrl}`);
      } else if (discount.type === 'global') {
        navigate('/');
      }
    } catch (error) {
      console.error("Error fetching discount details:", error);
      if (message.type === 'discount') {
        navigate('/');
      }
    }
  };

  // Function to organize categories for navigation
  const organizeCategories = () => {
    if (categoriesLoading || !categories.length) return { directCategories: [], groupedCategories: {} };
    
    const directCategories = [];
    const groupedCategories = {};
    
    categories.forEach(category => {
      if (category.title) {
        if (!groupedCategories[category.title]) {
          groupedCategories[category.title] = [];
        }
        groupedCategories[category.title].push({
          title: category.name,
          path: `/${category.slug}`
        });
      } else {
        directCategories.push({
          name: category.name,
          slug: category.slug,
          path: `/${category.slug}`
        });
      }
    });
    
    return { directCategories, groupedCategories };
  };

  const { directCategories, groupedCategories } = organizeCategories();
  const currentMessage = headerMessages[currentMessageIndex] || headerMessages[0];
  const isDiscountMessage = currentMessage?.type === 'discount' && currentMessage?.discountId;

  return (
    <>
      <div className="w-full fixed top-0 left-0 bg-white z-50 shadow-sm">
        {/* Top Header Bar - Announcement */}
        <div className="bg-amber-700 text-white py-2 px-4 flex items-center justify-between text-sm">
          <button 
            onClick={() => setCurrentMessageIndex((prev) => 
              prev === 0 ? headerMessages.length - 1 : prev - 1
            )}
            className={`transition-opacity ${headerMessages.length > 1 ? 'opacity-100 hover:opacity-70' : 'opacity-30'}`}
            disabled={headerMessages.length <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          
          <div className="flex-1 text-center">
            <p 
              className={`font-medium tracking-wide ${
                isDiscountMessage 
                  ? 'hover:underline cursor-pointer' 
                  : ''
              }`}
              onClick={() => isDiscountMessage ? handleHeaderMessageClick(currentMessage) : null}
            >
              {currentMessage?.message || "SAME DAY DELIVERY IN DELHI NCR FOR ITEMS WHICH ARE READY."}
            </p>
          </div>
          
          <button 
            onClick={() => setCurrentMessageIndex((prev) => 
              (prev + 1) % headerMessages.length
            )}
            className={`transition-opacity ${headerMessages.length > 1 ? 'opacity-100 hover:opacity-70' : 'opacity-30'}`}
            disabled={headerMessages.length <= 1}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          
          <button className="ml-2 hover:text-gray-200">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Main Header */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between py-4">
              {/* Logo Section */}
              <div className="flex items-center">
                <Link to="/" className="flex items-center">
                  <div className="text-amber-600">
                    <h1 className="text-2xl font-bold">UtsaviCraft</h1>
                  </div>
                </Link>
                
                {/* Address Section */}
                <div className="ml-8 flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-1" />
                  <div>
                    <span className="text-xs text-gray-500">Address</span>
                    <button className="block text-sm font-medium hover:text-amber-600">
                      Update Address
                    </button>
                  </div>
                </div>
              </div>

              {/* Search Bar */}
              <div className="flex-1 max-w-2xl mx-8">
                <form onSubmit={handleSearch} className="relative">
                  <input
                    type="text"
                    placeholder="Search for idols, decor items..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                  <button 
                    type="submit" 
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-amber-600"
                  >
                    <Search className="h-5 w-5" />
                  </button>
                </form>
              </div>

              {/* Right Icons */}
              <div className="flex items-center gap-4">
                {/* Currency Selector */}
                <div className="relative">
  <button
    onClick={() => setIsCurrencyDropdownOpen(prev => !prev)}
    className="flex items-center gap-1 text-sm hover:text-amber-600"
  >
    <Flag
      code={{
        INR: 'IN', USD: 'US', EUR: 'DE', GBP: 'GB', AUD: 'AU',
        CAD: 'CA', SGD: 'SG', CNY: 'CN', JPY: 'JP', KRW: 'KR',
        CHF: 'CH', NGN: 'NG', ZAR: 'ZA', EGP: 'EG', BRL: 'BR', NZD: 'NZ',
      }[currency] || 'IN'}
      className="h-4 w-6 rounded"
    />
    <span>{currency}</span>
    <ChevronDown className="h-4 w-4" />
  </button>

  {isCurrencyDropdownOpen && (
    <div className="absolute right-0 mt-2 bg-white border shadow-lg rounded-md z-50 w-48 max-h-64 overflow-y-auto">
      {['INR', 'USD', 'EUR', 'GBP', 'AUD', 'CAD', 'SGD', 'CNY', 'JPY', 'KRW', 'CHF', 'NGN', 'ZAR', 'EGP', 'BRL', 'NZD']
        .map((currCode) => (
          <div
            key={currCode}
            onClick={() => {
              setCurrency(currCode);
              setIsCurrencyDropdownOpen(false);
            }}
            className={`flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer ${
              currCode === currency ? 'bg-blue-50 font-medium' : ''
            }`}
          >
            <Flag
              code={{
                INR: 'IN', USD: 'US', EUR: 'DE', GBP: 'GB', AUD: 'AU',
                CAD: 'CA', SGD: 'SG', CNY: 'CN', JPY: 'JP', KRW: 'KR',
                CHF: 'CH', NGN: 'NG', ZAR: 'ZA', EGP: 'EG', BRL: 'BR', NZD: 'NZ',
              }[currCode] || 'IN'}
              className="w-5 h-4 rounded"
            />
            <span>{currCode}</span>
          </div>
        ))}
    </div>
  )}
</div>


                {/* User Account */}
                {user ? (
                  <div className="flex items-center gap-2">
                    <button 
                      className="flex items-center gap-1 text-sm hover:text-amber-600"
                      onClick={() => navigate("/profile")}
                    >
                      <User className="h-5 w-5" />
                      <span>Account</span>
                    </button>
                    <button 
                      className="text-sm text-red-600 hover:text-red-700"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <button 
                    className="flex items-center gap-1 text-sm hover:text-amber-600"
                    onClick={() => navigate("/login")}
                  >
                    <User className="h-5 w-5" />
                    <span>Sign In</span>
                  </button>
                )}

                {/* Cart */}
                <button 
                  className="flex items-center gap-1 text-sm hover:text-amber-600"
                  onClick={() => navigate("/cart")}
                >
                  <ShoppingBag className="h-5 w-5" />
                  <span>Cart</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="bg-white border-b relative" style={{ zIndex: 40 }}>
          <div className="max-w-7xl mx-auto px-4">
            <ul className="flex items-center gap-8 py-3 text-sm overflow-x-auto">
              {/* Static Navigation Items */}
              <li>
                <Link to="/" className="hover:text-amber-600 font-medium whitespace-nowrap">
                  Home
                </Link>
              </li>
              
              <li>
                <Link to="/our-story" className="hover:text-amber-600 whitespace-nowrap">
                  Our Story
                </Link>
              </li>

              {/* Dynamic Categories */}
              {!categoriesLoading && (
                <>
                  {/* Grouped categories with dropdowns */}
                  {Object.keys(groupedCategories).map((title) => (
                    <li key={title} className="relative">
                      <DropdownMenu 
                        title={title} 
                        items={groupedCategories[title]}
                      />
                    </li>
                  ))}
                  
                  {/* Direct categories */}
                  {directCategories.map((category) => (
                    <li key={category.slug}>
                      <Link 
                        to={category.path} 
                        className="hover:text-amber-600 whitespace-nowrap"
                      >
                        {category.name}
                      </Link>
                    </li>
                  ))}

                  
                </>
              )}

              {/* Loading skeleton */}
              {categoriesLoading && (
                <>
                  {[1,2,3].map(i => (
                    <li key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                    </li>
                  ))}
                </>
              )}

              {/* More Static Items */}
              <li>
                <Link to="/contact" className="hover:text-amber-600 whitespace-nowrap">
                  Contact Us
                </Link>
              </li>
              
              <li>
                <Link to="/visit-our-store" className="hover:text-amber-600 whitespace-nowrap">
                  Visit Our Store
                </Link>
              </li>
              
              {/* Admin Dashboard */}
              {user && user.role === 'admin' && (
                <li>
                  <Link 
                    to="/admin" 
                    className="text-emerald-600 hover:text-emerald-700 font-medium whitespace-nowrap"
                  >
                    Admin Dashboard
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </nav>
      </div>

      {/* Mobile Search Overlay - Only for mobile fallback */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-start justify-center pt-32 md:hidden">
          <div className="bg-white w-full max-w-md mx-4 p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Search Products</h3>
              <button 
                onClick={() => setIsSearchOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleSearch} className="flex items-center">
              <input
                type="text"
                placeholder="Search for idols, decor items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                autoFocus
              />
              <button 
                type="submit" 
                className="ml-2 bg-amber-600 text-white px-4 py-3 rounded-md hover:bg-amber-700"
              >
                <Search className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;