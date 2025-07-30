import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Auth.css";
import { getApiUrl } from "../config/api";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      const response = await axios.post(`${getApiUrl()}/auth/register`, {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });
      
      // Registration successful
      alert("Registration successful! Please login with your credentials.");
      navigate("/login");
      
    } catch (error) {
      console.error("Registration error:", error);
      setError(
        error.response?.data?.message || 
        "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Page Header */}
      <div className="auth-header">
        <h1 className="page-title">Join AgriScope</h1>
        <p className="page-subtitle">
          Create your account and start monitoring your agricultural fields with satellite data
        </p>
      </div>

      {/* Main Content Grid */}
      <div className="auth-content">
        {/* Sidebar */}
        <div className="auth-sidebar">
          <div className="sidebar-section">
            <h3>🌱 Why Join AgriScope?</h3>
            <div className="benefits-list">
              <div className="benefit-item">
                <div className="benefit-icon">🛰️</div>
                <div>
                  <h4>Satellite Monitoring</h4>
                  <p>Track your fields with real-time NDVI and satellite imagery</p>
                </div>
              </div>
              <div className="benefit-item">
                <div className="benefit-icon">📊</div>
                <div>
                  <h4>Data Analytics</h4>
                  <p>Get detailed insights and reports on crop health and growth</p>
                </div>
              </div>
              <div className="benefit-item">
                <div className="benefit-icon">🌤️</div>
                <div>
                  <h4>Weather Integration</h4>
                  <p>Historical and real-time weather data for better decisions</p>
                </div>
              </div>
              <div className="benefit-item">
                <div className="benefit-icon">🤖</div>
                <div>
                  <h4>Smart Recommendations</h4>
                  <p>Get personalized crop suggestions based on your field data</p>
                </div>
              </div>
            </div>
          </div>

          <div className="sidebar-section">
            <h3>💡 Getting Started</h3>
            <ol className="steps-list">
              <li>Create your free account</li>
              <li>Draw or upload your field boundaries</li>
              <li>Set your analysis date ranges</li>
              <li>View detailed reports and insights</li>
            </ol>
          </div>
        </div>
        
        {/* Registration Form */}
        <div className="auth-main">
          <div className="form-container">
            <div className="form-header">
              <h2>Create Account</h2>
              <p>Fill in your details to get started</p>
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <form onSubmit={handleRegister} className="auth-form">
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Create a password (min 6 characters)"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  minLength={6}
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              <button 
                type="submit" 
                className="auth-btn primary-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="loading-spinner"></span>
                    Creating Account...
                  </>
                ) : (
                  "🚀 Create Account"
                )}
              </button>
            </form>

            <div className="auth-footer">
              <p>
                Already have an account?{" "}
                <button 
                  type="button"
                  className="link-btn"
                  onClick={() => navigate("/login")}
                  disabled={loading}
                >
                  Sign in here
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
