import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../shared/context/AuthContext";
import "./AdminLayout.css";

export default function AdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="admin-layout">
      <header className="admin-header">
        <h1>Admin Dashboard</h1>
        <button onClick={handleLogout} className="logout-button-admin">
          Logout
        </button>
      </header>
      <div className="admin-body">
        <aside className="admin-sidebar">
          <nav>
            <ul>
              <li>
                <a href="/admin/dashboard">Dashboard</a>
              </li>
              {/* Add more admin links here */}
            </ul>
          </nav>
        </aside>
        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
