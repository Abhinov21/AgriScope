// src/pages/MonitorField.js
import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Polygon, useMap } from "react-leaflet";
import MapWithDraw from "../components/MapWithDraw";
import NDVITileLayer from "../components/NDVITileLayer";
import axios from "axios";
import FieldList from "../components/FieldList";
import DateRangePicker from "../components/DateRangePicker";
import NDVITimeSeriesChart from "../components/NDVITimeSeriesChart";
import WeatherChart from "../components/WeatherChart";
import "../styles/monitorField.css";
import { useNavigate } from "react-router-dom";
// Component to center map on coordinates
const MapCentering = ({ coordinates }) => {
  const map = useMap();

  useEffect(() => {
    if (coordinates && coordinates.length > 0) {
      // Calculate center of polygon
      const latLngs = coordinates.map(coord => [coord[1], coord[0]]);

      // Calculate bounds to handle fields of any size
      const bounds = latLngs.reduce(
        (bounds, point) => bounds.extend(point),
        map.getBounds()
      );

      // Center and zoom the map to fit the field
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [coordinates, map]);

  return null;
};

const MonitorField = () => {
  const navigate = useNavigate();
  const mapRef = useRef(null);

  // Field management state
  const [fields, setFields] = useState([]);
  const [selectedField, setSelectedField] = useState(null);
  const [aoiCoordinates, setAoiCoordinates] = useState(null);
  const [drawingMode, setDrawingMode] = useState(false);

  // Date range state
  const [startDate, setStartDate] = useState(new Date("2025-03-01"));
  const [endDate, setEndDate] = useState(new Date("2025-03-31"));

  // NDVI state
  const [ndviUrl, setNdviUrl] = useState("");
  const [timeSeriesData, setTimeSeriesData] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [activeTab, setActiveTab] = useState("ndvi");

  // Weather data state
  const [weatherData, setWeatherData] = useState(null);

  // Get user email from Login.js data
  const getUserEmail = () => {
    const userData = localStorage.getItem("user");

    if (userData) {
      try {
        const { email } = JSON.parse(userData);
        return email;
      } catch (err) {
        console.error("Error parsing user data:", err);
      }
    }

    navigate("/login");
    return null;
  };

  // Show notifications
  const showNotification = (message, isError = false) => {
    setError(isError ? message : "");

    if (!isError) {
      const tempMessage = document.createElement("div");
      tempMessage.className = "success-notification";
      tempMessage.textContent = message;
      document.body.appendChild(tempMessage);

      setTimeout(() => {
        document.body.removeChild(tempMessage);
      }, 3000);
    }
  };

  // Fetch fields from backend
  const fetchFields = async () => {
    try {
      const email = getUserEmail();
      if (!email) return;

      const response = await axios.get(`http://localhost:5000/api/fields?email=${email}`);

      if (response.data.fields && Array.isArray(response.data.fields)) {
        setFields(response.data.fields);

        if (selectedField) {
          const updatedField = response.data.fields.find(
            field => field.id === selectedField.id || field._id === selectedField._id
          );
          if (updatedField) {
            setSelectedField(updatedField);
          }
        }
      } else {
        console.error("Invalid field data format:", response.data);
        showNotification("Error loading fields: Invalid data format", true);
      }
    } catch (err) {
      console.error("Error fetching fields:", err);
      showNotification(`Error loading fields: ${err.message || "Unknown error"}`, true);
    }
  };

  // Initialize component
  useEffect(() => {
    fetchFields();

    // Load previously drawn AOI if available
    const savedAoi = localStorage.getItem("aoi");
    if (savedAoi) {
      try {
        setAoiCoordinates(JSON.parse(savedAoi));
      } catch (err) {
        console.error("Error parsing saved AOI:", err);
      }
    }
  }, []);

  // Handle AOI drawing
  const handleAoiChange = (coords) => {
    // Clear selected field when drawing new AOI
    setSelectedField(null);
    setAoiCoordinates(coords);
    localStorage.setItem("aoi", JSON.stringify(coords));
    showNotification("Field area drawn. You can now save this field.");
    setDrawingMode(false);
  };

  // Enable drawing mode
  const enableDrawMode = () => {
    setSelectedField(null);
    setAoiCoordinates(null);
    setDrawingMode(true);
    showNotification("Drawing mode enabled. Draw your field on the map.");
  };

  // Save field to backend
  const saveField = async () => {
    if (!aoiCoordinates) {
      showNotification("No field to save. Please draw a field first.", true);
      return;
    }

    const fieldName = prompt("Enter a name for this field:");
    if (!fieldName) return; // User cancelled

    try {
      const email = getUserEmail();
      if (!email) return;

      setLoading(true);

      const response = await axios.post("http://localhost:5000/api/fields", {
        email: email,
        plot_name: fieldName,
        geojson_data: { type: "Polygon", coordinates: [aoiCoordinates] },
      });

      showNotification(response.data.message || "Field saved successfully");

      // Clear the current AOI after saving
      setAoiCoordinates(null);

      // Refresh fields list
      await fetchFields();
    } catch (err) {
      console.error("Error saving field:", err);
      showNotification(`Failed to save field: ${err.message || "Unknown error"}`, true);
    } finally {
      setLoading(false);
    }
  };

  // Select field callback
  const handleFieldSelect = (field) => {
    setSelectedField(field);
    // Clear any drawn AOI when a saved field is selected
    setAoiCoordinates(null);
    setDrawingMode(false);
  };

  // Delete field callback
  const handleFieldDelete = async (fieldId) => {
    try {
      const email = getUserEmail();
      if (!email) return;

      setLoading(true);

      const response = await axios.delete(`http://localhost:5000/api/fields/${fieldId}`, {
        data: { email },
      });

      showNotification(response.data.message || "Field deleted successfully");

      // Refresh fields list
      await fetchFields();
    } catch (err) {
      console.error("Error deleting field:", err);
      showNotification(`Failed to delete field: ${err.message || "Unknown error"}`, true);
    } finally {
      setLoading(false);
    }
  };

  // Rename field callback
  const handleFieldRename = async (fieldId, newName) => {
    try {
      const email = getUserEmail();
      if (!email) return;

      setLoading(true);

      const response = await axios.put(`http://localhost:5000/api/fields/${fieldId}`, {
        email,
        plot_name: newName,
      });

      showNotification(response.data.message || "Field renamed successfully");

      // Refresh fields list
      await fetchFields();
    } catch (err) {
      console.error("Error renaming field:", err);
      showNotification(`Failed to rename field: ${err.message || "Unknown error"}`, true);
    } finally {
      setLoading(false);
    }
  };

  // Delete field from backend
  const deleteField = async (fieldId) => {
    try {
      const email = getUserEmail();
      if (!email) return;

      setLoading(true);

      console.log(`Attempting to delete field with ID: ${fieldId}, email: ${email}`);

      const response = await axios.delete(`http://localhost:5000/api/fields/${fieldId}`, {
        data: { email }
      });

      console.log("Delete response:", response.data);
      showNotification(response.data.message || "Field deleted successfully");

      // Clear selected field if it was the one deleted
      if (selectedField && (selectedField.id === fieldId || selectedField._id === fieldId)) {
        setSelectedField(null);
      }

      // Refresh fields list
      await fetchFields();
    } catch (err) {
      console.error("Error deleting field:", err);

      // More detailed error logging
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("Error response data:", err.response.data);
        console.error("Error response status:", err.response.status);
        console.error("Error response headers:", err.response.headers);

        showNotification(`Failed to delete field: ${err.response.data.message || err.message}`, true);
      } else if (err.request) {
        // The request was made but no response was received
        console.error("Error request:", err.request);
        showNotification("Failed to delete field: No response received from server", true);
      } else {
        // Something happened in setting up the request that triggered an Error
        showNotification(`Failed to delete field: ${err.message}`, true);
      }
    } finally {
      setLoading(false);
    }
  };

  // Rename field in backend
  const renameField = async (fieldId, newName) => {
    try {
      const email = getUserEmail();
      if (!email) return;

      setLoading(true);

      const response = await axios.put(`http://localhost:5000/api/fields/${fieldId}`, {
        email,
        plot_name: newName
      });

      showNotification(response.data.message || "Field renamed successfully");

      // Update selected field if it was the one renamed
      if (selectedField && (selectedField.id === fieldId || selectedField._id === fieldId)) {
        setSelectedField({
          ...selectedField,
          plot_name: newName
        });
      }

      // Refresh fields list
      await fetchFields();
    } catch (err) {
      console.error("Error renaming field:", err);
      showNotification(`Failed to rename field: ${err.message || "Unknown error"}`, true);
    } finally {
      setLoading(false);
    }
  };

  // Calculate polygon center for map centering
  const calculateFieldCenter = () => {
    const coordinates = selectedField?.geojson_data?.coordinates[0];
    if (!coordinates) return null;

    return coordinates;
  };

  // Generate NDVI overlay (unchanged)
  const handleSubmitNDVI = async () => {
    // Same code as before
    const geoCoords = selectedField?.geojson_data?.coordinates[0] || aoiCoordinates;
    if (!geoCoords || !startDate || !endDate) {
      showNotification("Please provide a field and date range.", true);
      return;
    }

    const geoJSON = { 
      type: "Polygon", 
      coordinates: [[...geoCoords, geoCoords[0]].filter((coord, index, array) => 
        index === 0 || JSON.stringify(coord) !== JSON.stringify(array[0])
      )] 
    };

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
        showNotification("NDVI overlay generated successfully");
      } else {
        showNotification("Failed to generate NDVI tiles: No URL returned", true);
      }
    } catch (err) {
      console.error("Error fetching NDVI:", err);
      showNotification(`Failed to fetch NDVI data: ${err.message || "Unknown error"}`, true);
    } finally {
      setLoading(false);
    }
  };

  // Fetch weather data
  const fetchWeatherData = async () => {
    const geoCoords = selectedField?.geojson_data?.coordinates[0] || aoiCoordinates;
    if (!geoCoords || !startDate || !endDate) {
      showNotification("Please provide a field and date range to fetch weather data.", true);
      return;
    }
    
    try {
      setLoading(true);
      
      const response = await axios.post("http://localhost:5000/api/weather/data", {
        coordinates: geoCoords,
        start_date: startDate.toISOString().split("T")[0],
        end_date: endDate.toISOString().split("T")[0],
      });
      
      setWeatherData(response.data);
      showNotification("Weather data retrieved successfully");
    } catch (err) {
      console.error("Error fetching weather data:", err);
      showNotification(`Failed to fetch weather data: ${err.message || "Unknown error"}`, true);
    } finally {
      setLoading(false);
    }
  };

  // Fetch NDVI time series data (modified to also fetch weather data)
  const fetchTimeSeries = async () => {
    const geoCoords = selectedField?.geojson_data?.coordinates[0] || aoiCoordinates;
    if (!geoCoords || !startDate || !endDate) {
      showNotification("Please provide a field and date range to fetch time series.", true);
      return;
    }

    const geoJSON = { 
      type: "Polygon", 
      coordinates: [[...geoCoords, geoCoords[0]].filter((coord, index, array) => 
        index === 0 || JSON.stringify(coord) !== JSON.stringify(array[0])
      )] 
    };

    try {
      setError("");
      setLoading(true);

      const response = await axios.post("http://127.0.0.1:5000/ndvi_time_series", {
        coordinates: geoJSON.coordinates[0],
        start_date: startDate.toISOString().split("T")[0],
        end_date: endDate.toISOString().split("T")[0],
      });

      setTimeSeriesData(response.data.time_series);
      
      // Also fetch weather data
      await fetchWeatherData();
      
      setShowPopup(true);
      showNotification("Time series data generated successfully");
    } catch (err) {
      console.error("Error fetching time series:", err);
      showNotification(`Failed to fetch NDVI time series: ${err.message || "Unknown error"}`, true);
    } finally {
      setLoading(false);
    }
  };

  // Convert coordinates for display
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
            <FieldList 
              fields={fields} 
              selectedField={selectedField}
              onFieldSelect={handleFieldSelect}
              onFieldDelete={handleFieldDelete}
              onFieldRename={handleFieldRename}
            />
            
            {/* Conditional button rendering based on state */}
            {aoiCoordinates && !selectedField ? (
              <button onClick={saveField} disabled={loading} className="generate-btn save-btn">
                {loading ? "Saving..." : "Save Field"}
              </button>
            ) : (
              <button onClick={enableDrawMode} disabled={loading || drawingMode} className="generate-btn create-btn">
                {drawingMode ? "Drawing Mode Active" : "Plot New AOI"}
              </button>
            )}
            
            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              onStartChange={setStartDate}
              onEndChange={setEndDate}
            />
            
            {/* Only enable NDVI buttons if there's a field selected or drawn */}
            <button 
              onClick={handleSubmitNDVI} 
              disabled={loading || (!selectedField && !aoiCoordinates)} 
              className="generate-btn"
            >
              {loading ? (
                <>
                  <span className="loading"></span>
                  Generating NDVI...
                </>
              ) : "Generate NDVI Overlay"}
            </button>
            
            <button 
              onClick={fetchTimeSeries} 
              disabled={loading || (!selectedField && !aoiCoordinates)} 
              className="timeseries-btn"
            >
              {loading ? (
                <>
                  <span className="loading"></span>
                  Processing...
                </>
              ) : "Show NDVI Time Series"}
            </button>
            
            {error && <p className="error-message">{error}</p>}
          </div>
        </div>
        
        {/* Map Section */}
        <div className="map-section">
          <MapContainer 
            center={[20.5937, 78.9629]} 
            zoom={5} 
            className="map-container"
            ref={mapRef}
          >
            <TileLayer
  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  attribution='&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
