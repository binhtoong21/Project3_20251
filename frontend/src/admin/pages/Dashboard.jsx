import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../shared/context/AuthContext";

export default function Dashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="admin-dashboard">
      <h1>Admin Page</h1>
      <button onClick={handleLogout} className="logout-button-dashboard">
        Logout from Dashboard
      </button>
    </div>
  );
}
