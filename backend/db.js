const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "sql100.infinityfree.com",
  user: "if0_40109271",
  password: "offtherecord911",
  database: "if0_40109271_spots"
});

db.connect(err => {
  if (err) {
    console.error("MySQL connection error:", err.message);
    process.exit(1);
  }
  console.log("MySQL connected.");
});

module.exports = db;
