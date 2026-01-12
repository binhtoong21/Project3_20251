import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { useState } from "react"; // Bỏ useEffect
import { useAuth } from "../../shared/context/AuthContext";
import "./page.css";
import "./login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const { login } = useAuth(); // Không cần lấy isAuthenticated ở đây nữa để tránh re-render logic

  // Lấy địa chỉ trang trước đó (do ProtectRoute gửi tới), mặc định là Home
  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(email, password);
      toast.success("Login successful!");

      // Sau khi login thành công, kiểm tra role và chuyển hướng
      if (user.role === "admin") {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      console.error("Login failed:", err);
      console.error("Login failed:", err);
      const message = err.message || "Login failed. Please try again.";
      setError(message);
      toast.error(message);
    }
  };

  return (
    <div className="page login-page">
      <div className="container">
        <div className="login-form-container">
          <h2>Login to Your Account</h2>
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <input
                type="email"
                id="email"
                name="email"
                required
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="form-group">
              <input
                type="password"
                id="password"
                name="password"
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && <p className="error-message">{error}</p>}
            <a href="#" className="forgot-password">
              Forgot Password?
            </a>
            <button type="submit" className="btn">
              Login
            </button>
          </form>
          <p className="signup-link">
            Don't have an account? <Link to="/register">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
