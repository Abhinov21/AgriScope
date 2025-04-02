// routes/aoi.js
const express = require("express");
const db = require("../db");
const router = express.Router();

// GET /api/fields?email=user@example.com
// Retrieves all fields (AOI data) for a given email.
router.get("/", (req, res) => {
  const email = req.query.email;
  if (!email) {
    return res.status(400).json({ message: "Email query parameter is required" });
  }

  // Query to get fields for the user with the provided email.
  const query = `
    SELECT a.id, a.plot_name, a.geojson_data, a.created_at 
    FROM aoi_plots a
    JOIN users u ON a.user_id = u.id 
    WHERE u.email = ?
  `;
  db.query(query, [email], (err, results) => {
    if (err) return res.status(500).json({ message: "Database error", error: err });
    res.status(200).json({ fields: results });
  });
});

// POST /api/fields
// Saves a new field (AOI) for the user identified by the provided email.
router.post("/", (req, res) => {
  const { email, plot_name, geojson_data } = req.body;
  if (!email || !plot_name || !geojson_data) {
    return res.status(400).json({ message: "Email, plot name, and AOI data are required." });
  }

  // First, retrieve the user id based on the provided email.
  const getUserQuery = "SELECT id FROM users WHERE email = ?";
  db.query(getUserQuery, [email], (err, results) => {
    if (err) return res.status(500).json({ message: "Database error", error: err });
    if (results.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user_id = results[0].id;
    const insertQuery = "INSERT INTO aoi_plots (user_id, plot_name, geojson_data) VALUES (?, ?, ?)";
    db.query(insertQuery, [user_id, plot_name, JSON.stringify(geojson_data)], (err) => {
      if (err) return res.status(500).json({ message: "Database error", error: err });
      res.status(201).json({ message: "Field saved successfully" });
    });
  });
});

module.exports = router;
