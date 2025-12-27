import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";

// Create Context
const CartContext = createContext();

// Provider component
export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const [lastUserState, setLastUserState] = useState(null);

  // Track user state changes to trigger sync actions
  useEffect(() => {
    if (user !== lastUserState) {
      if (user) {
        // User just logged in - trigger sync
        syncLocalCartWithServer();
      } else {
        // User just logged out - load from localStorage
        loadCartFromLocalStorage();
      }
      setLastUserState(user);
    }
  }, [user]);

  // Load initial cart data
  useEffect(() => {
    // If user is logged in, fetch cart from server
    if (user) {
      fetchCartFromServer();
    } else {
      // If not logged in, load cart from localStorage
      loadCartFromLocalStorage();
    }
  }, [user]);

  // Load cart from localStorage
  const loadCartFromLocalStorage = () => {
    try {
      const localCart = localStorage.getItem("cart");
      if (localCart) {
        setCart(JSON.parse(localCart));
      }
    } catch (error) {
      console.error("Error loading cart from localStorage:", error);
      localStorage.removeItem("cart");
      setCart([]);
    }
  };

  // Save cart to localStorage
  const saveCartToLocalStorage = (cartItems) => {
    try {
      localStorage.setItem("cart", JSON.stringify(cartItems));
    } catch (error) {
      console.error("Error saving cart to localStorage:", error);
    }
  };

  // Fetch cart from server
  const fetchCartFromServer = async () => {
    if (!user) {
      loadCartFromLocalStorage();
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/cart`, 
        { withCredentials: true }
      );
      if (response.status === 200) {
        setCart(response.data);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      // If we can't fetch the cart, fall back to local storage
      loadCartFromLocalStorage();
    } finally {
      setLoading(false);
    }
  };

  // Add product to cart
  const addToCart = async (product, quantity = 1) => {
    try {
      if (user) {
        // If logged in, send to server
        setLoading(true);
        await axios.post(
          `${import.meta.env.VITE_API_URL}/api/cart`,
          { productId: product._id, quantity },
          { withCredentials: true }
        );
        // Re-fetch cart from server to keep it in sync
        await fetchCartFromServer();
        setLoading(false);
      } else {
        // If not logged in, add to local cart
        const existingItemIndex = cart.findIndex(
          item => item.product?._id === product._id
        );

        let newCart;
        if (existingItemIndex !== -1) {
          // If product already exists in cart, update quantity
          newCart = [...cart];
          newCart[existingItemIndex].quantity += quantity;
        } else {
          // If product is new, add it to cart
          newCart = [...cart, { product, quantity }];
        }
        
        setCart(newCart);
        saveCartToLocalStorage(newCart);
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      setLoading(false);
    }
  };

  // Update product quantity in cart
  const updateQuantity = async (productId, newQuantity) => {
    try {
      if (user) {
        // If logged in, update on server
        setLoading(true);
        await axios.put(
          `${import.meta.env.VITE_API_URL}/api/cart/${productId}`,
          { quantity: newQuantity },
          { withCredentials: true }
        );
        // Re-fetch cart
        await fetchCartFromServer();
        setLoading(false);
      } else {
        // If not logged in, update local cart
        const newCart = cart.map(item => 
          item.product._id === productId 
            ? { ...item, quantity: Math.max(1, newQuantity) } 
            : item
        );
        
        setCart(newCart);
        saveCartToLocalStorage(newCart);
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      setLoading(false);
    }
  };

  // Remove product from cart
  const removeFromCart = async (productId) => {
    try {
      if (user) {
        // If logged in, remove from server
        setLoading(true);
        await axios.delete(
          `${import.meta.env.VITE_API_URL}/api/cart`,
          {
            data: { productId },
            withCredentials: true
          }
        );
        // Re-fetch cart
        await fetchCartFromServer();
        setLoading(false);
      } else {
        // If not logged in, remove from local cart
        const newCart = cart.filter(item => item.product._id !== productId);
        setCart(newCart);
        saveCartToLocalStorage(newCart);
      }
    } catch (error) {
      console.error("Error removing from cart:", error);
      setLoading(false);
    }
  };

  // Sync local cart with server when user logs in
  const syncLocalCartWithServer = async () => {
    if (!user) return;

    // Get the local cart
    const localCart = JSON.parse(localStorage.getItem("cart") || "[]");
    
    if (localCart.length > 0) {
      setLoading(true);
      try {
        // Add each item to server cart
        for (const item of localCart) {
          await axios.post(
            `${import.meta.env.VITE_API_URL}/api/cart`,
            { 
              productId: item.product._id, 
              quantity: item.quantity 
            },
            { withCredentials: true }
          );
        }
        
        // Clear local storage cart after successful sync
        localStorage.removeItem("cart");
        
        // Fetch updated cart from server
        await fetchCartFromServer();
      } catch (error) {
        console.error("Error syncing cart with server:", error);
      } finally {
        setLoading(false);
      }
    } else {
      // Even if local cart is empty, fetch the server cart
      await fetchCartFromServer();
    }
  };

  // Calculate total items in cart
  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  // Calculate total amount
  const calculateTotalAmount = () => {
    return cart.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);
  };

  return (
    <CartContext.Provider value={{ 
      cart, 
      loading,
      addToCart, 
      updateQuantity, 
      removeFromCart,
      getCartItemCount,
      calculateTotalAmount,
      fetchCartFromServer,
      syncLocalCartWithServer
    }}>
      {children}
    </CartContext.Provider>
  );
};

// Hook to use cart
export const useCart = () => useContext(CartContext);