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

const NDVITimeSeriesChart = ({ data = [] }) => {
  // Use default empty array if data is undefined.
  const chartData = {
    labels: data.map((point) => point.date),
    datasets: [
      {
        label: "NDVI",
        data: data.map((point) => point.ndvi),
        fill: false,
        borderColor: "green",
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: true },
      title: { display: true, text: "NDVI Time Series" },
    },
    scales: {
      x: {
        title: { display: true, text: "Date" },
      },
      y: {
        title: { display: true, text: "NDVI" },
        min: 0,
        max: 1,
      },
    },
  };

  return <Line data={chartData} options={options} />;
};

export default NDVITimeSeriesChart;
