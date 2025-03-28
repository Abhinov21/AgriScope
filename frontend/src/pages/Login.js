// src/pages/Login.js
import React, { useState } from "react";
import axios from "axios";
import "../styles/Auth.css";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/auth/login", { email, password });
      alert(response.data.message);
      
      // Create a user object using the email from the form and the token from the response
      const userData = { email, token: response.data.token };
      localStorage.setItem("user", JSON.stringify(userData));
      
      navigate("/homepage");
    } catch (error) {
      alert(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Login</button>
        </form>
        <p>
          Don't have an account?{" "}
          <a href="/register">
            <span>Sign Up</span>
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
