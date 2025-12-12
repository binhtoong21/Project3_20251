import { Link, useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  const { handleAuthSuccess, isAuthenticated } = useAuth();

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
      return;
    }
    setError("");
    try {
      const data = await apiClient.post("/users/register", {
        name,
        email,
        password,
      });
      // Directly handle the successful registration response
      handleAuthSuccess(data);
      navigate("/");
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    }
  };

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
            <div className="form-group">
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                required
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            {error && <p className="error-message">{error}</p>}
            <div className="checkbox">
              <input type="checkbox" id="terms" name="terms" required />
              <label htmlFor="terms">I agree to the terms and conditions</label>
            </div>
            <button type="submit" className="btn">
              Register
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
