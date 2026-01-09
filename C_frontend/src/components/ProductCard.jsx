import React from "react";
import { useNavigate } from "react-router-dom";
import { useCurrency } from "../context/CurrencyContext";
import { useCart } from "../context/CartContext";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { currency, formatCurrency } = useCurrency();
  const { addToCart, cart } = useCart();

  // Check if product has discount information
  const hasDiscount = product.hasDiscount && product.discountAmount > 0;
  const displayPrice = hasDiscount ? product.finalPrice : product.price;
  const originalPrice = hasDiscount ? product.originalPrice : product.price;

  // Calculate discount percentage for display
  const discountPercentage = hasDiscount 
    ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100)
    : 0;

  const goToProductDetails = () => {
    navigate(`/product/${product._id}`);
  };

  const isInCart = cart.some(
    (item) =>
      item.product?._id === product?._id ||
      item._id === product?._id
  );



  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (isInCart) return;
    // Use the discounted price when adding to cart
    const productForCart = {
      ...product,
      price: displayPrice,
      originalPrice: hasDiscount ? originalPrice : undefined
    };
    addToCart(productForCart, 1);
    alert("Added to cart successfully!");
  };

  return (
    <div
      className="w-[220px] text-center flex-shrink-0 relative first:ml-0 cursor-pointer group"
      onClick={goToProductDetails}
    >
      {/* Discount Badge */}
      {hasDiscount && (
        <span className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded z-10">
          -{discountPercentage}%
        </span>
      )}

      <div className="overflow-hidden rounded-none">
        <img
          src={product.image || "/default.jpg"}
          alt={product.name || "Product"}
          className="w-full h-60 object-cover transition-transform duration-300 group-hover:scale-110"
        />
      </div>

      <h3 className="text-md font-normal mt-2 transition-all duration-300 group-hover:underline">
        {product.name || "No Name"}
      </h3>

      <div className="flex flex-col items-center mt-1">
        <div className="flex items-center justify-center gap-2">
          {hasDiscount && (
            <span className="text-gray-400 text-sm line-through">
              {formatCurrency(originalPrice, currency)}
            </span>
          )}
          <span className={`text-lg font-semibold ${hasDiscount ? 'text-red-600' : ''}`}>
            {formatCurrency(displayPrice, currency)}
          </span>
        </div>

        {/* Discount information */}
        {hasDiscount && product.discount && (
          <div className="text-xs text-green-600 mt-1">
            <span className="font-medium">
              {product.discount.name}
            </span>
            {product.discount.type === 'global' && (
              <div className="text-xs text-blue-600">Site-wide offer!</div>
            )}
          </div>
        )}
      </div>

      <button
        onClick={handleAddToCart}
        disabled={isInCart}
        className={`w-full px-4 py-2 mt-3 rounded-none transition-all duration-300
          ${
            isInCart
              ? "bg-gray-300 text-gray-600 cursor-not-allowed"
              : "border border-black text-black hover:border-2"
          }`}
      >
        {isInCart ? "Added to Cart" : "Add to cart"}
      </button>
    </div>
  );
};

export default ProductCard;