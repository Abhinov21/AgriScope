const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",  
  user: "root",       
  password: "root",       
  database: "agriscope",
  port: 3307         
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
    return;
  }
  console.log("Connected to MySQL");
});

// Create AOI Table
const createAOITable = `CREATE TABLE IF NOT EXISTS aoi_plots (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  plot_name VARCHAR(255) NOT NULL,
  geojson_data JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)`;

db.query(createAOITable, (err) => {
  if (err) {
    console.error("Error creating AOI table:", err);
  } else {
    console.log("AOI table ready");
  }
});

module.exports = db;
