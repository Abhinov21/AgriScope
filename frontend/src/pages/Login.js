// src/pages/Login.js
import React, { useState } from "react";
import axios from "axios";
import "../styles/Auth.css";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const response = await axios.post("http://localhost:3001/auth/login", { email, password });
      
      // Create a user object using the email from the form and the token from the response
      const userData = { email, token: response.data.token };
      localStorage.setItem("user", JSON.stringify(userData));
      
      navigate("/homepage");
    } catch (error) {
      setError(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-header">
        <h1 className="page-title">🌾 AgriScope</h1>
        <p className="page-subtitle">Your Agricultural Intelligence Platform</p>
      </div>
      
      <div className="auth-content">
        <div className="auth-sidebar">
          <div className="welcome-section">
            <h2>Welcome Back!</h2>
            <p>Continue your agricultural journey with advanced field monitoring and crop analysis.</p>
          </div>
          
          <div className="features-list">
            <div className="feature-item">
              <span className="feature-icon">📡</span>
              <div className="feature-text">
                <h4>Satellite Monitoring</h4>
                <p>NDVI analysis and real-time field tracking</p>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🌤️</span>
              <div className="feature-text">
                <h4>Weather Analytics</h4>
                <p>6-month historical weather insights</p>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🤖</span>
              <div className="feature-text">
                <h4>Smart Recommendations</h4>
                <p>Intelligent crop suggestions based on data</p>
              </div>
            </div>
          </div>
        </div>

        <div className="auth-main">
          <div className="auth-box">
            <h2>Sign In to Your Account</h2>
            <p>Enter your credentials to access your agricultural dashboard</p>
            
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}
            
            <form onSubmit={handleLogin} className="auth-form">
              <div className="form-group">
                <label>📧 Email Address</label>
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>🔒 Password</label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              
              <button type="submit" className="auth-btn" disabled={loading}>
                {loading ? (
                  <>
                    <span className="loading-spinner"></span>
                    Signing In...
                  </>
                ) : (
                  "Sign In 🚀"
                )}
              </button>
            </form>
            
            <div className="auth-footer">
              <p>
                Don't have an account?{" "}
                <Link to="/register" className="auth-link">
                  Create Account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
