import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
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
  const { tab } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(tab || "profile");
  const { logout } = useAuth();

  useEffect(() => {
    // A list of valid tabs
    const validTabs = ["profile", "address", "orders", "payment"];
    // If a tab is provided and it's valid, set it as active.
    // Otherwise, default to "profile".
    if (tab && validTabs.includes(tab)) {
      setActiveTab(tab);
    } else {
      // Optionally, navigate to the default tab's URL for consistency
      navigate("/account/profile", { replace: true });
    }
  }, [tab, navigate]);

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
            >
              <Link to={`/account/${item.id}`}>
                {item.icon}
                <span>{item.label}</span>
              </Link>
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
