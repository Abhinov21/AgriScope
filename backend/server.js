const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

// Initialize database tables
require("./User"); // Create users table
require("./db"); // Create AOI table (already included in db.js)

const authRoutes = require("./routes/auth");
const aoiRoutes = require("./routes/aoi");
const weatherRoutes = require("./routes/weather");

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ CORS Configuration
const corsOptions = {
  origin: [
    'https://agriscope-frontend.onrender.com',
    'http://localhost:3000',
    'http://localhost:3001'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ✅ Routes
app.use("/auth", authRoutes); // Authentication routes
app.use("/api/fields", aoiRoutes); // AOI-related routes (Get/Post AOI data)
app.use("/api/weather", weatherRoutes); // Weather-related routes

// ✅ Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'production' ? {} : err
  });
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
