const { Pool } = require("pg");

console.log("📊 Database Configuration:");
console.log("DATABASE_URL set:", process.env.DATABASE_URL ? "✓ Yes" : "✗ No");
console.log("NODE_ENV:", process.env.NODE_ENV);

// PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  family: 4, // force IPv4 to avoid ENETUNREACH errors
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 15000
});

// Handle unexpected pool errors
pool.on("error", (err) => {
  console.error("❌ Unexpected error on idle client", err);
});

// Test connection
async function testConnection() {
  try {
    console.log("\n🔄 Testing database connection...");
    const client = await pool.connect();
    console.log("✅ Connected to PostgreSQL!");
    client.release();
    await createTables();
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
    console.error("Error Code:", err.code);
    console.error("Error Address:", err.address);
  }
}

// Create Users Table
const createUserTable = `
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`;

// Create AOI Table
const createAOITable = `
CREATE TABLE IF NOT EXISTS aoi_plots (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  plot_name VARCHAR(255) NOT NULL,
  geojson_data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)`;

// Create tables
async function createTables() {
  try {
    await pool.query(createUserTable);
    console.log("Users table ready");

    await pool.query(createAOITable);
    console.log("AOI table ready");
  } catch (error) {
    console.error("Error creating tables:", error);
  }
}

// Start connection test
setTimeout(testConnection, 1000);

module.exports = pool;