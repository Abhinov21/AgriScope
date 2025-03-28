import Navbar from './Navbar';
import React, { useState, useEffect } from "react";
import '../styles/homepage.css';

const Homepage = () => {
  const [soilMoisture, setSoilMoisture] = useState(45);
  const [weatherCondition, setWeatherCondition] = useState("Sunny");
  const [vegetationIndex, setVegetationIndex] = useState(0.75);

  useEffect(() => {
    // API calls for real-time data can be added here
  }, []);

  return (
    <div>
       <Navbar />
    <div className="homepage-container">
     
      
      <div className="sidebar">
        <ul>
          <li>Field Data</li>
          <li>Weather</li>
          <li>Crop Rotation</li>
          <li>Fertilization</li>
          <li>Spraying</li>
          <li>Harvesting</li>
        </ul>
      </div>
      
      <div className="content">
        <header className="homepage-header">
          <h1>Welcome to AgriScope</h1>
          <p>Monitor your field's key metrics and optimize crop management.</p>
        </header>
        
        <div className="dashboard">
          <div className="card">
            <h2>Soil Moisture</h2>
            <img src="https://onesoil.ai/media/pages/home/591dfefd6d-1638283334/monitoring-2-en-min-750x.webp" alt="Soil Moisture" className="feature-image" />
            <p>{soilMoisture}%</p>
            <div className="progress-bar" style={{ width: `${soilMoisture}%` }}>{soilMoisture}%</div>
          </div>
          
          <div className="card">
            <h2>Weather Condition</h2>
            <img src="https://onesoil.ai/media/pages/home/9b8734e280-1681825462/onesoil-gdd-en-750x.webp" alt="Weather Condition" className="feature-image" />
            <p>{weatherCondition}</p>
          </div>
          
          <div className="card">
            <h2>Vegetation Index</h2>
            <img src="https://onesoil.ai/media/pages/home/8bb74c6e8e-1638283335/monitoring-1-en-min-828x.webp" alt="Vegetation Index" className="feature-image" />
            <p>NDVI: {vegetationIndex.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default Homepage;
