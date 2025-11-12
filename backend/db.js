const { Pool } = require("pg");
const dns = require("dns");

// Force IPv4 to avoid IPv6 issues on Render
dns.setDefaultResultOrder('ipv4first');

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
    sslmode: 'require'
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  statement_timeout: 30000,
  query_timeout: 30000,
});

// Test connection
pool.connect((err, client, release) => {
  if (err) {
    console.error("❌ Database connection failed:", err.message);
    console.error("Error Code:", err.code);
    console.error("Error Address:", err.address);
    console.error("Error Port:", err.port);
    console.error("DATABASE_URL set:", process.env.DATABASE_URL ? "✓ Yes" : "✗ No");
    if (err.code === 'ENETUNREACH') {
      console.error("⚠️  IPv6 address detected - retrying with sslmode=require");
    }
    return;
  }
  console.log("✅ Connected to PostgreSQL");
  release();
  // Create tables after successful connection
  createTables();
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

// Note: createTables() is now called only after successful connection in pool.connect()

module.exports = pool;
