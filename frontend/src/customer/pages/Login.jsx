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
      // Removed toast.error to avoid double notification (inline + toast)
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
            {error && <p className="error-message" style={{color: 'red', textAlign: 'center'}}>{error}</p>}
            
            {/* Show Resend Verification link if error is about verification */}
            {error && error.toLowerCase().includes("verify your email") && (
                <div style={{ textAlign: "center", marginBottom: "15px", marginTop: "10px" }}>
                  <Link to="/resend-verification" className="btn secondary" style={{
                      display: 'block', 
                      width: '100%', 
                      padding: '10px',
                      backgroundColor: '#f3f4f6',
                      color: '#374151',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      textDecoration: 'none',
                      textAlign: 'center',
                      fontWeight: '500'
                  }}>
                    Resend Verification Email
                  </Link>
                </div>
            )}

            <div style={{textAlign: 'right', marginBottom: '15px'}}>
                 <Link to="/forgot-password" className="forgot-password" style={{
                     color: '#2563eb', 
                     textDecoration: 'none', 
                     fontSize: '0.9rem',
                     display: 'inline-block',
                     padding: '5px'
                 }}>
                    Forgot Password?
                 </Link>
            </div>

            <button type="submit" className="btn" style={{width: '100%'}}>
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
