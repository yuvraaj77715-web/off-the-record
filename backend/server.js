// --------------------
// Required Modules
// --------------------
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("./db");
const fs = require("fs").promises;
const path = require("path");
const mm = require("music-metadata");
const { spawn } = require("child_process");
require("dotenv").config(); // Load .env

// --------------------
// App Setup
// --------------------
const app = express();

// CORS configuration for split deployment (frontend on InfinityFree, backend on Railway)
const corsOptions = {
  origin: [
    'https://off-the-record.42web.io',  // InfinityFree frontend
    'http://off-the-record.42web.io',   // HTTP fallback
    'http://localhost:3000',             // Local development
    'http://localhost:5500',             // Live Server
    'http://127.0.0.1:5500'              // Live Server alternative
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(bodyParser.json());

// --------------------
// Config
// --------------------
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_changeme";
const musicFolder = path.join(__dirname, "music");

// Serve local music folder
app.use("/music", express.static(musicFolder));

// Health check endpoint for Railway
app.get("/", (req, res) => {
  res.json({
    status: "OK",
    message: "Off The Record API is running",
    timestamp: new Date().toISOString()
  });
});

// --------------------
// Utility
// --------------------
function send(res, status, success, message) {
  return res.status(status).json({ success, message });
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token)
    return res
      .status(401)
      .json({ success: false, message: "No token provided" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err)
      return res
        .status(403)
        .json({ success: false, message: "Invalid or expired token" });

    req.user = user;
    next();
  });
}

// --------------------
// Auth Routes
// --------------------
app.post("/signup", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return send(res, 400, false, "Missing username or password");

    db.query(
      "SELECT id FROM users WHERE username = ?",
      [username],
      async (err, rows) => {
        if (err) return send(res, 500, false, "DB error: " + err.message);
        if (rows.length > 0)
          return send(res, 400, false, "Username already exists");

        const hashed = await bcrypt.hash(password, 10);

        db.query(
          "INSERT INTO users (username, password) VALUES (?, ?)",
          [username, hashed],
          (err2) => {
            if (err2) return send(res, 500, false, "DB error: " + err2.message);
            return send(res, 201, true, "Signup successful");
          }
        );
      }
    );
  } catch (e) {
    return send(res, 500, false, "Server error: " + e.message);
  }
});

app.post("/login", (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return send(res, 400, false, "Missing username or password");

    db.query(
      "SELECT * FROM users WHERE username = ?",
      [username],
      async (err, rows) => {
        if (err) return send(res, 500, false, "DB error: " + err.message);
        if (rows.length === 0)
          return send(res, 401, false, "Invalid username or password");

        const user = rows[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match)
          return send(res, 401, false, "Invalid username or password");

        const accessToken = jwt.sign(
          { id: user.id, username: user.username },
          JWT_SECRET,
          { expiresIn: "24h" }
        );

        res.json({
          success: true,
          message: "Login successful",
          token: accessToken,
        });
      }
    );
  } catch (e) {
    return send(res, 500, false, "Server error: " + e.message);
  }
});

// --------------------
// Local Song Scanner
// --------------------
app.get("/songs", async (req, res) => {
  try {
    const files = await fs.readdir(musicFolder);

    const audioFiles = files.filter((file) =>
      [".mp3", ".wav", ".flac"].includes(path.extname(file).toLowerCase())
    );

    const songs = await Promise.all(
      audioFiles.map(async (file) => {
        const filePath = path.join(musicFolder, file);
        const metadata = await mm.parseFile(filePath, { duration: true });

        return {
          title:
            metadata.common.title ||
            path.basename(file, path.extname(file)) ||
            "Unknown Title",
          artist: metadata.common.artist || "Unknown Artist",
          duration: metadata.format.duration || 0,
          file: `/music/${file}`,
        };
      })
    );

    res.json(songs);
  } catch (err) {
    console.error("Error reading music folder:", err);
    res.status(500).json({ error: "Failed to read songs" });
  }
});

// --------------------
// Like System
// --------------------
app.get("/liked-songs", authenticateToken, (req, res) => {
  const userId = req.user.id;

  const sql = `
    SELECT s.video_id, s.title, s.artist, s.thumbnail_url 
    FROM songs s
    JOIN liked_songs ls ON s.id = ls.song_id
    WHERE ls.user_id = ?
    ORDER BY ls.created_at DESC
  `;

  db.query(sql, [userId], (err, songs) => {
    if (err)
      return send(res, 500, false, "Database error fetching liked songs");

    res.json({ success: true, songs });
  });
});

app.post("/like-song", authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { videoId, title, artist, thumbnail } = req.body;

  if (!videoId) return send(res, 400, false, "Missing videoId");

  // Insert or update song info
  const songQuery =
    "INSERT INTO songs (video_id, title, artist, thumbnail_url) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)";

  db.query(
    songQuery,
    [videoId, title, artist, thumbnail],
    (err, result) => {
      if (err) return send(res, 500, false, "Error saving song details");

      const songId = result.insertId;

      const likeQuery =
        "INSERT IGNORE INTO liked_songs (user_id, song_id) VALUES (?, ?)";

      db.query(likeQuery, [userId, songId], (err2) => {
        if (err2) return send(res, 500, false, "Error liking song");

        send(res, 200, true, "Song liked successfully");
      });
    }
  );
});

// --------------------
// YouTube Streaming (yt-dlp)
// --------------------
app.post("/stream", (req, res) => {
  const { url } = req.body;
  if (!url) return send(res, 400, false, "Missing YouTube URL");

  const ytdlp = spawn("yt-dlp", ["-f", "bestaudio/best", "--print-json", url]);

  let jsonData = "";
  let errorData = "";

  ytdlp.stdout.on("data", (data) => (jsonData += data.toString()));
  ytdlp.stderr.on("data", (data) => (errorData += data.toString()));

  ytdlp.on("close", (code) => {
    if (code !== 0) {
      console.error("yt-dlp error:", errorData);
      return send(res, 500, false, "yt-dlp failed.");
    }

    try {
      const metadata = JSON.parse(jsonData);
      if (!metadata.url)
        return send(res, 404, false, "No direct audio URL found.");

      res.json({
        success: true,
        audioUrl: metadata.url,
        videoId: metadata.id,
        title: metadata.title || "Unknown Title",
        artist: metadata.artist || metadata.uploader || "Unknown Artist",
        thumbnail: metadata.thumbnail || null,
      });
    } catch (e) {
      console.error("JSON Parse error:", e);
      return send(res, 500, false, "Failed to parse yt-dlp output.");
    }
  });
});

// --------------------
// Start Server
// --------------------
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
