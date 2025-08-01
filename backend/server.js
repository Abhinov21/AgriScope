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

// ✅ Middleware
app.use(cors());
app.use(bodyParser.json());

// ✅ Routes
app.use("/auth", authRoutes); // Authentication routes
app.use("/api/fields", aoiRoutes); // AOI-related routes (Get/Post AOI data)
app.use("/api/weather", weatherRoutes); // Weather-related routes

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
