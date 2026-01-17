import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import apiClient from "../../shared/utils/apiClient";
import "./page.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await apiClient.post("/users/forgot-password", { email });
      setSent(true);
      toast.success(response.message || "Password reset link sent to your email!");
    } catch (error) {
      toast.error(error.message || "Failed to send password reset email");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="page forgot-password-page">
        <div className="container">
          <div className="forgot-password-container">
            <div style={{ textAlign: "center", padding: "40px" }}>
              <div style={{ fontSize: "48px", marginBottom: "20px" }}>🔑</div>
              <h2>Check Your Email</h2>
              <p>We've sent a password reset link to <strong>{email}</strong></p>
              <p style={{ color: "#666", fontSize: "14px", marginTop: "15px" }}>
                The link will expire in 1 hour. Click it to create a new password.
              </p>
              <Link to="/login" className="btn" style={{ marginTop: "30px" }}>
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page forgot-password-page">
      <div className="container">
        <div className="forgot-password-container">
          <h2>Forgot Password?</h2>
          <p style={{ color: "#666", marginBottom: "30px" }}>
            Enter your email address and we'll send you a link to reset your password.
          </p>

          <form onSubmit={handleSubmit} className="register-form">
            <div className="form-group">
              <input
                type="email"
                id="email"
                name="email"
                required
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <button type="submit" className="btn" disabled={loading}>
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>

          <p className="register-link">
            Remember your password? <Link to="/login">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
