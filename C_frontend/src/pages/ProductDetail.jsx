import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from "react-router-dom";
import { ShoppingCart, Heart, Truck, Ruler, Heart as HeartIcon, Share, Tag, ZoomIn, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';

const ProductDetail = () => {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeSection, setActiveSection] = useState(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [lensPosition, setLensPosition] = useState({ x: 0, y: 0 });
  const [showZoomModal, setShowZoomModal] = useState(false);
  const imageRef = useRef(null);
  const zoomContainerRef = useRef(null);
  const lensSize = 150; // Made lens slightly bigger for better visibility
  const zoomLevel = 3; // Zoom magnification level - increased for better zoom
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { currency, formatCurrency, convertPrice } = useCurrency();

  let { id } = useParams();
  const [productDetails, setProductDetails] = useState(null);
  const [allProductImages, setAllProductImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/products/${id}`);
        const product = response.data.msg;
        setProductDetails(product);
        
        // Combine main image and additional images
        const allImages = [
          product.image, 
          ...(product.additionalImages || [])
        ].filter(Boolean);
        
        setAllProductImages(allImages);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching products:", error);
        setLoading(false);
      }
    };

    fetchProducts();
  }, [id]);

  // Enhanced zoom functionality
  const handleMouseEnter = () => {
    setIsZoomed(true);
  };

  const handleMouseLeave = () => {
    setIsZoomed(false);
  };

  const handleMouseMove = (e) => {
    if (!imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Calculate lens position (centered on mouse, constrained to image bounds)
    let lensX = mouseX - lensSize / 2;
    let lensY = mouseY - lensSize / 2;
    
    // Constrain lens to image boundaries
    lensX = Math.max(0, Math.min(lensX, rect.width - lensSize));
    lensY = Math.max(0, Math.min(lensY, rect.height - lensSize));
    
    setLensPosition({ x: lensX, y: lensY });
    
    // Calculate zoom position - this is the key fix
    // We need to calculate what portion of the image the lens is showing
    const lensXPercent = ((lensX + lensSize / 2) / rect.width) * 100;
    const lensYPercent = ((lensY + lensSize / 2) / rect.height) * 100;
    
    setZoomPosition({ x: lensXPercent, y: lensYPercent });
  };

  const openZoomModal = () => {
    setShowZoomModal(true);
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  };

  const closeZoomModal = () => {
    setShowZoomModal(false);
    document.body.style.overflow = 'unset'; // Restore scrolling
  };

  // Keyboard navigation for modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (showZoomModal && e.key === 'Escape') {
        closeZoomModal();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset'; // Cleanup on unmount
    };
  }, [showZoomModal]);

  // Check if product has discount
  const hasDiscount = productDetails?.hasDiscount && productDetails?.discountAmount > 0;
  const displayPrice = hasDiscount ? productDetails.finalPrice : productDetails?.price;
  const originalPrice = hasDiscount ? productDetails.originalPrice : productDetails?.price;
  const savings = hasDiscount ? productDetails.discountAmount : 0;
  const discountPercentage = hasDiscount 
    ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100)
    : 0;

  // Convert savings to selected currency
  const convertedSavings = convertPrice(savings);

  const handleAddToCart = () => {
    if (!productDetails) return;
    
    // Add product with discounted price
    const productForCart = {
      ...productDetails,
      price: displayPrice,
      originalPrice: hasDiscount ? originalPrice : undefined
    };
    
    addToCart(productForCart, quantity);
    alert("Added to cart successfully!");
  }

  const buyNow = () => {
    if (!productDetails) return;
    
    const productForCart = {
      ...productDetails,
      price: displayPrice,
      originalPrice: hasDiscount ? originalPrice : undefined
    };
    
    addToCart(productForCart, quantity);
    navigate('/cart');
  }

  const decreaseQuantity = () => {
    setQuantity(Math.max(1, quantity - 1));
  };

  const increaseQuantity = () => {
    setQuantity(quantity + 1);
  };

  const toggleSection = (section) => {
    setActiveSection(activeSection === section ? null : section);
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading product details...</div>;
  }

  if (!productDetails) {
    return <div className="flex justify-center items-center min-h-screen">Product not found</div>;
  }

  return (
    <>
      <div className="max-w-6xl mx-auto p-4 grid md:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <div>
          {/* Discount Badge */}
          {hasDiscount && (
            <div className="mb-4">
              <span className="inline-flex items-center px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                <Tag className="h-4 w-4 mr-1" />
                {discountPercentage}% OFF - Save {formatCurrency(savings, currency)}
              </span>
            </div>
          )}

          {/* Main Display Image with Zoom */}
          <div className="border rounded-lg mb-4 relative overflow-visible group">
            {hasDiscount && (
              <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-lg text-sm font-bold z-10">
                -{discountPercentage}%
              </div>
            )}
            
            {/* Zoom Icon */}
            <button
              onClick={openZoomModal}
              className="absolute top-4 right-4 bg-white bg-opacity-80 hover:bg-opacity-100 p-2 rounded-full shadow-lg z-10 transition-all duration-200"
              title="Click to zoom"
            >
              <ZoomIn className="h-5 w-5 text-gray-700" />
            </button>

            {/* Main Image Container */}
            <div
              className="relative cursor-crosshair select-none overflow-hidden rounded-lg"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onMouseMove={handleMouseMove}
              onClick={openZoomModal}
            >
              <img
                ref={imageRef}
                src={allProductImages[selectedImage]}
                alt={productDetails.name}
                className="w-full h-[500px] object-cover rounded-lg"
                draggable={false}
              />
              
              {/* Zoom Lens - Enhanced visibility */}
              {isZoomed && (
                <div 
                  className="absolute border-4 border-white shadow-xl pointer-events-none z-20"
                  style={{
                    width: `${lensSize}px`,
                    height: `${lensSize}px`,
                    left: `${lensPosition.x}px`,
                    top: `${lensPosition.y}px`,
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.8), 0 0 0 2000px rgba(0, 0, 0, 0.3)'
                  }}
                >
                  {/* Center crosshair */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-4 h-0.5 bg-white opacity-70"></div>
                    <div className="absolute w-0.5 h-4 bg-white opacity-70"></div>
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced Zoom Preview Window (Desktop) - FIXED */}
            {isZoomed && (
              <div className="hidden lg:block absolute top-0 left-full ml-6 z-30">
                <div 
                  ref={zoomContainerRef}
                  className="w-[400px] h-[400px] border-4 border-blue-300 rounded-lg shadow-2xl bg-white overflow-hidden"
                  style={{
                    backgroundImage: `url(${allProductImages[selectedImage]})`,
                    // KEY FIX: Use larger percentage for zoom effect
                    backgroundSize: `${zoomLevel * 100}%`,
                    // Position the background to show the area under the lens
                    backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                    backgroundRepeat: 'no-repeat'
                  }}
                >
                  {/* Zoom window border overlay */}
                  <div className="absolute inset-0 border-2 border-blue-200 rounded-lg pointer-events-none" />
                  
                  {/* Zoom indicator */}
                  <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">
                    {zoomLevel}x Zoom
                  </div>
                </div>
              </div>
            )}

            {/* Mobile Zoom Hint */}
            <div className="lg:hidden absolute bottom-4 left-4 bg-black bg-opacity-60 text-white px-3 py-1 rounded-lg text-sm">
              Tap to zoom
            </div>
          </div>

          {/* Thumbnail Gallery */}
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {allProductImages.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`${productDetails.name} - View ${index + 1}`}
                className={`w-20 h-20 object-cover rounded-lg cursor-pointer transition-all duration-200 flex-shrink-0
                  ${selectedImage === index ? 'border-2 border-blue-500 opacity-100' : 'opacity-70 hover:opacity-100'}`}
                onClick={() => setSelectedImage(index)}
              />
            ))}
          </div>
        </div>

        {/* Product Details */}
        <div>
          <h1 className="text-2xl font-bold mb-4">{productDetails.name}</h1>

          {/* Price Section */}
          <div className="mb-4">
            <div className="flex items-center space-x-4 mb-2">
              {hasDiscount && (
                <span className="text-xl text-gray-500 line-through">
                  {formatCurrency(originalPrice, currency)}
                </span>
              )}
              <span className={`text-3xl font-bold ${hasDiscount ? 'text-red-600' : 'text-green-600'}`}>
                {formatCurrency(displayPrice, currency)}
              </span>
            </div>

            {/* Discount Information */}
            {hasDiscount && productDetails.discount && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-800 font-medium">{productDetails.discount.name}</p>
                    <p className="text-sm text-green-600">
                      {productDetails.discount.type === 'product' && 'Exclusive product discount'}
                      {productDetails.discount.type === 'category' && `Category-wide offer on ${productDetails.discount.category}`}
                      {productDetails.discount.type === 'global' && 'Site-wide special offer!'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-green-800 font-bold">You Save</p>
                    <p className="text-green-600 font-bold">{formatCurrency(savings, currency)}</p>
                  </div>
                </div>
                {productDetails.discount.endDate && (
                  <p className="text-xs text-green-600 mt-2">
                    Offer valid until {new Date(productDetails.discount.endDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Product Description */}
          <p className="text-gray-700 mb-4">{productDetails.description}</p>

          {/* Product Details */}
          <div className="mb-4 space-y-2">
            <div className="flex">
              <span className="w-24 font-medium text-gray-700">Size:</span>
              <span className="text-gray-600">{productDetails.size}</span>
            </div>
            <div className="flex">
              <span className="w-24 font-medium text-gray-700">SKU:</span>
              <span className="text-gray-600">{productDetails.sku}</span>
            </div>
            <div className="flex">
              <span className="w-24 font-medium text-gray-700">Category:</span>
              <span className="text-gray-600">{productDetails.category}</span>
            </div>
          </div>

          {/* Shipping Information */}
          <div className="bg-gray-100 p-4 rounded-lg mb-4">
            <p className="text-sm text-gray-600">
              Free shipping for prepaid orders. Handmade in India with strong packaging and home delivery guaranteed.
            </p>
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center space-x-4 mb-4">
            <span className="font-medium text-gray-700">Quantity:</span>
            <div className="flex items-center border rounded">
              <button
                onClick={decreaseQuantity}
                className="px-4 py-2 hover:bg-gray-100"
              >
                -
              </button>
              <span className="px-4">{quantity}</span>
              <button
                onClick={increaseQuantity}
                className="px-4 py-2 hover:bg-gray-100"
              >
                +
              </button>
            </div>
          </div>

          {/* Total Price Display */}
          {quantity > 1 && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-blue-800 font-medium">Total for {quantity} items:</span>
                <div className="text-right">
                  {hasDiscount && (
                    <div className="text-sm text-gray-500 line-through">
                      {formatCurrency(originalPrice * quantity, currency)}
                    </div>
                  )}
                  <div className={`text-lg font-bold ${hasDiscount ? 'text-red-600' : 'text-blue-800'}`}>
                    {formatCurrency(displayPrice * quantity, currency)}
                  </div>
                  {hasDiscount && (
                    <div className="text-sm text-green-600">
                      Total savings: {formatCurrency(savings * quantity, currency)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-4 mb-6">
            <button
              onClick={buyNow}
              className="flex-1 bg-black text-white py-3 rounded 
              flex items-center justify-center space-x-2 hover:bg-gray-800"
            >
              <span>Buy it now</span>
            </button>
            <button
              className="flex-1 bg-green-600 text-white py-3 rounded 
              flex items-center justify-center space-x-2 hover:bg-green-700"
              onClick={handleAddToCart}
            >
             <ShoppingCart />
               <span>Add to Cart</span>
            </button>
            <button
              className="bg-gray-200 p-3 rounded hover:bg-gray-300"
            >
              <Heart className="text-gray-600" />
            </button>
          </div>

          {/* Additional Information Sections */}
          <div className="border-t">
            {/* Shipping & Returns */}
            <div className="border-b">
              <button
                onClick={() => toggleSection('shipping')}
                className="w-full flex justify-between items-center p-4 hover:bg-gray-100"
              >
                <div className="flex items-center">
                  <Truck className="mr-2" />
                  <span>Shipping & Returns</span>
                </div>
                <span>{activeSection === 'shipping' ? '−' : '+'}</span>
              </button>
              {activeSection === 'shipping' && (
                <div className="p-4 bg-gray-50 text-left">
                  <p className="mb-2">• Free shipping for prepaid orders.</p>
                  <p className="mb-2">• Handmade in India with strong packaging.</p>
                  <p className="mb-2">• Home delivery guaranteed.</p>
                  <p>• Shipping within 2-4 business days.</p>
                </div>
              )}
            </div>

            {/* Dimensions */}
            <div className="border-b">
              <button
                onClick={() => toggleSection('dimensions')}
                className="w-full flex justify-between items-center p-4 hover:bg-gray-100"
              >
                <div className="flex items-center">
                  <Ruler className="mr-2" />
                  <span>Dimensions</span>
                </div>
                <span>{activeSection === 'dimensions' ? '−' : '+'}</span>
              </button>
              {activeSection === 'dimensions' && (
                <div className="p-4 bg-gray-50 text-left">
                  <p>• Size: {productDetails.size}</p>
                </div>
              )}
            </div>

            {/* Care Instructions */}
            <div className="border-b">
              <button
                onClick={() => toggleSection('care')}
                className="w-full flex justify-between items-center p-4 hover:bg-gray-100"
              >
                <div className="flex items-center">
                  <HeartIcon className="mr-2" />
                  <span>Care Instructions</span>
                </div>
                <span>{activeSection === 'care' ? '−' : '+'}</span>
              </button>
              {activeSection === 'care' && (
                <div className="p-4 bg-gray-50 text-left">
                  <p className="mb-2">• Clean with a soft, dry cloth</p>
                  <p className="mb-2">• Avoid direct sunlight</p>
                  <p className="mb-2">• Keep away from moisture</p>
                  <p>• Store in a cool, dry place</p>
                </div>
              )}
            </div>

            {/* Discount Details */}
            {hasDiscount && productDetails.discount && (
              <div className="border-b">
                <button
                  onClick={() => toggleSection('discount')}
                  className="w-full flex justify-between items-center p-4 hover:bg-gray-100"
                >
                  <div className="flex items-center">
                    <Tag className="mr-2" />
                    <span>Discount Details</span>
                  </div>
                  <span>{activeSection === 'discount' ? '−' : '+'}</span>
                </button>
                {activeSection === 'discount' && (
                  <div className="p-4 bg-gray-50 text-left">
                    <div className="space-y-2">
                      <p><strong>Offer:</strong> {productDetails.discount.name}</p>
                      {productDetails.discount.description && (
                        <p><strong>Description:</strong> {productDetails.discount.description}</p>
                      )}
                      <p><strong>Discount:</strong> {productDetails.discount.discountType === 'percentage' ? `${productDetails.discount.value}%` : formatCurrency(productDetails.discount.value, currency)}</p>
                      <p><strong>Type:</strong> {productDetails.discount.type === 'product' ? 'Product Specific' : productDetails.discount.type === 'category' ? 'Category Wide' : 'Site Wide'}</p>
                      {productDetails.discount.endDate && (
                        <p><strong>Valid Until:</strong> {new Date(productDetails.discount.endDate).toLocaleDateString()}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Share */}
            <div>
              <button
                className="w-full flex justify-between items-center p-4 hover:bg-gray-100"
              >
                <div className="flex items-center">
                  <Share className="mr-2" />
                  <span>Share</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Full Screen Zoom Modal */}
      {showZoomModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4"
          onClick={closeZoomModal}
        >
          <div className="relative max-w-screen-xl max-h-screen">
            {/* Close Button */}
            <button
              onClick={closeZoomModal}
              className="absolute top-4 right-4 bg-white bg-opacity-90 hover:bg-opacity-100 p-3 rounded-full z-10 shadow-lg"
            >
              <X className="h-6 w-6 text-gray-700" />
            </button>

            {/* Zoomed Image */}
            <img
              src={allProductImages[selectedImage]}
              alt={productDetails.name}
              className="max-w-full max-h-full object-contain cursor-zoom-out shadow-2xl"
              onClick={closeZoomModal}
            />

            {/* Image Navigation */}
            {allProductImages.length > 1 && (
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3 bg-black bg-opacity-50 px-4 py-2 rounded-full">
                {allProductImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImage(index);
                    }}
                    className={`w-4 h-4 rounded-full transition-all duration-200 ${
                      selectedImage === index ? 'bg-white' : 'bg-white bg-opacity-40 hover:bg-opacity-70'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Image Counter */}
            {allProductImages.length > 1 && (
              <div className="absolute top-4 left-4 bg-black bg-opacity-60 text-white px-3 py-1 rounded-lg text-sm">
                {selectedImage + 1} / {allProductImages.length}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ProductDetail;