/>

            
            {/* Drawing controls */}
            <MapWithDraw 
              setAoiCoordinates={handleAoiChange} 
              drawingMode={drawingMode}
              setDrawingMode={setDrawingMode}
            />
            
            {/* Show polygon for selected field or drawn AOI */}
            {(selectedField?.geojson_data || aoiCoordinates) && (
              <Polygon 
                positions={polygonPositions} 
                pathOptions={{ 
                  color: selectedField ? "blue" : "red",
                  weight: 3,
                  fillOpacity: 0.2
                }} 
              />
            )}
            
            {/* Auto-center map on selected field */}
            {selectedField?.geojson_data?.coordinates[0] && (
              <MapCentering coordinates={selectedField.geojson_data.coordinates[0]} />
            )}
            
            {/* NDVI overlay */}
            {ndviUrl && <NDVITileLayer ndviUrl={ndviUrl} />}
          </MapContainer>
        </div>
      </div>
      
      {/* Enhanced Popup for Time Series and Weather Data */}
      {showPopup && (
        <div className="popup-container">
          <div className="popup-content">
            <button className="popup-close" onClick={() => setShowPopup(false)}>Close</button>
            
            <div className="popup-tabs">
              <button 
                className={`popup-tab ${activeTab === 'ndvi' ? 'active' : ''}`}
                onClick={() => setActiveTab('ndvi')}
              >
                NDVI Analysis
              </button>
              <button 
                className={`popup-tab ${activeTab === 'weather' ? 'active' : ''}`}
                onClick={() => setActiveTab('weather')}
              >
                Weather Data
              </button>
            </div>
            
            {activeTab === 'ndvi' ? (
              <div className="ndvi-content">
                <h3>NDVI Time Series</h3>
                {timeSeriesData.length > 0 ? (
                  <NDVITimeSeriesChart data={timeSeriesData} />
                ) : (
                  <p>No NDVI time series data available.</p>
                )}
              </div>
            ) : (
              <div className="weather-content">
                <h3>Weather Analysis</h3>
                {weatherData ? (
                  <WeatherChart data={weatherData} />
                ) : (
                  <p>Loading weather data...</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MonitorField;
