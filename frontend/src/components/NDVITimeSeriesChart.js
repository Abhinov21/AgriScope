// src/components/NDVITimeSeriesChart.js
import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components.
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const NDVITimeSeriesChart = ({ data = [], indexName = "NDVI", indexInfo = {} }) => {
  // Use default empty array if data is undefined.
  // Handle both old format (ndvi property) and new format (value property)
  const chartData = {
    labels: data.map((point) => point.date),
    datasets: [
      {
        label: indexName,
        data: data.map((point) => point.value || point.ndvi), // Support both formats
        fill: false,
        borderColor: getIndexColor(indexName),
        backgroundColor: getIndexColor(indexName),
        tension: 0.1,
        pointBackgroundColor: getIndexColor(indexName),
        pointBorderColor: '#fff',
        pointRadius: 4,
      },
    ],
  };

  // Get appropriate color for each index
  function getIndexColor(index) {
    const colors = {
      'NDVI': '#22c55e', // Green
      'EVI': '#16a34a',  // Dark green
      'SAVI': '#84cc16', // Lime
      'ARVI': '#eab308', // Yellow
      'MAVI': '#3b82f6', // Blue
      'SR': '#f59e0b'    // Orange
    };
    return colors[index] || '#22c55e';
  }

  // Get appropriate Y-axis range for each index
  function getYAxisRange(index) {
    const ranges = {
      'SR': { min: 0, max: 10 },
      'NDVI': { min: -0.2, max: 1 },
      'EVI': { min: -0.2, max: 1 },
      'SAVI': { min: -0.2, max: 1 },
      'ARVI': { min: -0.2, max: 1 },
      'MAVI': { min: -0.2, max: 1 }
    };
    return ranges[index] || { min: -0.2, max: 1 };
  }

  const yRange = getYAxisRange(indexName);

  const options = {
    responsive: true,
    plugins: {
      legend: { display: true },
      title: { 
        display: true, 
        text: `${indexName} Time Series${indexInfo.name ? ` - ${indexInfo.name}` : ''}` 
      },
      tooltip: {
        callbacks: {
          afterBody: function(context) {
            if (indexInfo.description) {
              return [`Description: ${indexInfo.description}`];
            }
            return [];
          }
        }
      }
    },
    scales: {
      x: {
        title: { display: true, text: "Date" },
      },
      y: {
        title: { display: true, text: indexName },
        min: yRange.min,
        max: yRange.max,
      },
    },
  };

  return <Line data={chartData} options={options} />;
};

export default NDVITimeSeriesChart;
