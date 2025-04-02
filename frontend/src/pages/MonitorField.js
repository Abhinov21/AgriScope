// src/pages/MonitorField.js
import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Polygon } from "react-leaflet";
import MapWithDraw from "../components/MapWithDraw";
import NDVITileLayer from "../components/NDVITileLayer";
import axios from "axios";
import FieldList from "../components/FieldList";
import DateRangePicker from "../components/DateRangePicker";
import NDVITimeSeriesChart from "../components/NDVITimeSeriesChart";
import "../styles/monitorField.css";

const MonitorField = () => {
  // Field management state
  const [fields, setFields] = useState([]);
  const [selectedField, setSelectedField] = useState(null);
  // AOI coordinates (drawn via MapWithDraw)
  const [aoiCoordinates, setAoiCoordinates] = useState(null);

  // Date range state as Date objects
  const [startDate, setStartDate] = useState(new Date("2025-03-01"));
  const [endDate, setEndDate] = useState(new Date("2025-03-31"));

  // NDVI overlay and time series state
  const [ndviUrl, setNdviUrl] = useState("");
  const [timeSeriesData, setTimeSeriesData] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  // Fetch fields from backend
  useEffect(() => {
    axios.get("http://localhost:5000/api/fields?email=user@example.com")
      .then((res) => setFields(res.data.fields))
      .catch((err) => {
        console.error("Error fetching fields:", err);
      });
  }, []);

  // Callback when AOI is drawn
  const handleAoiChange = (coords) => {
    setAoiCoordinates(coords);
    localStorage.setItem("aoi", JSON.stringify(coords));
  };

  // Save drawn field to backend
  const saveField = async () => {
    if (!aoiCoordinates) {
      setError("No AOI to save. Draw a field first.");
      return;
    }
    const fieldName = prompt("Enter a name for this field:");
    if (!fieldName) return;
    try {
      const response = await axios.post("http://localhost:5000/api/fields", {
        email: "abhi@gmail.com",
        plot_name: fieldName,
        geojson_data: { type: "Polygon", coordinates: [aoiCoordinates] },
      });
      alert(response.data.message);
      // Update the fields list
      axios.get("http://localhost:5000/api/fields?email=abhi@gmail.com")
        .then((res) => setFields(res.data.fields))
        .catch((err) => console.error("Error fetching fields:", err));
    } catch (err) {
      console.error("Error saving field:", err);
      setError("Failed to save field data.");
    }
  };

  // Generate NDVI overlay
  const handleSubmitNDVI = async () => {
    const geoCoords = selectedField?.geojson_data?.coordinates[0] || aoiCoordinates;
    if (!geoCoords || !startDate || !endDate) {
      setError("Please provide a field and date range.");
      return;
    }
    const geoJSON = { type: "Polygon", coordinates: [[...geoCoords, geoCoords[0]]] };

    try {
      setLoading(true);
      setError("");
      const response = await axios.post("http://127.0.0.1:5000/process_ndvi", {
        coordinates: geoJSON.coordinates[0],
        start_date: startDate.toISOString().split("T")[0],
        end_date: endDate.toISOString().split("T")[0],
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

  // Fetch NDVI time series data
  const fetchTimeSeries = async () => {
    const geoCoords = selectedField?.geojson_data?.coordinates[0] || aoiCoordinates;
    if (!geoCoords || !startDate || !endDate) {
      setError("Please provide a field and date range to fetch time series.");
      return;
    }
    const geoJSON = { type: "Polygon", coordinates: [[...geoCoords, geoCoords[0]]] };

    try {
      setError("");
      const response = await axios.post("http://127.0.0.1:5000/ndvi_time_series", {
        coordinates: geoJSON.coordinates[0],
        start_date: startDate.toISOString().split("T")[0],
        end_date: endDate.toISOString().split("T")[0],
      });
      setTimeSeriesData(response.data.time_series);
      setShowPopup(true);
    } catch (err) {
      console.error("Error fetching time series:", err);
      setError("Failed to fetch NDVI time series data.");
    }
  };

  // Convert AOI coordinates to Leaflet polygon format ([lat, lng])
  const polygonPositions = (selectedField?.geojson_data?.coordinates[0] || aoiCoordinates)
    ? (selectedField?.geojson_data?.coordinates[0] || aoiCoordinates).map(coord => [coord[1], coord[0]])
    : [];

  return (
    <div className="monitor-field-page">
      <h2 className="page-title">Monitor Your Field</h2>
      <div className="content-wrapper">
        {/* Sidebar */}
        <div className="side-panel">
          <div className="panel-content">
            <FieldList fields={fields} onFieldSelect={setSelectedField} />
            <button onClick={saveField} className="generate-btn">
              Save Field
            </button>
            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              onStartChange={setStartDate}
              onEndChange={setEndDate}
            />
            <button onClick={handleSubmitNDVI} disabled={loading} className="generate-btn">
              {loading ? "Generating NDVI..." : "Generate NDVI Overlay"}
            </button>
            <button onClick={fetchTimeSeries} className="timeseries-btn">
              Show NDVI Time Series
            </button>
            {error && <p className="error-message">{error}</p>}
          </div>
        </div>
        {/* Map Section */}
        <div className="map-section">
          <MapContainer center={[20.5937, 78.9629]} zoom={5} className="map-container">
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
            <MapWithDraw setAoiCoordinates={handleAoiChange} />
            {(selectedField?.geojson_data || aoiCoordinates) && (
              <Polygon positions={polygonPositions} pathOptions={{ color: "red" }} />
            )}
            {ndviUrl && <NDVITileLayer ndviUrl={ndviUrl} />}
          </MapContainer>
        </div>
      </div>
      {/* Popup for Time Series Chart */}
      {showPopup && (
        <div className="popup-container">
          <div className="popup-content">
            <button className="popup-close" onClick={() => setShowPopup(false)}>Close</button>
            <h3>NDVI Time Series</h3>
            {timeSeriesData.length > 0 ? (
              <NDVITimeSeriesChart data={timeSeriesData} />
            ) : (
              <p>No NDVI time series data available.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MonitorField;
