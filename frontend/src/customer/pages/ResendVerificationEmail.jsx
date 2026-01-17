import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import apiClient from "../../shared/utils/apiClient";
import "./page.css";

export default function ResendVerificationEmail() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await apiClient.post("/users/resend-verification-email", { email });
      setSent(true);
      toast.success(response.message || "Verification email sent!");
    } catch (error) {
      toast.error(error.message || "Failed to resend verification email");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="page resend-verification-page">
        <div className="container">
          <div className="resend-verification-container">
            <div style={{ textAlign: "center", padding: "40px" }}>
              <div style={{ fontSize: "48px", marginBottom: "20px" }}>📧</div>
              <h2>Verification Email Sent!</h2>
              <p>We've sent a new verification email to <strong>{email}</strong></p>
              <p style={{ color: "#666", fontSize: "14px", marginTop: "15px" }}>
                Please check your email and click the verification link.
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
    <div className="page resend-verification-page">
      <div className="container">
        <div className="resend-verification-container">
          <h2>Resend Verification Email</h2>
          <p style={{ color: "#666", marginBottom: "30px" }}>
            Enter your email address and we'll send you a new verification link.
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
              {loading ? "Sending..." : "Send Verification Email"}
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
