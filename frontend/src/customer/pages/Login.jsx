import { Link } from 'react-router-dom';
import './page.css';
import './login.css';

export default function Login() {
  const handleSubmit = (event) => {
    event.preventDefault();
    
    alert('Login functionality is not implemented in this demo.');
  };

  return (
    <div className="page login-page">
      <div className="container">
        <div className="login-form-container">
          <h2>Login to Your Account</h2>
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <input type="email" id="email" name="email" required placeholder="Email"/>
            </div>
            <div className="form-group">
              <input type="password" id="password" name="password" required placeholder="Password"/>
            </div>
            <a href="#" className="forgot-password">Forgot Password?</a>
            <button type="submit" className="btn">Login</button>
          </form>
          <p className="signup-link">
            Don't have an account? <Link to="/register">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
} 