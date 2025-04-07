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

// DELETE /api/fields/:id
// Deletes a field by ID, after verifying the user has permission
router.delete("/:id", (req, res) => {
  const fieldId = req.params.id;
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required for verification" });
  }

  // First verify the field belongs to the user with the provided email
  const verifyQuery = `
    SELECT a.id 
    FROM aoi_plots a
    JOIN users u ON a.user_id = u.id 
    WHERE a.id = ? AND u.email = ?
  `;
  
  db.query(verifyQuery, [fieldId, email], (err, results) => {
    if (err) return res.status(500).json({ message: "Database error", error: err });
    
    if (results.length === 0) {
      return res.status(403).json({ message: "Not authorized to delete this field or field not found" });
    }
    
    // If verification passes, delete the field
    const deleteQuery = "DELETE FROM aoi_plots WHERE id = ?";
    db.query(deleteQuery, [fieldId], (err, results) => {
      if (err) return res.status(500).json({ message: "Database error", error: err });
      
      if (results.affectedRows === 0) {
        return res.status(404).json({ message: "Field not found" });
      }
      
      res.status(200).json({ message: "Field deleted successfully" });
    });
  });
});

// PUT /api/fields/:id
// Updates a field's name by ID, after verifying the user has permission
router.put("/:id", (req, res) => {
  const fieldId = req.params.id;
  const { email, plot_name } = req.body;

  if (!email || !plot_name) {
    return res.status(400).json({ message: "Email and plot_name are required" });
  }

  // First verify the field belongs to the user with the provided email
  const verifyQuery = `
    SELECT a.id 
    FROM aoi_plots a
    JOIN users u ON a.user_id = u.id 
    WHERE a.id = ? AND u.email = ?
  `;
  
  db.query(verifyQuery, [fieldId, email], (err, results) => {
    if (err) return res.status(500).json({ message: "Database error", error: err });
    
    if (results.length === 0) {
      return res.status(403).json({ message: "Not authorized to update this field or field not found" });
    }
    
    // If verification passes, update the field name
    const updateQuery = "UPDATE aoi_plots SET plot_name = ? WHERE id = ?";
    db.query(updateQuery, [plot_name, fieldId], (err, results) => {
      if (err) return res.status(500).json({ message: "Database error", error: err });
      
      if (results.affectedRows === 0) {
        return res.status(404).json({ message: "Field not found" });
      }
      
      res.status(200).json({ message: "Field renamed successfully" });
    });
  });
});

module.exports = router;
