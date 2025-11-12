const { Pool } = require("pg");
const dns = require("dns");

// Force IPv4 to avoid IPv6 issues on Render
dns.setDefaultResultOrder('ipv4first');

console.log("📊 Database Configuration:");
console.log("DATABASE_URL set:", process.env.DATABASE_URL ? "✓ Yes" : "✗ No");
console.log("NODE_ENV:", process.env.NODE_ENV);

// Create PostgreSQL connection pool with minimal config
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  // Conservative pooling settings
  max: 5,
  min: 1,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Better error handling on pool level
pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
});

// Test connection with retry logic
let connectionAttempts = 0;
const maxRetries = 3;

function testConnection() {
  connectionAttempts++;
  console.log(`\n🔄 Connection attempt ${connectionAttempts}/${maxRetries}...`);
  
  pool.connect((err, client, release) => {
    if (err) {
      console.error("❌ Database connection failed:", err.message);
      console.error("Error Code:", err.code);
      console.error("Error Address:", err.address);
      
      if (connectionAttempts < maxRetries) {
        console.log(`⏳ Retrying in 3 seconds...`);
        setTimeout(testConnection, 3000);
      } else {
        console.error("❌ Max connection attempts reached");
      }
      return;
    }
    
    console.log("✅ Connected to PostgreSQL!");
    release();
    createTables();
  });
}

// Start testing connection after a short delay
setTimeout(testConnection, 1000);

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
