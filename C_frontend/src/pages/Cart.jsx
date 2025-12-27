import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useCurrency } from '../context/CurrencyContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Cart = () => {
  const { cart, loading, updateQuantity, removeFromCart, calculateTotalAmount, fetchCartFromServer, syncLocalCartWithServer } = useCart();
  const [totalAmount, setTotalAmount] = useState(0);
  const { currency, formatCurrency } = useCurrency();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [lastUserState, setLastUserState] = useState(null);

  useEffect(() => {
    // Update total amount whenever cart or currency changes
    setTotalAmount(calculateTotalAmount());
  }, [cart, currency, calculateTotalAmount]);

  useEffect(() => {
    // Check if user state has changed (logged in or out)
    if (user !== lastUserState) {
      if (user) {
        // User just logged in - sync local cart with server and refresh
        syncLocalCartWithServer().then(() => {
          // After syncing, fetch the updated cart from the server
          fetchCartFromServer();
        });
      } else {
        // User just logged out - fetch local cart data
        fetchCartFromServer();
      }
      // Update the last known user state
      setLastUserState(user);
    }
  }, [user, lastUserState, syncLocalCartWithServer, fetchCartFromServer]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) return; // Prevent 0 or negative quantities
    updateQuantity(productId, newQuantity);
  };

  const handleCheckout = () => {
    // If user is not logged in, redirect to login page
    if (!user) {
      // Save the current URL to redirect back after login
      sessionStorage.setItem('redirectAfterLogin', '/checkout');
      navigate('/login');
    } else {
      navigate('/checkout');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Your cart</h1>
        <NavLink to='/' className="text-lg underline text-gray-700 hover:text-gray-900">Continue shopping</NavLink>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <div className="grid grid-cols-12 gap-4 pb-2">
          <div className="col-span-6 font-medium text-gray-500">PRODUCT</div>
          <div className="col-span-3 text-center font-medium text-gray-500">QUANTITY</div>
          <div className="col-span-3 text-right font-medium text-gray-500">TOTAL</div>
        </div>
        {
          cart.length > 0 ? cart.map((item, i) => (
            <div key={i} className="border-t border-gray-200 py-6">
              <div className="grid grid-cols-12 gap-4 items-center">
                <div className="col-span-6 flex items-center gap-6">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-32 h-32 object-cover"
                  />
                  <div>
                    <h3 className="font-medium text-lg">{item.product.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-gray-700">{formatCurrency(item.product.price, currency)}</p>
                      <span className="text-xs text-gray-500">
                        (₹{item.product.price})
                      </span>
                    </div>
                  </div>
                </div>

                <div className="col-span-3 flex justify-center">
                  <div className="flex border border-gray-300 rounded-md">
                    <button 
                      className="px-3 py-1 text-xl" 
                      onClick={() => handleQuantityChange(item.product._id, item.quantity - 1)}
                    >−</button>
                    <input
                      type="text"
                      value={item.quantity}
                      className="w-12 text-center border-l border-r border-gray-300"
                      readOnly
                    />
                    <button 
                      className="px-3 py-1 text-xl"
                      onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)}
                    >+</button>
                  </div>
                  <button 
                    className="ml-2 text-gray-500 hover:text-gray-700" 
                    onClick={() => removeFromCart(item.product._id)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 hover:text-red-500">
                      <path d="M3 6h18"></path>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>

                <div className="col-span-3 text-right">
                  <div className="font-medium">{formatCurrency(item.product.price * item.quantity, currency)}</div>
                  <div className="text-xs text-gray-500">₹{item.product.price * item.quantity}</div>
                </div>
              </div>
            </div>
          )
          ) : (
            <div className="text-center py-8">
              <p className="text-xl text-gray-500">Your cart is empty</p>
              <NavLink to="/" className="inline-block mt-4 px-6 py-2 bg-black text-white hover:bg-gray-800 transition-colors">
                Start Shopping
              </NavLink>
            </div>
          )
        }
      </div>

      {cart.length > 0 && (
        <div className="border-t border-gray-200 mt-8 pt-6">
          <div className="flex flex-col items-end">
            <div className="text-right mb-4">
              <div className="flex justify-end items-center gap-2 text-lg">
                <span className="font-medium">Estimated total:</span>
                <span className="font-medium">{formatCurrency(totalAmount, currency)}</span>
                <span className="text-sm text-gray-500">(₹{totalAmount})</span>
              </div>
            </div>

            <button
              className="bg-black text-white py-3 px-8 font-medium hover:bg-gray-800 transition-colors duration-300"
              onClick={handleCheckout}
            >
              {user ? 'Proceed to Checkout' : 'Login to Checkout'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;