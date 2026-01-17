import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import apiClient from "../../shared/utils/apiClient";
import "./page.css";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("ready"); // ready, success, error, invalid
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("invalid");
      setMessage("Invalid reset link");
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const token = searchParams.get("token");
      const response = await apiClient.post("/users/reset-password", {
        token,
        newPassword,
      });

      setStatus("success");
      setMessage(response.message || "Password reset successfully!");
      toast.success("Password reset successfully! Redirecting to login...");

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      setStatus("error");
      setMessage(error.message || "Failed to reset password");
      toast.error(error.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  if (status === "invalid") {
    return (
      <div className="page reset-password-page">
        <div className="container">
          <div className="reset-password-container">
            <div style={{ textAlign: "center", padding: "40px" }}>
              <div style={{ fontSize: "48px", marginBottom: "20px" }}>✗</div>
              <h2 style={{ color: "#dc3545" }}>Invalid Reset Link</h2>
              <p>{message}</p>
              <Link to="/forgot-password" className="btn" style={{ marginTop: "30px" }}>
                Request New Reset Link
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="page reset-password-page">
        <div className="container">
          <div className="reset-password-container">
            <div style={{ textAlign: "center", padding: "40px" }}>
              <div style={{ fontSize: "48px", marginBottom: "20px" }}>✓</div>
              <h2 style={{ color: "#28a745" }}>Password Reset Successfully!</h2>
              <p>{message}</p>
              <p style={{ color: "#666", fontSize: "14px", marginTop: "15px" }}>
                Redirecting to login...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="page reset-password-page">
        <div className="container">
          <div className="reset-password-container">
            <div style={{ textAlign: "center", padding: "40px" }}>
              <div style={{ fontSize: "48px", marginBottom: "20px" }}>✗</div>
              <h2 style={{ color: "#dc3545" }}>Reset Failed</h2>
              <p>{message}</p>
              <Link to="/forgot-password" className="btn" style={{ marginTop: "30px" }}>
                Request New Reset Link
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page reset-password-page">
      <div className="container">
        <div className="reset-password-container">
          <h2>Set New Password</h2>
          <p style={{ color: "#666", marginBottom: "30px" }}>
            Enter your new password below.
          </p>

          <form onSubmit={handleSubmit} className="register-form">
            <div className="form-group">
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                required
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
                minLength="6"
              />
            </div>

            <div className="form-group">
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                required
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                minLength="6"
              />
            </div>

            <button type="submit" className="btn" disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
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
