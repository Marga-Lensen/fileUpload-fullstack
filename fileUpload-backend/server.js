import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import connect from "./utils/connectDB.js"; // DB-Verbindung

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Pfad-Ermittlung für ES-Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Stelle sicher, dass der uploads-Ordner existiert (einmalig erstellen, falls nötig)
// Optional: fs.mkdirSync(path.join(__dirname, "uploads"), { recursive: true });

// Multer Setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// Statische Route für Uploads, damit man Bilder abrufen kann
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// MongoDB verbinden
connect();

// Simple Test-Route
app.get("/", (req, res) => {
  res.send("Hello co-creator! Let's start building something great 🤓");
});

// ✅ Upload-Route
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Keine Datei empfangen" });
  }

  res.json({
    message: "Datei erfolgreich hochgeladen!",
    filename: req.file.filename,
    url: `/uploads/${req.file.filename}`, // nützlich für Frontend
  });
});

// Fehler-Middleware
app.use((err, req, res, next) => {
  console.error("❌ Error found:", err);
  res.sendStatus(500);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
