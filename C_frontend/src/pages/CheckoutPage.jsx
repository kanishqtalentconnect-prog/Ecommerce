import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../context/AuthContext";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  // Form states
  const [email, setEmail] = useState('');
  const [emailNewsOffer, setEmailNewsOffer] = useState(false);
  const [textNewsOffer, setTextNewsOffer] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState('ship');
  
  // Shipping address states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [company, setCompany] = useState('');
  const [street, setStreet] = useState('');
  const [apartment, setApartment] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('India');
  const [state, setState] = useState('Maharashtra');
  const [zipcode, setZipcode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  
  // Pickup information
  const [fullName, setFullName] = useState('');
  const [pickupPhoneNumber, setPickupPhoneNumber] = useState('');
  
  // Cart and order states
  const [cartItems, setCartItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddNewAddress, setShowAddNewAddress] = useState(true);
  
  // Coupon states
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [finalAmount, setFinalAmount] = useState(0);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [showAvailableCoupons, setShowAvailableCoupons] = useState(false);
  
  // Form validation
  const [formErrors, setFormErrors] = useState({});
  const [processingOrder, setProcessingOrder] = useState(false);
  
  // Fetch email
  useEffect(() => {
  if (!authLoading && user?.email && !email) {
    setEmail(user.email);
  }
}, [authLoading, user]);

  useEffect(() => {
  const savedEmail = localStorage.getItem("checkoutEmail");
  if (savedEmail && !email) {
    setEmail(savedEmail);
  }
}, []);

  useEffect(() => {
  if (email) {
    localStorage.setItem("checkoutEmail", email);
  }
}, [email]);

  // Store location details
  const storeLocation = {
    name: "BudhShiv Lajpat Nagar I Lajpat Nagar",
    address: "BudhShiv Lajpat Nagar I Lajpat Nagar, E 35 basement, New Delhi DL",
    distance: "1,145.1 km",
    availability: "Usually ready in 2-4 days",
    isFree: true
  };

  // Fetch cart
  const fetchCartItems = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/cart`, { 
        withCredentials: true 
      });
      
      if (response.status === 200) {
        setCartItems(response.data);
        const total = calculateTotalAmount(response.data);
        setTotalAmount(total);
        setFinalAmount(total); // Initialize final amount
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      setError("Failed to load cart items. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch saved addresses
  const fetchAddresses = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/addresses`, {
        withCredentials: true
      });
      
      if (response.status === 200) {
        setAddresses(response.data);
        // Set default address if available
        const defaultAddress = response.data.find(addr => addr.isDefault);
        if (defaultAddress) {
          setSelectedAddress(defaultAddress._id);
          setShowAddNewAddress(false);
        }
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
    }
  };

  // Fetch available coupons
  const fetchAvailableCoupons = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/coupons/available`, {
        withCredentials: true
      });
      
      if (response.status === 200) {
        setAvailableCoupons(response.data.coupons || []);
      }
    } catch (error) {
      console.error("Error fetching available coupons:", error);
    }
  };

  // Calculate total amount
  function calculateTotalAmount(items) {
    if (!items || !Array.isArray(items) || items.length === 0) {
      return 0;
    }
    
    return items.reduce((total, item) => {
      if (!item || !item.product) {
        return total;
      }
      return total + (item.product.price * item.quantity);
    }, 0);
  }

  // Validate coupon
  const validateCouponCode = async (code) => {
    if (!code.trim()) {
      setCouponError('Please enter a coupon code');
      return false;
    }

    setCouponLoading(true);
    setCouponError('');
    setCouponSuccess('');

    try {
      const productIds = cartItems.map(item => item.product._id);
      
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/coupons/validate`,
        {
          code: code.trim(),
          orderAmount: totalAmount,
          productIds: productIds
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        const { coupon, discountAmount: discount, finalAmount: final, savings } = response.data;
        
        setAppliedCoupon(coupon);
        setDiscountAmount(discount);
        setFinalAmount(final);
        setCouponSuccess(`Coupon applied successfully! You saved ₹${savings.toFixed(2)}`);
        
        return true;
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Invalid coupon code';
      setCouponError(errorMessage);
    } finally {
      setCouponLoading(false);
    }
    
    return false;
  };

  // Apply coupon
  const handleApplyCoupon = async () => {
    const isValid = await validateCouponCode(couponCode);
    if (!isValid) {
      return;
    }
  };

  // Remove coupon
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setFinalAmount(totalAmount);
    setCouponCode('');
    setCouponError('');
    setCouponSuccess('');
  };

  // Apply available coupon
  const handleApplyAvailableCoupon = async (code) => {
    setCouponCode(code);
    const isValid = await validateCouponCode(code);
    if (isValid) {
      setShowAvailableCoupons(false);
    }
  };

  useEffect(() => {
    fetchCartItems();
    fetchAddresses();
    fetchAvailableCoupons();
  }, []);

  // Update final amount when total amount changes
  useEffect(() => {
    if (!appliedCoupon) {
      setFinalAmount(totalAmount);
    }
  }, [totalAmount, appliedCoupon]);

  // Validate form fields
  const validateForm = () => {
    const errors = {};

    if (deliveryMethod === 'ship') {
      if (showAddNewAddress) {
        // Validate new address
        if (!firstName.trim()) errors.firstName = "First name is required";
        if (!lastName.trim()) errors.lastName = "Last name is required";
        if (!street.trim()) errors.street = "Address is required";
        if (!city.trim()) errors.city = "City is required";
        if (!zipcode.trim()) errors.zipcode = "PIN code is required";
        if (!phoneNumber.trim()) errors.phoneNumber = "Phone number is required";
      } else {
        // Validate selected address
        if (!selectedAddress) errors.selectedAddress = "Please select an address";
      }
    } else if (deliveryMethod === 'pickup') {
      if (!fullName.trim()) errors.fullName = "Full name is required";
      if (!pickupPhoneNumber.trim()) errors.pickupPhoneNumber = "Phone number is required";
    }

    if (!email.trim()) errors.email = "Email is required";
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Save new address
  const saveAddress = async () => {
    try {
      const addressData = {
        fullName: `${firstName} ${lastName}`,
        street: apartment ? `${street}, ${apartment}` : street,
        city,
        state,
        zipcode,
        country,
        phone: phoneNumber,
        isDefault: addresses.length === 0 // Make default if first address
      };

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/addresses`, 
        addressData,
        { withCredentials: true }
      );

      if (response.status === 201) {
        // Set the newly created address as selected
        setSelectedAddress(response.data._id);
        // Refresh addresses list
        fetchAddresses();
        return response.data._id;
      }
      
      return null;
    } catch (error) {
      console.error("Error saving address:", error);
      setError("Failed to save address. Please try again.");
      return null;
    }
  };

  // Handle order placement
  const handlePlaceOrder = async () => {
    if (!validateForm()) {
      window.scrollTo(0, 0); // Scroll to top to see errors
      return;
    }

    setProcessingOrder(true);
    
    try {
      let addressId = selectedAddress;
      
      // If adding a new address, save it first
      if (deliveryMethod === 'ship' && showAddNewAddress) {
        addressId = await saveAddress();
        if (!addressId) {
          setProcessingOrder(false);
          return;
        }
      }

      // Apply coupon if one is selected
      if (appliedCoupon) {
        try {
          await axios.post(
            `${import.meta.env.VITE_API_URL}/api/coupons/apply`,
            {
              code: appliedCoupon.code,
              orderAmount: totalAmount,
              productIds: cartItems.map(item => item.product._id),
              discountAmount: discountAmount
            },
            { withCredentials: true }
          );
        } catch (couponError) {
          console.error("Error applying coupon:", couponError);
          // Continue with order placement even if coupon application fails
        }
      }

      // Create order
      const orderData = {
        email,
        products: cartItems.map(item => ({
          product: item.product._id,
          quantity: item.quantity,
          price: item.product.price
        })),
        totalAmount: finalAmount, // Use final amount after discount
        originalAmount: totalAmount, // Keep track of original amount
        discountAmount: discountAmount,
        couponCode: appliedCoupon?.code || null,
        shippingAddress: deliveryMethod === 'ship' ? addressId : null,
        deliveryMethod,
        pickupInfo: deliveryMethod === 'pickup' ? {
          fullName,
          phoneNumber: pickupPhoneNumber
        } : null
      };

      // Send request to create order
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/checkout`,
        orderData,
        { withCredentials: true }
      );

      if (response.status === 201) {
        const createdOrderId = response.data.order._id;
        localStorage.removeItem("checkoutEmail");
        // Redirect to payment page with the order ID
        navigate('/payment', { 
          state: { orderId: createdOrderId }
        });
      } else {
        throw new Error('Failed to create order');
      }
    } catch (error) {
      console.error("Error placing order:", error);
      setError("Failed to place order. Please try again.");
    } finally {
      setProcessingOrder(false);
    }
  };

  // Set address as default
  const setAddressAsDefault = async (addressId) => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/addresses/${addressId}/default`,
        {},
        { withCredentials: true }
      );
      fetchAddresses(); // Refresh the addresses list
    } catch (error) {
      console.error("Error setting default address:", error);
    }
  };
  
  // Use a saved address
  const handleAddressSelection = (addressId) => {
    setSelectedAddress(addressId);
  };
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
      {/* Left side - Forms */}
      <div className="md:w-3/5">
        {/* Errors display */}
        {Object.keys(formErrors).length > 0 && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            <h3 className="font-bold mb-2">Please fix the following errors:</h3>
            <ul className="list-disc pl-5">
              {Object.values(formErrors).map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Contact Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Contact</h2>
            
          </div>
          
          <div className="mb-4">
            <input 
              type="email" 
              placeholder="Email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full p-3 border ${formErrors.email ? 'border-red-500' : 'border-gray-300'} rounded`}
            />
            {formErrors.email && <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>}
          </div>
          
          <div className="flex items-center mb-6">
            <input 
              type="checkbox" 
              id="newsletter" 
              checked={emailNewsOffer}
              onChange={() => setEmailNewsOffer(!emailNewsOffer)}
              className="mr-2 h-4 w-4"
            />
            <label htmlFor="newsletter">Email me with news and offers</label>
          </div>
        </div>

        {/* Delivery Section with Radio Button Options */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Delivery</h2>
          
          {/* Always show both radio buttons */}
          <div className="mb-4">
            <div className={`border rounded mb-2 p-4 flex justify-between items-center ${deliveryMethod === 'ship' ? 'bg-blue-50 border-blue-500' : 'border-gray-300'}`}>
              <div className="flex items-center">
                <input 
                  type="radio" 
                  id="ship" 
                  name="delivery" 
                  value="ship"
                  checked={deliveryMethod === 'ship'}
                  onChange={() => setDeliveryMethod('ship')}
                  className="mr-2 h-4 w-4"
                />
                <label htmlFor="ship">Ship</label>
              </div>
              {deliveryMethod === 'ship' && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            
            <div className={`border rounded p-4 flex justify-between items-center ${deliveryMethod === 'pickup' ? 'bg-blue-50 border-blue-500' : 'border-gray-300'}`}>
              <div className="flex items-center">
                <input 
                  type="radio" 
                  id="pickup" 
                  name="delivery" 
                  value="pickup"
                  checked={deliveryMethod === 'pickup'}
                  onChange={() => setDeliveryMethod('pickup')}
                  className="mr-2 h-4 w-4"
                />
                <label htmlFor="pickup">Pickup in store</label>
              </div>
              {deliveryMethod === 'pickup' && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </div>
        </div>

        {/* Show Store Details when Pickup is selected */}
        {deliveryMethod === 'pickup' && (
          <div className="mb-8">
            <h3 className="font-medium mb-4">Store Information</h3>
            <div className="border rounded p-4 mb-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{storeLocation.name} ({storeLocation.distance})</h3>
                  <p className="text-gray-600 text-sm">{storeLocation.address}</p>
                </div>
                <div className="text-right">
                  <span className="font-bold">{storeLocation.isFree ? 'FREE' : 'PAID'}</span>
                  <p className="text-gray-600 text-sm">{storeLocation.availability}</p>
                </div>
              </div>
            </div>
            
            {/* Contact information for pickup */}
            <div className="mb-6">
              <h3 className="font-medium mb-2">Contact Information</h3>
              <div className="mb-4">
                <input 
                  type="text" 
                  placeholder="Full name" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={`w-full p-3 border ${formErrors.fullName ? 'border-red-500' : 'border-gray-300'} rounded mb-4`}
                />
                {formErrors.fullName && <p className="text-red-500 text-sm mt-1">{formErrors.fullName}</p>}
                
                <input 
                  type="tel" 
                  placeholder="Phone number" 
                  value={pickupPhoneNumber}
                  onChange={(e) => setPickupPhoneNumber(e.target.value)}
                  className={`w-full p-3 border ${formErrors.pickupPhoneNumber ? 'border-red-500' : 'border-gray-300'} rounded`}
                />
                {formErrors.pickupPhoneNumber && <p className="text-red-500 text-sm mt-1">{formErrors.pickupPhoneNumber}</p>}
              </div>
              
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="textNews" 
                  checked={textNewsOffer}
                  onChange={() => setTextNewsOffer(!textNewsOffer)}
                  className="mr-2 h-4 w-4"
                />
                <label htmlFor="textNews" className="text-gray-700">Text me with news and offers</label>
              </div>
            </div>
          </div>
        )}

        {/* Shipping Address Section - Only show if delivery method is 'ship' */}
        {deliveryMethod === 'ship' && (
          <div className="mb-8">
            <h3 className="font-medium mb-4">Shipping Address</h3>
            
            {/* Saved Addresses */}
            {addresses.length > 0 && (
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">Saved Addresses</h4>
                  <button 
                    onClick={() => setShowAddNewAddress(!showAddNewAddress)}
                    className="text-blue-600 hover:underline"
                  >
                    {showAddNewAddress ? 'Use a saved address' : 'Add new address'}
                  </button>
                </div>
                
                {!showAddNewAddress && (
                  <div className="space-y-3">
                    {addresses.map((address) => (
                      <div 
                        key={address._id} 
                        className={`border p-3 rounded flex justify-between items-center cursor-pointer ${selectedAddress === address._id ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
                        onClick={() => handleAddressSelection(address._id)}
                      >
                        <div>
                          <p className="font-medium">{address.fullName} {address.isDefault && <span className="text-sm text-blue-600">(Default)</span>}</p>
                          <p className="text-sm text-gray-600">{address.street}, {address.city}, {address.state} {address.zipcode}</p>
                          <p className="text-sm text-gray-600">{address.phone}</p>
                        </div>
                        <div className="flex items-center">
                          <input 
                            type="radio" 
                            checked={selectedAddress === address._id}
                            onChange={() => handleAddressSelection(address._id)}
                            className="mr-2"
                          />
                          {!address.isDefault && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation(); 
                                setAddressAsDefault(address._id);
                              }}
                              className="text-sm text-blue-600 hover:underline"
                            >
                              Set as default
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {/* New Address Form */}
            {showAddNewAddress && (
              <>
                <div className="mb-4">
                  <div className="relative">
                    <select 
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded appearance-none"
                    >
                      <option value="India">India</option>
                      <option value="USA">USA</option>
                      <option value="UK">UK</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <svg className="w-4 h-4 fill-current text-gray-500" viewBox="0 0 20 20">
                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <input 
                      type="text" 
                      placeholder="First name" 
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className={`w-full p-3 border ${formErrors.firstName ? 'border-red-500' : 'border-gray-300'} rounded`}
                    />
                    {formErrors.firstName && <p className="text-red-500 text-sm mt-1">{formErrors.firstName}</p>}
                  </div>
                  <div>
                    <input 
                      type="text" 
                      placeholder="Last name" 
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className={`w-full p-3 border ${formErrors.lastName ? 'border-red-500' : 'border-gray-300'} rounded`}
                    />
                    {formErrors.lastName && <p className="text-red-500 text-sm mt-1">{formErrors.lastName}</p>}
                  </div>
                </div>
                
                <div className="mb-4">
                  <input 
                    type="text" 
                    placeholder="Company (optional)" 
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded"
                  />
                </div>
                
                <div className="mb-4">
                  <input 
                    type="text" 
                    placeholder="Address" 
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className={`w-full p-3 border ${formErrors.street ? 'border-red-500' : 'border-gray-300'} rounded`}
                  />
                  {formErrors.street && <p className="text-red-500 text-sm mt-1">{formErrors.street}</p>}
                </div>
                
                <div className="mb-4">
                  <input 
                    type="text" 
                    placeholder="Apartment, suite, etc. (optional)" 
                    value={apartment}
                    onChange={(e) => setApartment(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <input 
                      type="text" 
                      placeholder="City" 
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className={`w-full p-3 border ${formErrors.city ? 'border-red-500' : 'border-gray-300'} rounded`}
                    />
                    {formErrors.city && <p className="text-red-500 text-sm mt-1">{formErrors.city}</p>}
                  </div>
                  <div className="relative">
                    <select 
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded appearance-none"
                    >
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Delhi">Delhi</option>
                      <option value="Karnataka">Karnataka</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <svg className="w-4 h-4 fill-current text-gray-500" viewBox="0 0 20 20">
                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <input 
                      type="text" 
                      placeholder="PIN code" 
                      value={zipcode}
                      onChange={(e) => setZipcode(e.target.value)}
                      className={`w-full p-3 border ${formErrors.zipcode ? 'border-red-500' : 'border-gray-300'} rounded`}
                    />
                    {formErrors.zipcode && <p className="text-red-500 text-sm mt-1">{formErrors.zipcode}</p>}
                  </div>
                </div>
                
                {/* Phone Number Field */}
                <div className="mb-4">
                  <input 
                    type="tel" 
                    placeholder="Phone number" 
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className={`w-full p-3 border ${formErrors.phoneNumber ? 'border-red-500' : 'border-gray-300'} rounded`}
                  />
                  {formErrors.phoneNumber && <p className="text-red-500 text-sm mt-1">{formErrors.phoneNumber}</p>}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Right side - Cart Summary */}
      <div className="md:w-2/5 bg-gray-50 p-6 rounded-lg">
        <div>
          {/* Loading State */}
          {loading && (
            <div className="text-center py-4">
              <p>Loading your cart...</p>
            </div>
          )}
          
          {/* Error State */}
          {error && !loading && (
            <div className="text-center py-4 text-red-500">
              <p>{error}</p>
              <button 
                onClick={fetchCartItems} 
                className="mt-2 text-blue-500 underline"
              >
                Try again
              </button>
            </div>
          )}
          
          {/* Empty Cart State */}
          {!loading && !error && cartItems.length === 0 && (
            <div className="text-center py-4">
              <p>Your cart is empty </p>
              <button 
                onClick={() => navigate('/cart')} 
                className="mt-2 text-blue-500 underline"
              >
                Go to cart
              </button>
            </div>
          )}
          
          {/* Cart Items */}
          {!loading && !error && cartItems.length > 0 && (
            <>
              {cartItems.map((item, index) => (
                <div key={index} className="flex items-center mb-6">
                  <div className="h-16 w-16 bg-gray-200 rounded mr-4 relative">
                    <img 
                      src={item.product.image} 
                      alt={item.product.name} 
                      className="h-full w-full object-cover rounded"
                    />
                    <span className="absolute -top-2 -right-2 bg-gray-500 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{item.product.name}</h3>
                    <p className="text-gray-700">₹{item.product.price.toFixed(2)}</p>
                  </div>
                </div>
              ))}

              {/* Coupon Section */}
              <div className="border-t border-gray-200 pt-4 mb-4">
                <div className="mb-4">
                  <h3 className="font-medium mb-2">Discount code</h3>
                  
                  {/* Applied Coupon Display */}
                  {appliedCoupon && (
                    <div className="bg-green-50 border border-green-200 p-3 rounded mb-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-medium text-green-700">{appliedCoupon.code}</span>
                          <p className="text-sm text-green-600">{couponSuccess}</p>
                        </div>
                        <button 
                          onClick={handleRemoveCoupon}
                          className="text-red-500 hover:text-red-700"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Coupon Input - Only show if no coupon is applied */}
                  {!appliedCoupon && (
                    <>
                      <div className="flex gap-2 mb-2">
                        <input 
                          type="text" 
                          placeholder="Enter coupon code"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          className="flex-1 p-3 border border-gray-300 rounded"
                          disabled={couponLoading}
                        />
                        <button 
                          onClick={handleApplyCoupon}
                          disabled={couponLoading || !couponCode.trim()}
                          className="bg-gray-200 hover:bg-gray-300 px-4 py-3 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {couponLoading ? 'Applying...' : 'Apply'}
                        </button>
                      </div>

                      {/* Coupon Error/Success Messages */}
                      {couponError && (
                        <p className="text-red-500 text-sm mb-2">{couponError}</p>
                      )}

                      {/* Available Coupons Toggle */}
                      {availableCoupons.length > 0 && (
                        <button 
                          onClick={() => setShowAvailableCoupons(!showAvailableCoupons)}
                          className="text-blue-600 hover:underline text-sm mb-2"
                        >
                          {showAvailableCoupons ? 'Hide' : 'Show'} available coupons ({availableCoupons.length})
                        </button>
                      )}

                      {/* Available Coupons List */}
                      {showAvailableCoupons && availableCoupons.length > 0 && (
                        <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-3">
                          <h4 className="font-medium text-sm mb-2">Available Coupons:</h4>
                          <div className="space-y-2">
                            {availableCoupons.map((coupon, index) => (
                              <div key={index} className="flex justify-between items-center bg-white p-2 rounded border">
                                <div>
                                  <span className="font-medium text-sm">{coupon.code}</span>
                                  <p className="text-xs text-gray-600">{coupon.description}</p>
                                  <p className="text-xs text-gray-500">
                                    {coupon.discountType === 'percentage' 
                                      ? `${coupon.discountValue}% off` 
                                      : `₹${coupon.discountValue} off`}
                                    {coupon.minOrderAmount > 0 && ` (Min order: ₹${coupon.minOrderAmount})`}
                                  </p>
                                </div>
                                <button 
                                  onClick={() => handleApplyAvailableCoupon(coupon.code)}
                                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs"
                                  disabled={couponLoading}
                                >
                                  Apply
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </>
          )}
          
          {/* Order Summary */}
          {!loading && !error && cartItems.length > 0 && (
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between mb-2">
                <span>Subtotal</span>
                <span>₹{totalAmount.toFixed(2)}</span>
              </div>
              
              {/* Discount Display */}
              {appliedCoupon && discountAmount > 0 && (
                <div className="flex justify-between mb-2 text-green-600">
                  <span>Discount ({appliedCoupon.code})</span>
                  <span>-₹{discountAmount.toFixed(2)}</span>
                </div>
              )}
              
              <div className="flex justify-between mb-2">
                <div className="flex items-center">
                  <span>Shipping</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-gray-500">
                  {deliveryMethod === 'pickup' ? 'Free' : 'Enter shipping address'}
                </span>
              </div>
              
              <div className="border-t border-gray-200 mt-4 pt-4">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-lg font-medium">Total</span>
                  <div className="text-right">
                    <span className="text-gray-500 text-sm mr-2">INR</span>
                    <span className="text-lg font-medium">₹{finalAmount.toFixed(2)}</span>
                  </div>
                </div>
                
                {/* Place Order Button */}
                <button 
                  onClick={handlePlaceOrder}
                  className="w-full bg-black hover:bg-gray-800 text-white py-3 px-6 rounded font-medium transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading || cartItems.length === 0 || processingOrder}
                >
                  {loading ? 'Loading...' : processingOrder ? 'Processing...' : 'Place Order'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}