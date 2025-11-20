const mysql = require("mysql2");

const db = mysql.createConnection({
  host: process.env.DB_HOST || "sql110.infinityfree.com",
  user: process.env.DB_USER || "if0_40468821",
  password: process.env.DB_PASSWORD || "Darkhawk25",
  database: process.env.DB_NAME || "if0_40468821_spots"
});

db.connect(err => {
  if (err) {
    console.error("MySQL connection error:", err.message);
    process.exit(1);
  }
  console.log("MySQL connected.");
});

module.exports = db;
