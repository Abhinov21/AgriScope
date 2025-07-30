import { useState } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer } from 'react-leaflet';
import MapWithDraw from './MapWithDraw';
import NDVITileLayer from './NDVITileLayer';
import '../styles/map.css';
import { getFlaskApiUrl } from '../config/api';

const MapComponent = () => {
  const [aoiCoordinates, setAoiCoordinates] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [ndviUrl, setNdviUrl] = useState('');
  const [error, setError] = useState('');

  // ✅ Validate input before submission
  const validateInput = () => {
    if (!aoiCoordinates || aoiCoordinates.length < 3) {
      setError('Please provide a valid AOI with at least three coordinates.');
      return false;
    }
    if (!startDate || !endDate) {
      setError('Please provide a valid date range.');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateInput()) return;

    // ✅ Build GeoJSON format
    const geoJSON = {
      type: 'Polygon',
      coordinates: [[...aoiCoordinates]], // Nested array format
    };

    console.log('Submitting NDVI request with:', {
      coordinates: geoJSON.coordinates[0],
      start_date: startDate,
      end_date: endDate,
    });

    try {
      setError('');
      const response = await axios.post(`${getFlaskApiUrl()}/process_ndvi`,
        {
          coordinates: geoJSON.coordinates[0],
          start_date: startDate,
          end_date: endDate,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('NDVI Response:', response);

      // ✅ Handle NDVI URL response
      const { tile_url } = response.data;
      if (tile_url) {
        console.log('NDVI Tile URL:', tile_url);
        setNdviUrl(tile_url);
      } else {
        setError('Failed to generate NDVI tiles.');
      }
    } catch (error) {
      console.error('Error fetching NDVI:', error);

      if (error.response) {
        console.error('Response Data:', error.response.data);
        setError(
          `Failed to fetch NDVI: ${error.response.data.error || 'Unknown error'}`
        );
      } else if (error.request) {
        setError('No response from server. Please check the backend.');
      } else {
        setError(`Request error: ${error.message}`);
      }
    }
  };

  return (
    <div className="map-component-container">
      {/* ✅ Map Container */}
      <MapContainer center={[20, 78]} zoom={5} className="map-container">
      <TileLayer
  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  attribution='&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
/>

        <MapWithDraw setAoiCoordinates={setAoiCoordinates} />
        {ndviUrl && <NDVITileLayer ndviUrl={ndviUrl} />}
      </MapContainer>

      {/* ✅ Date Inputs */}
      <div className="date-inputs">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="input-field"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="input-field"
        />
        <button className="submit-btn" onClick={handleSubmit}>
          Generate NDVI
        </button>
      </div>

      {/* ✅ Error Display */}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default MapComponent;
