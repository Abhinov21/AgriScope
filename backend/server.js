const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();
const authRoutes = require("./auth");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors()); // Allow cross-origin requests
app.use(bodyParser.json()); // Parse JSON bodies

// Routes
app.use("/auth", authRoutes); // Use auth routes for all /auth requests

// Start server
app.listen(5000, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
