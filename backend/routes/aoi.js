// routes/aoi.js
const express = require("express");
const pool = require("../db");
const router = express.Router();

// GET /api/fields?email=user@example.com
// Retrieves all fields (AOI data) for a given email.
router.get("/", async (req, res) => {
  const email = req.query.email;
  if (!email) {
    return res.status(400).json({ message: "Email query parameter is required" });
  }

  try {
    // Query to get fields for the user with the provided email.
    const query = `
      SELECT a.id, a.plot_name, a.geojson_data, a.created_at 
      FROM aoi_plots a
      JOIN users u ON a.user_id = u.id 
      WHERE u.email = $1
    `;
    const result = await pool.query(query, [email]);
    res.status(200).json({ fields: result.rows });
  } catch (error) {
    console.error("Error fetching fields:", error);
    res.status(500).json({ message: "Database error", error: error.message });
  }
});

// POST /api/fields
// Saves a new field (AOI) for the user identified by the provided email.
router.post("/", async (req, res) => {
  const { email, plot_name, geojson_data } = req.body;
  if (!email || !plot_name || !geojson_data) {
    return res.status(400).json({ message: "Email, plot name, and AOI data are required." });
  }

  try {
    // First, retrieve the user id based on the provided email.
    const getUserQuery = "SELECT id FROM users WHERE email = $1";
    const userResult = await pool.query(getUserQuery, [email]);
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user_id = userResult.rows[0].id;
    const insertQuery = "INSERT INTO aoi_plots (user_id, plot_name, geojson_data) VALUES ($1, $2, $3) RETURNING id";
    const insertResult = await pool.query(insertQuery, [user_id, plot_name, geojson_data]);
    
    res.status(201).json({ 
      message: "Field saved successfully", 
      fieldId: insertResult.rows[0].id 
    });
  } catch (error) {
    console.error("Error saving field:", error);
    res.status(500).json({ message: "Database error", error: error.message });
  }
});

// DELETE /api/fields/:id
// Deletes a field by ID, after verifying the user has permission
router.delete("/:id", async (req, res) => {
  const fieldId = req.params.id;
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required for verification" });
  }

  try {
    // First verify the field belongs to the user with the provided email
    const verifyQuery = `
      SELECT a.id 
      FROM aoi_plots a
      JOIN users u ON a.user_id = u.id 
      WHERE a.id = $1 AND u.email = $2
    `;
    
    const verifyResult = await pool.query(verifyQuery, [fieldId, email]);
    
    if (verifyResult.rows.length === 0) {
      return res.status(403).json({ message: "Not authorized to delete this field or field not found" });
    }
    
    // If verification passes, delete the field
    const deleteQuery = "DELETE FROM aoi_plots WHERE id = $1";
    const deleteResult = await pool.query(deleteQuery, [fieldId]);
    
    if (deleteResult.rowCount === 0) {
      return res.status(404).json({ message: "Field not found" });
    }
    
    res.status(200).json({ message: "Field deleted successfully" });
  } catch (error) {
    console.error("Error deleting field:", error);
    res.status(500).json({ message: "Database error", error: error.message });
  }
});

// PUT /api/fields/:id
// Updates a field's name by ID, after verifying the user has permission
router.put("/:id", async (req, res) => {
  const fieldId = req.params.id;
  const { email, plot_name } = req.body;

  if (!email || !plot_name) {
    return res.status(400).json({ message: "Email and plot_name are required" });
  }

  try {
    // First verify the field belongs to the user with the provided email
    const verifyQuery = `
      SELECT a.id 
      FROM aoi_plots a
      JOIN users u ON a.user_id = u.id 
      WHERE a.id = $1 AND u.email = $2
    `;
    
    const verifyResult = await pool.query(verifyQuery, [fieldId, email]);
    
    if (verifyResult.rows.length === 0) {
      return res.status(403).json({ message: "Not authorized to update this field or field not found" });
    }
    
    // If verification passes, update the field name
    const updateQuery = "UPDATE aoi_plots SET plot_name = $1 WHERE id = $2";
    const updateResult = await pool.query(updateQuery, [plot_name, fieldId]);
    
    if (updateResult.rowCount === 0) {
      return res.status(404).json({ message: "Field not found" });
    }
    
    res.status(200).json({ message: "Field updated successfully" });
  } catch (error) {
    console.error("Error updating field:", error);
    res.status(500).json({ message: "Database error", error: error.message });
  }
});

module.exports = router;
