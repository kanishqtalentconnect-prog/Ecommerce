// AuthContext.jsx
import { createContext, useState, useContext, useEffect } from 'react';
//import axios from 'axios';
import axiosInstance from "../lib/axios.js";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in on component mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await axiosInstance.get(
          `${import.meta.env.VITE_API_URL}/api/auth/profile`,
          { withCredentials: true }
        );
        setUser(response.data);
      } catch (error) {
        console.log("Not authenticated");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await axiosInstance.post(
        `${import.meta.env.VITE_API_URL}/api/auth/login`, 
        credentials, 
        { withCredentials: true }
      );
      
      setUser(response.data);
      return response.data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await axiosInstance.post(
        `${import.meta.env.VITE_API_URL}/api/auth/logout`,
        {},
        { withCredentials: true }
      );
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      setUser, 
      loading, 
      login,
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};