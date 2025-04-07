// backend/routes/weather.js
const express = require('express');
const axios = require('axios');
const router = express.Router();

// GET /api/weather - Fetches weather data from NASA POWER API
router.post('/data', async (req, res) => {
  try {
    const { coordinates, start_date, end_date } = req.body;
    
    if (!coordinates || !start_date || !end_date) {
      return res.status(400).json({ message: 'Coordinates and date range are required' });
    }
    
    // Extract center point of field for weather data
    const centerLng = coordinates.reduce((sum, coord) => sum + coord[0], 0) / coordinates.length;
    const centerLat = coordinates.reduce((sum, coord) => sum + coord[1], 0) / coordinates.length;
    
    // Format dates for NASA POWER API (YYYYMMDD format)
    const formattedStartDate = start_date.replace(/-/g, '');
    const formattedEndDate = end_date.replace(/-/g, '');
    
    // Parameters to fetch: temperature, precipitation, humidity, solar radiation
    const parameters = 'T2M,T2M_MAX,T2M_MIN,PRECTOTCORR,RH2M,ALLSKY_SFC_SW_DWN';
    
    const powerApiUrl = `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=${parameters}&community=AG&longitude=${centerLng}&latitude=${centerLat}&start=${formattedStartDate}&end=${formattedEndDate}&format=JSON`;
    
    const response = await axios.get(powerApiUrl);
    
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching weather data:', error);
    res.status(500).json({ message: 'Failed to fetch weather data', error: error.message });
  }
});

module.exports = router;