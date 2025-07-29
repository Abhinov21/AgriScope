// API Configuration Constants
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || "http://localhost:3001",
  FLASK_URL: process.env.REACT_APP_FLASK_API_URL || "http://localhost:5000",
  ENDPOINTS: {
    AUTH: {
      LOGIN: "/auth/login",
      REGISTER: "/auth/register"
    },
    FIELDS: "/api/fields",
    WEATHER: "/api/weather/data",
    NDVI: "/process_ndvi",
    NDVI_TIME_SERIES: "/ndvi_time_series"
  }
};

// Helper function to get full API URL (Node.js backend)
export const getApiUrl = (endpoint) => `${API_CONFIG.BASE_URL}${endpoint}`;

// Helper function to get full Flask API URL (Flask backend)
export const getFlaskApiUrl = (endpoint) => `${API_CONFIG.FLASK_URL}${endpoint}`;
