// src/pages/MonitorField.js
import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Polygon, useMap } from "react-leaflet";
import L from "leaflet"; // Import Leaflet for bounds calculation
import MapWithDraw from "../components/MapWithDraw";
import LocationSearch from "../components/LocationSearch";
import NDVITileLayer from "../components/NDVITileLayer";
import axios from "axios";
import FieldList from "../components/FieldList";
import DateRangePicker from "../components/DateRangePicker";
import NDVITimeSeriesChart from "../components/NDVITimeSeriesChart";
import WeatherChart from "../components/WeatherChart";
import { getApiUrl, getFlaskApiUrl } from "../config/api";
import "../styles/monitorField.css";
import { useNavigate } from "react-router-dom";

// Utility function to calculate polygon area using Shoelace formula
const calculatePolygonArea = (coordinates) => {
  if (!coordinates || coordinates.length < 3) return 0;
  
  let area = 0;
  const n = coordinates.length;
  
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += coordinates[i][0] * coordinates[j][1];
    area -= coordinates[j][0] * coordinates[i][1];
  }
  
  area = Math.abs(area) / 2;
  
  // Convert from decimal degrees to hectares (more accurate conversion)
  // Using Haversine-based approximation: 1 degree ≈ 111 km at equator
  // 1 square degree ≈ 12,321 km² ≈ 1,232,100 hectares
  const areaHectares = area * 1232100;
  
  return areaHectares;
};

