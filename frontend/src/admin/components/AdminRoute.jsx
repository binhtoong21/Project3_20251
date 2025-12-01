import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../shared/context/AuthContext";

const AdminRoute = () => {
  const { userInfo, loading } = useAuth();

  if (loading) {
    // Wait for the auth state to be determined
    return <div>Loading...</div>;
  }

  return userInfo && userInfo.role === "admin" ? (
    <Outlet />
  ) : (
    <Navigate to="/login" replace />
  );
};

export default AdminRoute;
