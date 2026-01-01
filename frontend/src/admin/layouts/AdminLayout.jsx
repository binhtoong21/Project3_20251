import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../shared/context/AuthContext";
import "./AdminLayout.css";
import {
  FaHome,
  FaBook,
  FaShoppingCart,
  FaUsers,
  FaSignOutAlt,
  FaMoneyCheckAlt,
} from "react-icons/fa";

export default function AdminLayout() {
  const { logout } = useAuth(); //
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
                <FaShoppingCart style={{ marginRight: "10px" }} /> Quản lý Đơn
                hàng
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
                to="/admin/deposits"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                <FaMoneyCheckAlt style={{ marginRight: "10px" }} /> Quản lý Nạp tiền
              </NavLink>
            </li>
             <li>
              <NavLink
                to="/admin/withdrawals"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                <FaMoneyCheckAlt style={{ marginRight: "10px" }} /> Quản lý Rút tiền
              </NavLink>
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
