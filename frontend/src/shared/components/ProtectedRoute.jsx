import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (user) {
    // If user is logged in, check their role
    if (user.role === "customer") {
      return children; // Allow access for customers
    } else if (user.role === "admin") {
      // Redirect admins away from customer routes
      return <Navigate to="/admin/dashboard" replace />;
    }
  }

  // If no user, redirect to login page, saving the intended location
  return <Navigate to="/login" state={{ from: location }} replace />;
};

export default ProtectedRoute;
