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
  
  // Extract dates in their original format (YYYYMMDD)
  const dateCodes = Object.keys(parameter.T2M || {}).sort();
  
  // Format dates for display
  const formattedDates = dateCodes.map(dateCode => {
    return `${dateCode.substring(0, 4)}-${dateCode.substring(4, 6)}-${dateCode.substring(6, 8)}`;
  });
  
  // Calculate statistics correctly
  const calculateAverage = (values) => {
    if (!values || values.length === 0) return 0;
    const sum = values.reduce((a, b) => a + b, 0);
    return (sum / values.length).toFixed(1);
  };
  
  const calculateSum = (values) => {
    if (!values || values.length === 0) return 0;
    return values.reduce((a, b) => a + b, 0).toFixed(1);
  };
  
  // Extract values in the correct order
  const tempValues = dateCodes.map(date => parameter.T2M[date]);
  const maxTempValues = dateCodes.map(date => parameter.T2M_MAX[date]);
  const minTempValues = dateCodes.map(date => parameter.T2M_MIN[date]);
  const precipValues = dateCodes.map(date => parameter.PRECTOTCORR?.[date] || 0);
  const solarValues = dateCodes.map(date => parameter.ALLSKY_SFC_SW_DWN?.[date] || 0);
  
  // Convert MJ/m² to kWh/m² (1 MJ = 0.277778 kWh)
  const solarValuesKwh = solarValues.map(val => val * 0.277778);
  
  // Prepare dataset for temperature
  const tempData = {
    labels: formattedDates,
    datasets: [
      {
        label: 'Average Temperature (°C)',
        data: tempValues,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        tension: 0.1,
      },
      {
        label: 'Maximum Temperature (°C)',
        data: maxTempValues,
        borderColor: 'rgb(255, 159, 64)',
        backgroundColor: 'rgba(255, 159, 64, 0.5)',
        tension: 0.1,
      },
      {
        label: 'Minimum Temperature (°C)',
        data: minTempValues,
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        tension: 0.1,
      }
    ]
  };
  
  // Prepare dataset for precipitation
  const precipData = {
    labels: formattedDates,
    datasets: [
      {
        label: 'Precipitation (mm/day)',
        data: precipValues,
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

  // Calculate summary statistics correctly
  const avgTemp = calculateAverage(tempValues);
  const totalPrecip = calculateSum(precipValues);
  const avgSolar = calculateAverage(solarValuesKwh);

  return (
    <div className="weather-charts">
      <div className="weather-summary">
        <div className="weather-card">
          <h4>Temperature</h4>
          <div className="temp-icon">🌡️</div>
          <p className="temp-value">
            {avgTemp}°C Avg
          </p>
          <p className="temp-range">
            {Math.min(...minTempValues).toFixed(1)}°C to {Math.max(...maxTempValues).toFixed(1)}°C
          </p>
        </div>
        <div className="weather-card">
          <h4>Precipitation</h4>
          <div className="rain-icon">🌧️</div>
          <p className="rain-value">
            {totalPrecip}mm Total
          </p>
          <p className="rain-days">
            {precipValues.filter(v => v > 0).length} rainy days
          </p>
        </div>
        <div className="weather-card">
          <h4>Solar Radiation</h4>
          <div className="sun-icon">☀️</div>
          <p className="sun-value">
            {avgSolar} kWh/m² Avg
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