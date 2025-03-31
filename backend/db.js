const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",  
  user: "root",       
  password: "Reddy@0807",       
  database: "agriscope",
  port: 3307         // Change to match MySQL's running port
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
    return;
  }
  console.log("Connected to MySQL");
});

module.exports = db;