// Enhanced component to center and zoom map on field coordinates
const MapCentering = ({ coordinates }) => {
  const map = useMap();

  useEffect(() => {
    if (coordinates && coordinates.length > 0) {
      try {
        // Convert coordinates to Leaflet LatLng format [lat, lng]
        const latLngs = coordinates.map(coord => [coord[1], coord[0]]);
        
        // Create bounds object from the field coordinates
        const bounds = L.latLngBounds(latLngs);
        
        // Calculate field dimensions for dynamic padding
        const fieldAreaHectares = calculatePolygonArea(coordinates);
        
        // Dynamic padding based on field size for optimal viewing
        // Much higher padding for 1:3 to 1:4 field-to-map ratio
        let paddingFactor;
        let maxZoom;
        
        if (fieldAreaHectares < 0.5) { // Very tiny field (< 0.5 hectare - garden plots)
          paddingFactor = 3.5; // 350% padding - field takes ~1/4 of view
          maxZoom = 14; // Very conservative zoom
        } else if (fieldAreaHectares < 2) { // Small field (0.5-2 hectares - small plots)
          paddingFactor = 3.0; // 300% padding - field takes ~1/4 of view
          maxZoom = 14; // Very conservative zoom
        } else if (fieldAreaHectares < 5) { // Small-medium field (2-5 hectares)
          paddingFactor = 2.8; // 280% padding - field takes ~1/3 of view
          maxZoom = 15; // Conservative zoom
        } else if (fieldAreaHectares < 15) { // Medium field (5-15 hectares)
          paddingFactor = 2.5; // 250% padding - field takes ~1/3 of view
          maxZoom = 15; // Conservative zoom
        } else if (fieldAreaHectares < 30) { // Medium-large field (15-30 hectares) - your border issue range
          paddingFactor = 2.2; // 220% padding - field takes ~1/3 of view
          maxZoom = 15; // Keep very conservative for border clarity
        } else if (fieldAreaHectares < 60) { // Large field (30-60 hectares)
          paddingFactor = 2.0; // 200% padding - field takes ~1/3 of view
          maxZoom = 16; // Allow slightly more zoom
        } else if (fieldAreaHectares < 100) { // Very large field (60-100 hectares)
          paddingFactor = 1.8; // 180% padding - field takes ~1/3 of view
          maxZoom = 16; // Good zoom level
        } else if (fieldAreaHectares < 300) { // Huge field (100-300 hectares)
          paddingFactor = 1.5; // 150% padding - field takes ~1/2 of view
          maxZoom = 17; // More zoom for larger fields
        } else { // Massive agricultural field (300+ hectares)
          paddingFactor = 1.2; // 120% padding - field takes ~1/2 of view
          maxZoom = 18; // Full zoom available
        }
        
        // Calculate dynamic padding based on map container size
        const mapContainer = map.getContainer();
        const containerWidth = mapContainer.clientWidth;
        const containerHeight = mapContainer.clientHeight;
        
        const paddingX = Math.floor(containerWidth * paddingFactor / 2);
        const paddingY = Math.floor(containerHeight * paddingFactor / 2);
        
        // Fit bounds with animation and dynamic padding
        map.fitBounds(bounds, {
          padding: [paddingY, paddingX], // [top/bottom, left/right]
          maxZoom: maxZoom, // Dynamic zoom limit based on field size
          animate: true, // Smooth animation
          duration: 1.2 // Animation duration in seconds
        });
        
        console.log(`📍 Map centered on field:`, {
          area: `${fieldAreaHectares.toFixed(2)} hectares`,
          padding: `${paddingFactor * 100}%`,
          maxZoom: maxZoom,
          bounds: bounds.toBBoxString()
        });
        
      } catch (error) {
        console.error('Error centering map on field:', error);
        
        // Fallback: Simple center calculation if bounds fail
        const centerLat = coordinates.reduce((sum, coord) => sum + coord[1], 0) / coordinates.length;
        const centerLng = coordinates.reduce((sum, coord) => sum + coord[0], 0) / coordinates.length;
        
        // Choose fallback zoom based on field size with very conservative levels
        const fieldAreaHectares = calculatePolygonArea(coordinates);
        let fallbackZoom;
        if (fieldAreaHectares < 2) {
          fallbackZoom = 13; // Very small fields - much more conservative
        } else if (fieldAreaHectares < 15) {
          fallbackZoom = 12; // Small-medium fields  
        } else if (fieldAreaHectares < 30) {
          fallbackZoom = 11; // Medium fields (your range) - very conservative
        } else if (fieldAreaHectares < 100) {
          fallbackZoom = 10; // Large fields
        } else {
          fallbackZoom = 9; // Very large fields
        }
        
        map.setView([centerLat, centerLng], fallbackZoom, {
          animate: true,
          duration: 1.2
        });
      }
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

  // Vegetation Index state (generalized from NDVI)
  const [selectedIndex, setSelectedIndex] = useState("NDVI");
  const [indexTileUrl, setIndexTileUrl] = useState("");
  const [timeSeriesData, setTimeSeriesData] = useState([]);
  const [availableIndices, setAvailableIndices] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [activeTab, setActiveTab] = useState("analysis");

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

  // Fetch available vegetation indices from backend
  const fetchAvailableIndices = async () => {
    try {
      const response = await axios.get(`${getFlaskApiUrl()}/api/indices/list`);
      setAvailableIndices(response.data.indices);
    } catch (err) {
      console.error("Error fetching available indices:", err);
      // Fallback to default indices if API fails
      setAvailableIndices({
        'NDVI': { name: 'Normalized Difference Vegetation Index' },
        'EVI': { name: 'Enhanced Vegetation Index' },
        'SAVI': { name: 'Soil-Adjusted Vegetation Index' },
        'ARVI': { name: 'Atmospherically Resistant Vegetation Index' },
        'MAVI': { name: 'Moisture-Adjusted Vegetation Index' },
        'SR': { name: 'Simple Ratio' }
      });
    }
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

      const response = await axios.get(`${getApiUrl()}/api/fields?email=${email}`);

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
    fetchAvailableIndices(); // Load available vegetation indices

    // Load previously drawn AOI if available (user-specific)
    const userEmail = getUserEmail();
    if (userEmail) {
      const aoiKey = `aoi_${userEmail}`;
      const savedAoi = localStorage.getItem(aoiKey);
      if (savedAoi) {
        try {
          setAoiCoordinates(JSON.parse(savedAoi));
        } catch (err) {
          console.error("Error parsing saved AOI:", err);
        }
      }
    }
  }, []);

  // Handle AOI drawing
  const handleAoiChange = (coords) => {
    // Clear selected field when drawing new AOI
    setSelectedField(null);
    setAoiCoordinates(coords);
    
    // Save AOI with user-specific key
    const userEmail = getUserEmail();
    if (userEmail) {
      const aoiKey = `aoi_${userEmail}`;
      localStorage.setItem(aoiKey, JSON.stringify(coords));
    }
    
    showNotification("Field area drawn. You can now save this field.");
    setDrawingMode(false);
  };

  // Enable drawing mode
  const enableDrawMode = () => {
    setSelectedField(null);
    setAoiCoordinates(null);
    
    // Clear any previously saved AOI for this user
    const userEmail = getUserEmail();
    if (userEmail) {
      const aoiKey = `aoi_${userEmail}`;
      localStorage.removeItem(aoiKey);
    }
    
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

      const response = await axios.post(`${getApiUrl()}/api/fields`, {
        email: email,
        plot_name: fieldName,
        geojson_data: { type: "Polygon", coordinates: [aoiCoordinates] },
      });

      showNotification(response.data.message || "Field saved successfully");

      // Clear the current AOI after saving (both state and localStorage)
      setAoiCoordinates(null);
      const userEmail = getUserEmail();
      if (userEmail) {
        const aoiKey = `aoi_${userEmail}`;
        localStorage.removeItem(aoiKey);
      }

      // Refresh fields list
      await fetchFields();
    } catch (err) {
      console.error("Error saving field:", err);
      showNotification(`Failed to save field: ${err.message || "Unknown error"}`, true);
    } finally {
      setLoading(false);
    }
  };

  // Select field callback with enhanced feedback
  const handleFieldSelect = (field) => {
    setSelectedField(field);
    // Clear any drawn AOI when a saved field is selected (both state and localStorage)
    setAoiCoordinates(null);
    const userEmail = getUserEmail();
    if (userEmail) {
      const aoiKey = `aoi_${userEmail}`;
      localStorage.removeItem(aoiKey);
    }
    setDrawingMode(false);
    
    // Clear any existing vegetation index data when switching fields
    setIndexTileUrl("");
    setTimeSeriesData([]);
    setWeatherData(null);
    
    // Calculate and display field information
    if (field.geojson_data?.coordinates?.[0]) {
      const areaHectares = calculatePolygonArea(field.geojson_data.coordinates[0]);
      
      showNotification(
        `📍 Selected "${field.plot_name}" - Area: ${areaHectares.toFixed(2)} hectares. Map centering...`
      );
      
      console.log(`Selected field details:`, {
        name: field.plot_name,
        area: `${areaHectares.toFixed(2)} hectares`,
        coordinates: field.geojson_data.coordinates[0].length + ' points'
      });
    } else {
      showNotification(`📍 Selected "${field.plot_name}"`);
    }
  };

  // Delete field callback
  const handleFieldDelete = async (fieldId) => {
    try {
      const email = getUserEmail();
      if (!email) return;

      setLoading(true);

      const response = await axios.delete(`${getApiUrl()}/api/fields/${fieldId}`, {
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

      const response = await axios.put(`${getApiUrl()}/api/fields/${fieldId}`, {
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

      const response = await axios.delete(`${getApiUrl()}/api/fields/${fieldId}`, {
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

      const response = await axios.put(`${getApiUrl()}/api/fields/${fieldId}`, {
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

  // Generate vegetation index overlay (generalized from NDVI)
  const handleSubmitAnalysis = async () => {
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

      const response = await axios.post(`${getFlaskApiUrl()}/api/indices/calculate`, {
        coordinates: geoJSON.coordinates[0],
        start_date: startDate.toISOString().split("T")[0],
        end_date: endDate.toISOString().split("T")[0],
        index_name: selectedIndex,
      });

      const { tile_url } = response.data;
      if (tile_url) {
        setIndexTileUrl(tile_url);
        showNotification(`${selectedIndex} overlay generated successfully`);
      } else {
        showNotification(`Failed to generate ${selectedIndex} tiles: No URL returned`, true);
      }
    } catch (err) {
      console.error(`Error fetching ${selectedIndex}:`, err);
      showNotification(`Failed to fetch ${selectedIndex} data: ${err.message || "Unknown error"}`, true);
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
      
      const response = await axios.post(`${getApiUrl()}/api/weather/data`, {
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

  // Fetch vegetation index time series data (generalized)
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

      const response = await axios.post(`${getFlaskApiUrl()}/api/indices/timeseries`, {
        coordinates: geoJSON.coordinates[0],
        start_date: startDate.toISOString().split("T")[0],
        end_date: endDate.toISOString().split("T")[0],
        index_name: selectedIndex,
      });

      setTimeSeriesData(response.data.time_series);
      
      // Also fetch weather data
      await fetchWeatherData();
      
      setShowPopup(true);
      showNotification(`${selectedIndex} time series data generated successfully`);
    } catch (err) {
      console.error(`Error fetching ${selectedIndex} time series:`, err);
      showNotification(`Failed to fetch ${selectedIndex} time series: ${err.message || "Unknown error"}`, true);
    } finally {
      setLoading(false);
    }
  };

  // Convert coordinates for display
  const polygonPositions = (selectedField?.geojson_data?.coordinates[0] || aoiCoordinates)
    ? (selectedField?.geojson_data?.coordinates[0] || aoiCoordinates).map(coord => [coord[1], coord[0]])
    : [];

  // Calculate current field area for display
  const getCurrentFieldArea = () => {
    if (selectedField?.geojson_data?.coordinates?.[0]) {
      const areaHectares = calculatePolygonArea(selectedField.geojson_data.coordinates[0]);
      return areaHectares.toFixed(2);
    }
    if (aoiCoordinates) {
      const areaHectares = calculatePolygonArea(aoiCoordinates);
      return areaHectares.toFixed(2);
    }
    return null;
  };

  return (
    <div className="monitor-field-page">
      {/* Page Header */}
      <div className="monitor-header">
        <h1 className="page-title">Monitor Your Fields</h1>
        <p className="page-subtitle">
          Track field health, analyze NDVI data, and monitor weather patterns for data-driven farming decisions
        </p>
      </div>

      {/* Main Content Grid */}
      <div className="monitor-content">
        {/* Sidebar */}
        <div className="monitor-sidebar">
          <div className="sidebar-section">
            <h3>📍 Field Management</h3>
            <FieldList 
              fields={fields} 
              selectedField={selectedField}
              onFieldSelect={handleFieldSelect}
              onFieldDelete={handleFieldDelete}
              onFieldRename={handleFieldRename}
            />
            
            {/* Field Action Button */}
            {aoiCoordinates && !selectedField ? (
              <button onClick={saveField} disabled={loading} className="action-btn save-btn">
                {loading ? (
                  <>
                    <span className="loading-spinner"></span>
                    Saving...
                  </>
                ) : "💾 Save Field"}
              </button>
            ) : (
              <button onClick={enableDrawMode} disabled={loading || drawingMode} className="action-btn create-btn">
                {drawingMode ? "✏️ Drawing Active" : "🗺️ Draw New Field"}
              </button>
            )}
          </div>

          <div className="sidebar-section">
            <h3>📅 Analysis Period</h3>
            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              onStartChange={setStartDate}
              onEndChange={setEndDate}
            />
          </div>

          <div className="sidebar-section">
            <h3>🌱 Vegetation Index Selection</h3>
            <div className="index-selector">
              <label htmlFor="index-select">Choose Index:</label>
              <select 
                id="index-select"
                value={selectedIndex}
                onChange={(e) => setSelectedIndex(e.target.value)}
                className="index-dropdown"
              >
                {Object.entries(availableIndices).map(([key, index]) => (
                  <option key={key} value={key}>
                    {key} - {index.name}
                  </option>
                ))}
              </select>
              <div className="index-description">
                {availableIndices[selectedIndex]?.description && (
                  <p className="description-text">
                    💡 {availableIndices[selectedIndex].description}
                  </p>
                )}
                {availableIndices[selectedIndex]?.optimal_range && (
                  <p className="range-text">
                    📊 Optimal range: {availableIndices[selectedIndex].optimal_range[0]} - {availableIndices[selectedIndex].optimal_range[1]}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="sidebar-section">
            <h3>🛰️ Satellite Analysis</h3>
            <button 
              onClick={handleSubmitAnalysis} 
              disabled={loading || (!selectedField && !aoiCoordinates)} 
              className="analysis-btn ndvi-btn"
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  Generating...
                </>
              ) : `📊 Generate ${selectedIndex} Overlay`}
            </button>
            
            <button 
              onClick={fetchTimeSeries} 
              disabled={loading || (!selectedField && !aoiCoordinates)} 
              className="analysis-btn timeseries-btn"
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  Processing...
                </>
              ) : "📈 Show Time Series"}
            </button>
          </div>

          {/* Field Information */}
          {(selectedField || aoiCoordinates) && (
            <div className="sidebar-section">
              <h3>ℹ️ Field Details</h3>
              <div className="field-info-card">
                <div className="field-name">
                  📍 {selectedField ? selectedField.plot_name : "New Field"}
                </div>
                <div className="field-area">
                  Area: <strong>{getCurrentFieldArea()} hectares</strong>
                </div>
                <div className="field-status-container">
                  Status: 
                  {selectedField && (
                    <span className="field-status selected">Selected</span>
                  )}
                  {!selectedField && aoiCoordinates && (
                    <span className="field-status drawn">Drawn - Ready to Save</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="sidebar-section">
              <div className="error-message">{error}</div>
            </div>
          )}
        </div>
        
        {/* Map Section */}
        <div className="monitor-main">
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

            {/* Location Search Component */}
            <LocationSearch />
            
            {/* Drawing controls */}
            <MapWithDraw 
              setAoiCoordinates={handleAoiChange} 
              drawingMode={drawingMode}
              setDrawingMode={setDrawingMode}
            />
            
            {/* Enhanced polygon display for selected field or drawn AOI */}
            {(selectedField?.geojson_data || aoiCoordinates) && (
              <Polygon 
                positions={polygonPositions} 
                pathOptions={{ 
                  color: selectedField ? "#2563eb" : "#dc2626", // Blue for selected, red for drawn
                  weight: selectedField ? 3 : 2,
                  fillOpacity: selectedField ? 0.15 : 0.1,
                  dashArray: selectedField ? null : "5, 10" // Dashed line for drawn fields
                }} 
              />
            )}
            
            {/* Auto-center map on selected field */}
            {selectedField?.geojson_data?.coordinates[0] && (
              <MapCentering coordinates={selectedField.geojson_data.coordinates[0]} />
            )}
            
            {/* Vegetation Index overlay (generalized from NDVI) */}
            {indexTileUrl && <NDVITileLayer ndviUrl={indexTileUrl} />}
          </MapContainer>
        </div>
      </div>
      
      {/* Enhanced Popup for Time Series and Weather Data */}
      {showPopup && (
        <div className="popup-container">
          <div className="popup-content">
            <button className="popup-close" onClick={() => setShowPopup(false)}>
              ✕ Close
            </button>
            
            <div className="popup-tabs">
              <button 
                className={`popup-tab ${activeTab === 'analysis' ? 'active' : ''}`}
                onClick={() => setActiveTab('analysis')}
              >
                📊 {selectedIndex} Analysis
              </button>
              <button 
                className={`popup-tab ${activeTab === 'weather' ? 'active' : ''}`}
                onClick={() => setActiveTab('weather')}
              >
                🌤️ Weather Data
              </button>
            </div>
            
            <div className="popup-content-body">
              {activeTab === 'analysis' ? (
                <div className="analysis-content">
                  <h3>{selectedIndex} Time Series Analysis</h3>
                  {timeSeriesData.length > 0 ? (
                    <NDVITimeSeriesChart 
                      data={timeSeriesData} 
                      indexName={selectedIndex}
                      indexInfo={availableIndices[selectedIndex]}
                    />
                  ) : (
                    <p className="no-data">No {selectedIndex} time series data available for the selected period.</p>
                  )}
                </div>
              ) : (
                <div className="weather-content">
                  <h3>Weather Analysis</h3>
                  {weatherData ? (
                    <WeatherChart data={weatherData} />
                  ) : (
                    <p className="loading-data">Loading weather data...</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonitorField;
