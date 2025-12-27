import React, { useEffect, useState, useRef } from "react";
import axios from "../lib/axios"; 
import ProductCard from "../components/ProductCard";
import Hero from "../components/Hero";
import ProductList from "../components/ProductList";
import Hero2 from "../components/hero2";
import CollectionsMenu from "../components/CollectionsMenu"; // Add this import
import FeaturedSections from "../components/FeaturedSection";
import CommitmentSection from "../components/CommitmentSection";
import HeritageSection from "../components/HeritageSection";
import FAQSection from "../components/FAQSection";
import CraftJournalSection from "../components/CraftJournalSection"; // Add this import
import ReviewSection from "../components/ReviewSection";

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const sliderRef = useRef(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("/api/products", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setProducts(response.data.products);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  const scrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  return (
    <>
      <Hero></Hero>
      <ProductList></ProductList>
      <Hero2></Hero2>
      
      {/* Add the Collections Menu here */}
      <CollectionsMenu />
      
      {/* Featured Sections */}
      <FeaturedSections />
      
      {/* Add the Commitment Section here */}
      <CommitmentSection />

      {/* Add the Review Section here */}
      <ReviewSection />
      
      {/* Product Slider */}
      
      {/* Add the Heritage Section here */}
      <HeritageSection />
      
      {/* Add the FAQ Section here */}
      <FAQSection />
      
      {/* Add the Craft Journal Section here */}
      <CraftJournalSection /> 
    </>
  );
};

export default HomePage;