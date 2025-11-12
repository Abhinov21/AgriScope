const { Pool } = require("pg");

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection
pool.connect((err, client, release) => {
  if (err) {
    console.error("❌ Database connection failed:", err.message);
    console.error("DATABASE_URL:", process.env.DATABASE_URL ? "✓ Set" : "✗ Not set");
    return;
  }
  console.log("✅ Connected to PostgreSQL");
  release();
});

// Create Users Table (PostgreSQL syntax)
const createUserTable = `CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`;

// Create AOI Table (PostgreSQL syntax)
const createAOITable = `CREATE TABLE IF NOT EXISTS aoi_plots (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  plot_name VARCHAR(255) NOT NULL,
  geojson_data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)`;

// Create tables sequentially to ensure proper foreign key setup
async function createTables() {
  try {
    // Create users table first
    await pool.query(createUserTable);
    console.log("Users table ready");
    
    // Then create AOI table
    await pool.query(createAOITable);
    console.log("AOI table ready");
  } catch (error) {
    console.error("Error creating tables:", error);
  }
}

// Initialize tables
createTables();

module.exports = pool;
