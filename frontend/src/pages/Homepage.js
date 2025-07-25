import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import '../styles/homepage.css';

const Homepage = () => {
  const navigate = useNavigate();
  const [soilMoisture, setSoilMoisture] = useState(45);
  const [weatherCondition, setWeatherCondition] = useState("Sunny");
  const [vegetationIndex, setVegetationIndex] = useState(0.75);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (err) {
        console.error("Error parsing user data:", err);
      }
    }
  }, []);

  return (
    <div className="homepage-page">
      <div className="homepage-header">
        <h1 className="page-title">🌾 Welcome to AgriScope</h1>
        <p className="page-subtitle">
          {user ? `Welcome back, ${user.email}!` : 'Welcome!'} Your comprehensive agricultural monitoring and analysis platform.
        </p>
      </div>

      <div className="homepage-content">
        {/* Quick Actions Sidebar */}
        <div className="homepage-sidebar">
          <div className="sidebar-section">
            <h3>Quick Actions</h3>
            <div className="action-buttons">
              <button 
                onClick={() => navigate("/monitor-field")}
                className="action-btn primary"
              >
                🗺️ Monitor Fields
              </button>
              <button 
                onClick={() => navigate("/crop-suggestion")}
                className="action-btn secondary"
              >
                🌱 Crop Suggestions
              </button>
              <button 
                onClick={() => navigate("/field-reports")}
                className="action-btn tertiary"
              >
                📊 Field Reports
              </button>
            </div>
          </div>

          <div className="sidebar-section">
            <h3>Platform Features</h3>
            <div className="feature-list">
              <div className="feature-item">
                <span className="feature-icon">📡</span>
                <div className="feature-text">
                  <h4>Satellite Monitoring</h4>
                  <p>NDVI analysis and vegetation tracking</p>
                </div>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🌤️</span>
                <div className="feature-text">
                  <h4>Weather Analytics</h4>
                  <p>6-month historical weather data</p>
                </div>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🤖</span>
                <div className="feature-text">
                  <h4>Smart Recommendations</h4>
                  <p>Intelligent crop suggestions</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Dashboard */}
        <div className="homepage-main">
          <div className="welcome-section">
            <h2>Dashboard Overview</h2>
            <p>Monitor your field's key metrics and optimize crop management with real-time insights.</p>
          </div>
          
          <div className="metrics-grid">
            <div className="metric-card high">
              <div className="metric-header">
                <h3>🌱 Soil Moisture</h3>
                <span className="metric-badge">Live Data</span>
              </div>
              <div className="metric-content">
                <div className="metric-value">{soilMoisture}%</div>
                <div className="metric-description">Current soil moisture level</div>
                <div className="progress-container">
                  <div className="progress-bar" style={{ width: `${soilMoisture}%` }}>
                    <span className="progress-text">{soilMoisture}%</span>
                  </div>
                </div>
              </div>
              <div className="metric-image">
                <img src="https://onesoil.ai/media/pages/home/591dfefd6d-1638283334/monitoring-2-en-min-750x.webp" alt="Soil Moisture" />
              </div>
            </div>
            
            <div className="metric-card medium">
              <div className="metric-header">
                <h3>🌤️ Weather Condition</h3>
                <span className="metric-badge">Current</span>
              </div>
              <div className="metric-content">
                <div className="metric-value">{weatherCondition}</div>
                <div className="metric-description">Today's weather status</div>
                <div className="weather-details">
                  <span className="weather-temp">24°C</span>
                  <span className="weather-humidity">Humidity: 65%</span>
                </div>
              </div>
              <div className="metric-image">
                <img src="https://onesoil.ai/media/pages/home/9b8734e280-1681825462/onesoil-gdd-en-750x.webp" alt="Weather Condition" />
              </div>
            </div>
            
            <div className="metric-card high">
              <div className="metric-header">
                <h3>📊 Vegetation Index</h3>
                <span className="metric-badge">NDVI</span>
              </div>
              <div className="metric-content">
                <div className="metric-value">{vegetationIndex.toFixed(2)}</div>
                <div className="metric-description">Normalized Difference Vegetation Index</div>
                <div className="ndvi-status">
                  <span className="status-indicator good">🟢 Healthy Vegetation</span>
                </div>
              </div>
              <div className="metric-image">
                <img src="https://onesoil.ai/media/pages/home/8bb74c6e8e-1638283335/monitoring-1-en-min-828x.webp" alt="Vegetation Index" />
              </div>
            </div>
          </div>

          {/* Action Section */}
          <div className="action-section">
            <h2>Get Started</h2>
            <p>Ready to optimize your agricultural operations? Choose your next step:</p>
            <div className="action-cards">
              <div className="action-card" onClick={() => navigate("/monitor-field")}>
                <div className="action-icon">🗺️</div>
                <h3>Create & Monitor Fields</h3>
                <p>Draw field boundaries and start monitoring with satellite data</p>
                <button className="action-card-btn">Start Monitoring</button>
              </div>
              <div className="action-card" onClick={() => navigate("/crop-suggestion")}>
                <div className="action-icon">🌾</div>
                <h3>Get Crop Recommendations</h3>
                <p>Receive intelligent crop suggestions based on field analysis</p>
                <button className="action-card-btn">Explore Crops</button>
              </div>
              <div className="action-card" onClick={() => navigate("/field-reports")}>
                <div className="action-icon">📈</div>
                <h3>View Field Reports</h3>
                <p>Analyze detailed reports with NDVI and weather insights</p>
                <button className="action-card-btn">View Reports</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Homepage;
