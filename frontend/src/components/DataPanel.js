// src/components/DataPanel.js
import React from "react";
import NDVITimeSeriesChart from "./NDVITimeSeriesChart";

const DataPanel = ({ timeSeriesData }) => {
  return (
    <div className="data-panel">
      <h3>Field Reports</h3>
      <div className="chart-container">
        {Array.isArray(timeSeriesData) && timeSeriesData.length > 0 ? (
          <NDVITimeSeriesChart data={timeSeriesData} />
        ) : (
          <p>No NDVI time series data available.</p>
        )}
      </div>
    </div>
  );
};

export default DataPanel;
