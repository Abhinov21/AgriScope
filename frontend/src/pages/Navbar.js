// src/components/Navbar.js
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/nav.css";

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Error parsing user from localStorage:", error);
        localStorage.removeItem("user");
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="logo">AgriScope</div>
      <ul className="nav-links">
        <li><Link to="/homepage">Home</Link></li>
        <li><Link to="/AboutUs">About</Link></li>
        <React.Fragment>
          <li><Link to="/monitor-field">Monitor Field</Link></li>
          <li><Link to="/crop-suggestion">Crop Suggestions</Link></li>
          <li><Link to="/field-reports">Field Reports</Link></li>
        </React.Fragment>
      </ul>

      <div className="auth-links">
        {user ? (
          <ul>
            <li>Welcome, {user.email || "User"}</li>
            <li>
              <button onClick={handleLogout} className="nav-link logout-button">
                Logout
              </button>
            </li>
          </ul>
        ) : (
          <ul>
            <li><Link to="/login" className="nav-link">Login</Link></li>
            <li><Link to="/register" className="nav-link">Register</Link></li>
          </ul>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
