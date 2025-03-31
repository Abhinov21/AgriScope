// src/pages/MonitorField.js
import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Polygon } from "react-leaflet";
import MapWithDraw from "../components/MapWithDraw";
import NDVITileLayer from "../components/NDVITileLayer";
import NDVITimeSeriesChart from "../components/NDVITimeSeriesChart";
import axios from "axios";
import "../styles/monitorField.css";

const MonitorField = () => {
  const [aoiCoordinates, setAoiCoordinates] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [ndviUrl, setNdviUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  // State for time series data and modal visibility
  const [timeSeriesData, setTimeSeriesData] = useState([]);
  const [showModal, setShowModal] = useState(false);

  // On mount, check if an AOI has been stored for the user
  useEffect(() => {
    const storedAoi = localStorage.getItem("aoi");
    if (storedAoi) {
      try {
        setAoiCoordinates(JSON.parse(storedAoi));
      } catch (error) {
        console.error("Error parsing stored AOI:", error);
        localStorage.removeItem("aoi");
      }
    }
  }, []);

  // Callback when the AOI is drawn or updated
  const handleAoiChange = (coords) => {
    setAoiCoordinates(coords);
    localStorage.setItem("aoi", JSON.stringify(coords));
  };

  // Function to generate NDVI tile layer
  const handleSubmit = async () => {
    if (!aoiCoordinates || !startDate || !endDate) {
      setError("Please provide AOI and date range.");
      return;
    }

    // Ensure the polygon is closed
    const geoJSON = {
      type: "Polygon",
      coordinates: [[...aoiCoordinates, aoiCoordinates[0]]],
    };

    try {
      setLoading(true);
      setError("");
      const response = await axios.post("http://127.0.0.1:5000/process_ndvi", {
        coordinates: geoJSON.coordinates[0],
        start_date: startDate,
        end_date: endDate,
      });
      const { tile_url } = response.data;
      if (tile_url) {
        setNdviUrl(tile_url);
      } else {
        setError("Failed to generate NDVI tiles.");
      }
    } catch (err) {
      console.error("Error fetching NDVI:", err);
      setError("Failed to fetch NDVI data.");
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch time series data from backend and open the modal
  const fetchTimeSeries = async () => {
    if (!aoiCoordinates || !startDate || !endDate) {
      setError("Please provide AOI and date range to fetch time series.");
      return;
    }

    const geoJSON = {
      type: "Polygon",
      coordinates: [[...aoiCoordinates, aoiCoordinates[0]]],
    };

    try {
      setError("");
      const response = await axios.post("http://127.0.0.1:5000/ndvi_time_series", {
        coordinates: geoJSON.coordinates[0],
        start_date: startDate,
        end_date: endDate,
      });
      setTimeSeriesData(response.data.time_series);
      setShowModal(true);
    } catch (err) {
      console.error("Error fetching time series:", err);
      setError("Failed to fetch NDVI time series data.");
    }
  };

  // Convert stored AOI from [lng, lat] to Leaflet polygon format ([lat, lng])
  const polygonPositions = aoiCoordinates
    ? aoiCoordinates.map((coord) => [coord[1], coord[0]])
    : [];

  return (
    <div className="monitor-field-page">
      <h2 className="page-title">Monitor Your Field</h2>
      <div className="content-wrapper">
        {/* Left Column: Map */}
        <div className="map-section">
          <MapContainer center={[20.5937, 78.9629]} zoom={5} className="map-container">
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
            <MapWithDraw setAoiCoordinates={handleAoiChange} />
            {aoiCoordinates && (
              <Polygon positions={polygonPositions} pathOptions={{ color: "red" }} />
            )}
            {ndviUrl && <NDVITileLayer ndviUrl={ndviUrl} />}
          </MapContainer>
        </div>

        {/* Right Column: Controls & Info */}
        <div className="side-panel">
          <div className="panel-content">
            <h3>NDVI Settings</h3>
            <div className="date-inputs">
              <label>
                Start Date
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </label>
              <label>
                End Date
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </label>
            </div>
            <button onClick={handleSubmit} disabled={loading} className="generate-btn">
              {loading ? "Generating..." : "Generate NDVI"}
            </button>
            {/* New Button for Time Series */}
            <button onClick={fetchTimeSeries} className="timeseries-btn">
              Show Time Series
            </button>
            {error && <p className="error-message">{error}</p>}
            <div className="legend-card">
              <h4>NDVI Legend</h4>
              <div className="legend-bar">
                <div className="legend-stop" style={{ background: "blue" }}>-0.2</div>
                <div className="legend-stop" style={{ background: "white" }}>0.0</div>
                <div className="legend-stop" style={{ background: "yellow" }}>0.3</div>
                <div className="legend-stop" style={{ background: "green" }}>0.6</div>
                <div className="legend-stop" style={{ background: "darkgreen" }}>1.0</div>
              </div>
              <p className="legend-info">
                Low NDVI indicates less vegetation, high NDVI indicates healthy vegetation.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Popup for Time Series Chart */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setShowModal(false)}>
              Close
            </button>
            <h3>NDVI Time Series</h3>
            {timeSeriesData.length > 0 ? (
              <NDVITimeSeriesChart data={timeSeriesData} />
            ) : (
              <p>No time series data available.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MonitorField;
