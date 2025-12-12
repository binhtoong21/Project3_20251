import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./account.css";
import { useAuth } from "../../shared/context/AuthContext";

// Import icons
import {
  FaUser,
  FaMapMarkerAlt,
  FaHistory,
  FaCreditCard,
  FaSignOutAlt,
} from "react-icons/fa";

// Import content components
import UserProfile from "../components/UserProfile";
import ShippingAddress from "../components/ShippingAddress";
import OrderHistory from "../components/OrderHistory";
import PaymentMethods from "../components/PaymentMethods";

export default function Account() {
  const [activeTab, setActiveTab] = useState("profile");
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return <UserProfile />;
      case "address":
        return <ShippingAddress />;
      case "orders":
        return <OrderHistory />;
      case "payment":
        return <PaymentMethods />;
      default:
        return <UserProfile />;
    }
  };

  const sidebarItems = [
    { id: "profile", icon: <FaUser />, label: "User Profile" },
    { id: "address", icon: <FaMapMarkerAlt />, label: "Shipping Address" },
    { id: "orders", icon: <FaHistory />, label: "Order History" },
    { id: "payment", icon: <FaCreditCard />, label: "Payment Methods" },
  ];

  return (
    <div className="account-page">
      <div className="account-sidebar">
        <ul>
          {sidebarItems.map((item) => (
            <li
              key={item.id}
              className={activeTab === item.id ? "active" : ""}
              onClick={() => setActiveTab(item.id)}
            >
              {item.icon}
              <span>{item.label}</span>
            </li>
          ))}
          <li className="logout" onClick={handleLogout}>
            <FaSignOutAlt />
            <span>Logout</span>
          </li>
        </ul>
      </div>
      <div className="account-content">{renderContent()}</div>
    </div>
  );
}
