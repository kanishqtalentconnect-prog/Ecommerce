import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from "../context/AuthContext";

// This component wraps routes that require authentication
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }
  
  // If user is not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // If user is authenticated, render the child routes
  return children;
};

export default ProtectedRoute;