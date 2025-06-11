
import express from "express";
import connect from "./utils/connectDB.js"; // Import the DB connection function
import multer from "multer";
import path from "path";
import fs from "fs"
import { fileURLToPath } from "url";
import cors from 'cors';
import dotenv from "dotenv";

dotenv.config();
const PORT = process.env.PORT  // use actually available port from .env
const app = express();
app.use(express.json()); // Middleware for JSON parsing

app.use(cors({
  origin: 'http://localhost:5173', // Match this with your frontend URL (later)
  credentials: true
}));

// C. ######### Multer Konfiguration ############################################

// Pfad-Ermittlung für ES-Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create an "uploads" directory if it doesn't exist
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Multer Setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// Statische Route für Uploads, damit man Dateien öffentlich abrufen kann
app.use("/uploads", express.static(path.join(__dirname, "uploads")));



// Try connecting to MongoDB; start server anyway even if connection fails
connect(); // Connect to MongoDB

app.get("/", (req, res) => {
  res.send("Hello co-creator! Let's start building something great 🤓");
});

// ### POST /upload single file ###############################
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Keine Datei empfangen" });
  }

  res.json({
    message: "Datei erfolgreich hochgeladen!",
    filename: req.file.filename,
    url: `/uploads/${req.file.filename}`,
  });
});


// Error Middleware
app.use((err, req, res, next) => {
  console.error("❌ Error found:", err);
  res.sendStatus(500);
});


app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
