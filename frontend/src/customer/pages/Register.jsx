import { Link } from 'react-router-dom';
import './page.css';
import './register.css';

export default function Register() {
  const handleSubmit = (event) => {
    event.preventDefault();
    
    alert('register functionality is not implemented in this demo.');
  };

  return (
    <div className="page register-page">
      <div className="container">
        <div className="register-form-container">
          <h2>Register to Your Account</h2>
          <form onSubmit={handleSubmit} className="register-form">
            <div className="form-group">
              <input type="email" id="email" name="email" required placeholder="Email"/>
            </div>
            <div className="form-group">
              <input type="password" id="password" name="password" required placeholder="Password"/>
            </div>
            <div className="form-group">
              <input type="password" id="password" name="password" required placeholder="Confirm Password"/>
            </div>
            <div className="checkbox">
              <input type="checkbox" id="terms" name="terms" required/>
              <label htmlFor="terms">I agree to the terms and conditions</label>
            </div>
            <button type="submit" className="btn">Register</button>
          </form>
          <p className="register-link">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
} 