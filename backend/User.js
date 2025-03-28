const db = require("../db");

const createUserTable = `CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL
)`;

db.query(createUserTable, (err) => {
  if (err) {
    console.error("Error creating users table:", err);
  } else {
    console.log("Users table ready");
  }
});

module.exports = db;