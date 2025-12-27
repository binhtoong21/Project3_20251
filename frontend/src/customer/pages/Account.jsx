import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import "./account.css";
import { useAuth } from "../../shared/context/AuthContext";

import {
  FaUser,
  FaMapMarkerAlt,
  FaHistory,
  FaCreditCard,
  FaSignOutAlt,
  FaWallet,
  FaBookMedical,
  FaReceipt,
} from "react-icons/fa";

// Import content components
import UserProfile from "../components/UserProfile";
import ShippingAddress from "../components/ShippingAddress";
import OrderHistory from "../components/OrderHistory";
import PaymentMethods from "../components/PaymentMethods";
import Wallet from "../components/Wallet";
import MyBooks from "../components/MyBooks";
import MySales from "./MySales"; // Import the new component

export default function Account() {
  const { tab } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(tab || "profile");
  const { logout } = useAuth();

  useEffect(() => {
    const validTabs = ["profile", "address", "orders", "payment", "wallet", "my-books", "my-sales"];
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
      case "address":
        return <ShippingAddress />;
      case "orders":
        return <OrderHistory />;
      case "wallet":
        return <Wallet />;
      case "my-books":
        return <MyBooks />;
      case "my-sales":
        return <MySales />;
      case "payment":
        return <div>Payment Methods Content (Đang cập nhật)</div>;
      default:
        return <UserProfile />;
    }
  };

  const sidebarItems = [
    { id: "profile", icon: <FaUser />, label: "Thông tin tài khoản" },
    { id: "wallet", icon: <FaWallet />, label: "Ví của tôi" },
    { id: "my-books", icon: <FaBookMedical />, label: "Sách của tôi (Bán)" },
    { id: "my-sales", icon: <FaReceipt />, label: "Đơn hàng đã bán" },
    { id: "orders", icon: <FaHistory />, label: "Lịch sử mua hàng" },
    { id: "address", icon: <FaMapMarkerAlt />, label: "Địa chỉ giao hàng" },
    { id: "payment", icon: <FaCreditCard />, label: "Phương thức thanh toán" },
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
