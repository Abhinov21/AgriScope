import React, { useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import MapWithDraw from "../components/MapWithDraw";
import NDVITileLayer from "../components/NDVITileLayer";
import axios from "axios";
import "../styles/monitorField.css";

const MonitorField = () => {
  const [aoiCoordinates, setAoiCoordinates] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [ndviUrl, setNdviUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ SUBMISSION HANDLER
  const handleSubmit = async () => {
    if (!aoiCoordinates || !startDate || !endDate) {
      setError("Please provide AOI and date range.");
      return;
    }

    // ✅ Close the polygon by repeating the first coordinate
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

  return (
    <div className="monitor-field-page">
      <h2 className="page-title">Monitor Your Field</h2>

      <div className="content-wrapper">
        {/* Left Column: Map */}
        <div className="map-section">
          <MapContainer center={[20.5937, 78.9629]} zoom={5} className="map-container">
            {/* Satellite Layer */}
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
            <MapWithDraw setAoiCoordinates={setAoiCoordinates} />
            {ndviUrl && <NDVITileLayer ndviUrl={ndviUrl} />}
          </MapContainer>
        </div>

        {/* Right Column: Controls & Info */}
        <div className="side-panel">
          <div className="panel-content">
            <h3>NDVI Settings</h3>

            {/* Date Inputs */}
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

            {/* Generate Button */}
            <button onClick={handleSubmit} disabled={loading} className="generate-btn">
              {loading ? "Generating..." : "Generate NDVI"}
            </button>

            {/* Error Message */}
            {error && <p className="error-message">{error}</p>}

            {/* Example Legend or Info Card */}
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
    </div>
  );
};

export default MonitorField;
