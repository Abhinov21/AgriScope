// API Configuration Constants
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || "http://localhost:3001",
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
export const getApiUrl = (endpoint) => `${API_CONFIG.BASE_URL}${endpoint}`;
