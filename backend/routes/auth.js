const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db");
require("dotenv").config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// 🔹 Register User
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    console.log("Registration attempt for:", email);
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id";

    const result = await pool.query(query, [username, email, hashedPassword]);
    
    if (result.rows.length > 0) {
      res.status(201).json({ 
        message: "User registered successfully!",
        userId: result.rows[0].id 
      });
    } else {
      res.status(500).json({ message: "Registration failed" });
    }
  } catch (error) {
    console.error("Registration error:", error);
    if (error.code === "23505") { // PostgreSQL unique violation
      return res.status(400).json({ message: "User already exists" });
    }
    res.status(500).json({ message: "Internal server error" });
  }
});

// 🔹 Login User
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const query = "SELECT * FROM users WHERE email = $1";
    const result = await pool.query(query, [email]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = result.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "1h" });
    res.status(200).json({ 
      message: "Login successful!", 
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
