import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Or a spinner component
  }

  if (user) {
    // If a user is logged in, redirect them based on role
    if (user.role === "admin") {
      return <Navigate to="/admin/dashboard" replace />;
    }
    // For customers, redirect to the home page
    return <Navigate to="/" replace />;
  }

  // If no user is logged in, allow access to the public route (e.g., login, register)
  return children;
};

export default PublicRoute;
