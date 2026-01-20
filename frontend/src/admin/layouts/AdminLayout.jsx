import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../shared/context/AuthContext";
import { useNotificationCounts } from "../../shared/hooks/useNotificationCounts";
import "./AdminLayout.css";
import {
  FaHome,
  FaBook,
  FaShoppingCart,
  FaUsers,
  FaSignOutAlt,
  FaMoneyCheckAlt,
  FaGavel,
  FaCog,
  FaTruck, // New Layout
} from "react-icons/fa";

export default function AdminLayout() {
  const { logout } = useAuth(); //
  const { counts } = useNotificationCounts();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="admin-container">
      {/* Sidebar  */}
      <aside className="admin-sidebar">
        <div>
          <div className="sidebar-header">BookStore Admin</div>
          <ul className="sidebar-menu">
            <li>
              <NavLink
                to="/admin/dashboard"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                <FaHome style={{ marginRight: "10px" }} /> Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/books"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                <FaBook style={{ marginRight: "10px" }} /> Quản lý Sách
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/orders"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%'}}>
                    <span style={{display: 'flex', alignItems: 'center'}}><FaShoppingCart style={{ marginRight: "10px" }} /> Quản lý Đơn hàng</span>
                    {(counts?.seller?.toShip > 0) && <span className="badge-inline" style={{marginLeft: 'auto', backgroundColor: '#3b82f6'}}>{counts.seller.toShip}</span>}
                </div>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/users"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                <FaUsers style={{ marginRight: "10px" }} /> Quản lý Users
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/disputes"
                className={({ isActive }) => (isActive ? "active" : "")}
                style={({ isActive }) => isActive ? { color: '#ef4444', fontWeight: 'bold' } : {}}
              >
                 <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%'}}>
                    <span style={{display: 'flex', alignItems: 'center'}}><FaGavel style={{ marginRight: "10px" }} /> Giải quyết Khiếu nại</span>
                    {(counts?.admin?.disputedOrders > 0) && <span className="badge-inline" style={{marginLeft: 'auto'}}>{counts.admin.disputedOrders}</span>}
                 </div>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/deposits"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                 <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%'}}>
                    <span style={{display: 'flex', alignItems: 'center'}}><FaMoneyCheckAlt style={{ marginRight: "10px" }} /> Quản lý Nạp tiền</span>
                    {(counts?.admin?.pendingDeposits > 0) && <span className="badge-inline" style={{marginLeft: 'auto'}}>{counts.admin.pendingDeposits}</span>}
                 </div>
              </NavLink>
            </li>
          <li>
              <NavLink
                to="/admin/withdrawals"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                 <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%'}}>
                    <span style={{display: 'flex', alignItems: 'center'}}><FaMoneyCheckAlt style={{ marginRight: "10px" }} /> Quản lý Rút tiền</span>
                    {(counts?.admin?.pendingWithdrawals > 0) && <span className="badge-inline" style={{marginLeft: 'auto'}}>{counts.admin.pendingWithdrawals}</span>}
                </div>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/settings"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                <FaCog style={{ marginRight: "10px" }} /> Cài đặt Cửa hàng
              </NavLink>
            </li>
            <li>
              <a 
                href="http://localhost:3000/logistics-portal/logistics.html" 
                target="_blank" 
                rel="noopener noreferrer"
                className=""
                style={{color: '#10b981'}}
              >
                <FaTruck style={{ marginRight: "10px" }} /> <strong>Logistics Simulator</strong>
              </a>
            </li>
          </ul>
        </div>

        {/* Nút Logout  */}
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            <FaSignOutAlt /> Đăng xuất
          </button>
        </div>
      </aside>

      {/* Nội dung  */}
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}
