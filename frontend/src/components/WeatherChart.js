// src/components/WeatherChart.js
import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import '../styles/WeatherChart.css';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const WeatherChart = ({ data }) => {
  if (!data || !data.properties || !data.properties.parameter) {
    return <p>No weather data available</p>;
  }

  const { parameter } = data.properties;
  
  // Extract dates and format them
  const dates = Object.keys(parameter.T2M || {}).map(date => {
    // Format YYYYMMDD to YYYY-MM-DD
    return `${date.substring(0, 4)}-${date.substring(4, 6)}-${date.substring(6, 8)}`;
  });
  
  // Prepare dataset for temperature
  const tempData = {
    labels: dates,
    datasets: [
      {
        label: 'Average Temperature (°C)',
        data: dates.map(date => parameter.T2M[date.replace(/-/g, '')]),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        tension: 0.1,
      },
      {
        label: 'Maximum Temperature (°C)',
        data: dates.map(date => parameter.T2M_MAX[date.replace(/-/g, '')]),
        borderColor: 'rgb(255, 159, 64)',
        backgroundColor: 'rgba(255, 159, 64, 0.5)',
        tension: 0.1,
      },
      {
        label: 'Minimum Temperature (°C)',
        data: dates.map(date => parameter.T2M_MIN[date.replace(/-/g, '')]),
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        tension: 0.1,
      }
    ]
  };
  
  // Prepare dataset for precipitation
  const precipData = {
    labels: dates,
    datasets: [
      {
        label: 'Precipitation (mm/day)',
        data: dates.map(date => parameter.PRECTOTCORR?.[date.replace(/-/g, '')] || 0),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.1,
      }
    ]
  };
  
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Weather Data',
      },
    },
  };

  return (
    <div className="weather-charts">
      <div className="weather-summary">
        <div className="weather-card">
          <h4>Temperature</h4>
          <div className="temp-icon">🌡️</div>
          <p className="temp-value">
            {Object.values(parameter.T2M || {}).reduce((a, b) => a + b, 0) / 
             Object.values(parameter.T2M || {}).length || 0}°C Avg
          </p>
        </div>
        <div className="weather-card">
          <h4>Precipitation</h4>
          <div className="rain-icon">🌧️</div>
          <p className="rain-value">
            {Object.values(parameter.PRECTOTCORR || {}).reduce((a, b) => a + b, 0) || 0}mm Total
          </p>
        </div>
        <div className="weather-card">
          <h4>Sunshine</h4>
          <div className="sun-icon">☀️</div>
          <p className="sun-value">
            {Object.values(parameter.ALLSKY_SFC_SW_DWN || {}).reduce((a, b) => a + b, 0) / 
             Object.values(parameter.ALLSKY_SFC_SW_DWN || {}).length || 0}kW-hr/m² Avg
          </p>
        </div>
      </div>

      <div className="chart-container">
        <h4>Temperature Trends</h4>
        <Line options={options} data={tempData} />
      </div>
      
      <div className="chart-container">
        <h4>Precipitation</h4>
        <Line options={options} data={precipData} />
      </div>
    </div>
  );
};

export default WeatherChart;