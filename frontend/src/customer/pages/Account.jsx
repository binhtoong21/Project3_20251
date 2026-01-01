import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import "./account.css";
import { useAuth } from "../../shared/context/AuthContext";

import {
  FaUser,
  FaMapMarkerAlt,
  FaHistory,
  FaSignOutAlt,
  FaWallet,
  FaBookMedical,
  FaReceipt,
} from "react-icons/fa";

// Import content components
import UserProfile from "../components/UserProfile";
import OrderHistory from "../components/OrderHistory";
import Wallet from "../components/Wallet";
import MyBooks from "../components/MyBooks";
import MySales from "./MySales"; // Import the new component

export default function Account() {
  const { tab } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(tab || "profile");
  const { logout } = useAuth();

  useEffect(() => {
    const validTabs = ["profile", "orders", "wallet", "my-books", "my-sales"];
    if (tab && validTabs.includes(tab)) {
      setActiveTab(tab);
    } else {
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
      case "orders":
        return <OrderHistory />;
      case "wallet":
        return <Wallet />;
      case "my-books":
        return <MyBooks />;
      case "my-sales":
        return <MySales />;
      default:
        return <UserProfile />;
    }
  };

  const sidebarItems = [
    { id: "profile", icon: <FaUser />, label: "Thông tin tài khoản" },
    { id: "wallet", icon: <FaWallet />, label: "Ví của tôi" },
    { id: "my-books", icon: <FaBookMedical />, label: "Gian hàng của tôi" },
    { id: "my-sales", icon: <FaReceipt />, label: "Đơn hàng đã bán" },
    { id: "orders", icon: <FaHistory />, label: "Lịch sử mua hàng" },
  ];

  return (
    <div className="account-page">
      <div className="container">
        <div className="account-sidebar">
          <div className="sidebar-header">
            <h3>Tài khoản</h3>
          </div>
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
              <span>Đăng xuất</span>
            </li>
          </ul>
        </div>

        <div className="account-content">{renderContent()}</div>
      </div>
    </div>
  );
}
