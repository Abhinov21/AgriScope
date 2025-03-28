// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from "react";

// Create the context
export const AuthContext = createContext(null);

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // On mount, check localStorage to see if the user is already logged in
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (userData) => {
    // Save user data to state
    setUser(userData);
    // Also store in localStorage for persistence
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    // Clear state
    setUser(null);
    // Remove from localStorage
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
