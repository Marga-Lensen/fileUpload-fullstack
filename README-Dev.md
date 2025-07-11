# 📦 fileUpload Tool – Fullstack Datei-Upload mit MongoDB, Express, React & Multer

Ein direkt einsetzbares Dev-Setup zum Hochladen, Speichern und Anzeigen von Dateien inkl. Metadaten – mit einem automatisierten Backend-Generator, API-Services und React-Komponenten.

---

## 🔧 Tech Stack

- **Frontend:** React, Vite  
- **Backend:** Express, Multer, MongoDB (Mongoose)  

---

## 🧩 Overview
Minimal fullstack MERN template focused purely on file upload from a React frontend.

## 🛠️ Features
- React frontend with basic upload UI
- Backend with Multer and MongoDB setup (not fully used yet)
- Files saved to disk (`uploads/` folder)

## 🗺️ Special
- Uses a one-command backend generator script
- Serves as a skeleton/template project
- MongoDB connection configured but not used for data persistence yet

## 📁 Repo
https://github.com/Marga-Lensen/fileUpload-fullstack
## 🗂️ Projektstruktur

---

```plaintext
/client
├── /src
│   ├── /components
│   │   ├── UploadForm.jsx
│   │   ├── FileList.jsx
│   └── /api
│       └── uploadService.js

/server
├── /routes
│   └── upload.js
├── /utils
│   └── connectDB.js
````

---

## 📦 Implementierte Features

* ✅ Datei-Upload (Single File)
* ✅ Multer-Konfiguration mit Speicherziel
* ✅ Vorschau des Uploads im Frontend
* ✅ Automatisches Speichern von `createdAt` in MongoDB
* ⏳ Upload mit Zusatzfeldern (Textinputs, Tags)
* ⏳ Übersicht / Dateigalerie mit Metadaten
* 😀 Toggle zwischen "Posten" und "Browsen"

---

## 🚀 Einstieg & Setup

```bash
# 1. Backend starten
cd fileUpload-backend
npm install
npm start

# 2. Frontend starten
cd ../fileUpload-frontend
npm install
npm run dev
```

---

## 🧪 Komponenten & Services (Frontend)

| Datei              | Zweck                                          |
| ------------------ | ---------------------------------------------- |
| `UploadForm.jsx`   | Upload-Komponente (controlled input + preview) |
| `uploadService.js` | API-Funktion zum POST an Express/Multer        |
| `FileList.jsx`     | Anzeige bereits gespeicherter Dateien          |

🔜 Bald verfügbar: `fileUpload-viewer-files/` – gebündelte Viewer-Komponenten zur Wiederverwendung im `src/`-Verzeichnis.

---

## 📊 Dev Status

| Modul         | Fortschritt | Notizen                              |
| ------------- | ----------- | ------------------------------------ |
| UploadForm UI | ✅ 100%      | Funktionsfähig mit Vorschau          |
| API Setup     | ✅ 100%      | Multer getestet, Dateien gespeichert |
| Mongo Save    | 🟡 40%      | Textinputs & Metadaten fehlen noch   |
