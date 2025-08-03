// API Configuration Constants
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || "http://localhost:3001",
  FLASK_BASE_URL: process.env.REACT_APP_FLASK_API_URL || "https://agriscope-backend-flask.onrender.com",
  ENDPOINTS: {
    AUTH: {
      LOGIN: "/auth/login",
      REGISTER: "/auth/register"
    },
    FIELDS: "/api/fields",
    WEATHER: "/api/weather/data"
  }
};

// Helper function to get full API URL
export const getApiUrl = (endpoint = '') => `${API_CONFIG.BASE_URL}${endpoint}`;

// Helper function to get full Flask API URL  
export const getFlaskApiUrl = (endpoint = '') => `${API_CONFIG.FLASK_BASE_URL}${endpoint}`;
