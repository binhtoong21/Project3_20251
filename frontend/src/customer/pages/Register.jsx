import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useState, useEffect } from "react";
import { useAuth } from "../../shared/context/AuthContext";
import apiClient from "../../shared/utils/apiClient";
import "./page.css";
import "./register.css";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registrationEmail, setRegistrationEmail] = useState("");
  const [emailSent, setEmailSent] = useState(true); // Default true, update from API
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // If user is already logged in, redirect them.
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      toast.error("Passwords do not match");
      return;
    }
    
    setError("");
    setLoading(true);
    
    try {
      const response = await apiClient.post("/users/register", {
        name,
        email,
        password,
      });
      
      setRegistrationSuccess(true);
      setRegistrationEmail(email);
      // Backend returns emailSent property (true/false)
      const isEmailSent = response.emailSent !== false; 
      setEmailSent(isEmailSent);

      if (isEmailSent) {
          toast.success("Registration successful! Please verify your email.");
      } else {
          toast.warning("Registration successful, but verification email failed to send.");
      }
      
      // Reset form
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      const message = err.message || "Registration failed. Please try again.";
      setError(message);
      // Removed toast.error to avoid double notification
    } finally {
      setLoading(false);
    }
  };

  // Nếu registration thành công, hiển thị message
  if (registrationSuccess) {
    return (
      <div className="page register-page">
        <div className="container">
          <div className="register-form-container">
            <div className="success-message">
              {emailSent ? (
                <>
                  <h2>✓ Registration Successful!</h2>
                  <p>We've sent a verification email to:</p>
                  <p style={{ fontWeight: "bold", color: "#007bff" }}>{registrationEmail}</p>
                  <p>Please click the verification link in the email to activate your account.</p>
                </>
              ) : (
                <>
                  <h2 style={{color: '#ffc107'}}>⚠ Registration Warning</h2>
                  <p>Your account has been created, but we failed to send the verification email.</p>
                  <p>Please try to login and use the "Resend Verification Email" feature if needed.</p>
                </>
              )}
              
              <p style={{ fontSize: "14px", color: "#666" }}>
                Didn't receive the email? Check your spam folder or 
                <Link to="/resend-verification" style={{ marginLeft: "5px" }}>
                  request a new verification link
                </Link>
              </p>
              <button 
                onClick={() => navigate("/login")}
                className="btn"
                style={{ marginTop: "20px" }}
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page register-page">
      <div className="container">
        <div className="register-form-container">
          <h2>Register to Your Account</h2>
          <form onSubmit={handleSubmit} className="register-form">
            <div className="form-group">
              <input
                type="text"
                id="name"
                name="name"
                required
                placeholder="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <input
                type="email"
                id="email"
                name="email"
                required
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
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
                disabled={loading}
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
              />
            </div>
            {error && <p className="error-message">{error}</p>}
            <div className="checkbox">
              <input 
                type="checkbox" 
                id="terms" 
                name="terms" 
                required 
                disabled={loading}
              />
              <label htmlFor="terms">I agree to the terms and conditions</label>
            </div>
            <button type="submit" className="btn" disabled={loading}>
              {loading ? "Registering..." : "Register"}
            </button>
          </form>
          <p className="register-link">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
