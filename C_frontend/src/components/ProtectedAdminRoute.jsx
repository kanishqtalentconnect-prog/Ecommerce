import { Navigate } from 'react-router-dom';
import { useAuth } from "../context/AuthContext";

// This component wraps admin routes to protect them
const ProtectedAdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }
  
  // If user is not logged in or not an admin, redirect to login
  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }
  
  // If user is an admin, render the child routes
  return children;
};

export default ProtectedAdminRoute;