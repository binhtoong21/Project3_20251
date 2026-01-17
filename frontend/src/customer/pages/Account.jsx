import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import "./account.css";
import { useAuth } from "../../shared/context/AuthContext";
import { useNotificationCounts } from "../../shared/hooks/useNotificationCounts";

import {
  FaUser,
  FaMapMarkerAlt,
  FaHistory,
  FaSignOutAlt,
  FaWallet,
  FaBookMedical,
  FaReceipt,
  FaClipboardList,
  FaStore
} from "react-icons/fa";

// Import content components
import UserProfile from "../components/UserProfile";
import OrderHistory from "../components/OrderHistory";
import Wallet from "../components/Wallet";
import MyBooks from "../components/MyBooks";
import MySales from "./MySales";

export default function Account() {
  const { tab } = useParams(); // Use useParams instead of useLocation
  const { logout } = useAuth();
  const { counts } = useNotificationCounts();
  const navigate = useNavigate();

  // Active tab depends on the URL parameter 'tab'
  const activeTab = tab || "profile"; 

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
      case "books":
        return <MyBooks />;
      case "sales":
        return <MySales />;
      case "wallet":
        return <Wallet />;
      default:
        return <UserProfile />;
    }
  };

  return (
    <div className="account-page">
      <div className="container">
        <div className="account-sidebar">
          <div className="sidebar-header">
            <h3>Tài khoản</h3>
          </div>
          <ul className="account-menu-list">
             <li className={activeTab === "profile" ? "active" : ""}>
                 {/* Link using path parameter */}
                <Link to="/account/profile">
                  <FaUser /> <span>Hồ sơ</span>
                </Link>
              </li>
              <li className={activeTab === "orders" ? "active" : ""}>
                 <Link to="/account/orders" style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                    <FaClipboardList /> <span>Đơn mua</span>
                  </div>
                  {(counts?.buyer?.total > 0) && <span className="badge-inline">{counts.buyer.total}</span>}
                </Link>
              </li>
              <li className={activeTab === "wallet" ? "active" : ""}>
                <Link to="/account/wallet">
                  <FaWallet /> <span>Ví của tôi</span>
                </Link>
              </li>
               <li className={activeTab === "books" ? "active" : ""}>
                <Link to="/account/books">
                  <FaBookMedical /> <span>Gian hàng</span>
                </Link>
              </li>
              <li className={activeTab === "sales" ? "active" : ""}>
                <Link to="/account/sales" style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                    <FaStore /> <span>Kênh người bán</span>
                  </div>
                  {(counts?.seller?.total > 0) && <span className="badge-inline">{counts.seller.total}</span>}
                </Link>
              </li>
              <li className="logout" onClick={handleLogout}>
                <div style={{display: 'flex', alignItems: 'center', gap: '10px', width: '100%', cursor: 'pointer', color: 'inherit'}}>
                     <FaSignOutAlt /> <span>Đăng xuất</span>
                </div>
              </li>
          </ul>
        </div>

        <div className="account-content">{renderContent()}</div>
      </div>
    </div>
  );
}
