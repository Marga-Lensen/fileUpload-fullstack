
# 📁 File Upload Fullstack – Setup & Anleitung

Diese Anleitung beschreibt Schritt für Schritt, wie du das Backend für das Fullstack File Upload -Projekt aufsetzt und startest. 

Ziel ist es, mit möglichst wenigen Schritten eine funktionierende Datei-Upload-Anwendung mit lokale Speicherung - und später zusätzlich mit Express und MongoDB - bereitzustellen.

💡 Codeblöcke und ausführliche Erklärungen sind auszuklappen beim Zeichen ▶ und auch wieder einzuklappen.

#
# Inhaltsverzeichnis

* [I. Backend-Script ausführen](#i-backend-script-ausführen)
* [II. Multer-Konfiguration im Server](#ii-multer-konfiguration-im-server)
* [III. Frontend mit Vite erstellen](#iii-frontend-mit-vite-erstellen)
* [IV. Frontend-Dateien erstellen und testen](#iv-frontend-dateien-erstellen-und-testen)
* [V. Optional: Tree-Check, Styling, Favicon](#v-optional-tree-check-styling-favicon)

---
#

## I.  🔧 Backend-Script ausführen

Das Backend-Script erstellt die gesamte Serverstruktur inklusive Upload-Ordner und `server.js`.

### Führe aus:

***~/fileUpload-project*** **$**
_________________________________________


    node one-command-backend-generator.js
__________________________________________


Das Script stellt dir einige Fragen zur Konfiguration:

* **projectName**: Vorschlag: `fileUpload-backend`
* **port**: `3000` (Standard oder PORT deiner Wahl)
* **MongoDB connection string**: Die Datenbank könnte `fileUploadMVP` heißen

* Das Script `server.js` wird schon einmal aufgerufen im Backend-Generator-Script und https://localhost:${PORT} wird automatisch in Firefox geöffnet.

#
🖝 [Zurück zum Anfang](#inhaltsverzeichnis)

---
#
## II. 📦 Multer-Konfiguration im Server einrichten

<details>
<summary>💡 👉️ Ausführliche Erklärung & neuen Code anzeigen 👇️ (bitte ausklappen!👇️)
</summary>



Wechsle in das neue Projektverzeichnis und installiere [Multer](https://github.com/expressjs/multer), das Middleware-Paket für Datei-Uploads:

```bash
cd fileUpload-backend
npm install multer
````

### 🔌 Ergänze folgende Code-Blöcke in deiner `server.js`

#### 🧱 A. Imports (oberhalb deiner Datei)

```js
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
```
#
-----------------------------
#### ⚙️ *Nach* B. `dotenv.config()` & Middleware (*steht schon da im Script!*):

```js
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors()); 
```
#
-------------------------------

```js
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
```
#
#

#### 🔁 D. Danach wie gewohnt:

```js
connect();

app.get("/", (req, res) => {
  res.send("Hello co-creator! Let's start building something great 🤓");
});
```
#
#

#### 📤 E. Upload-Route (unterhalb deiner GET-Routes, oberhalb Error Middleware)

```js
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
```
#
#
####  F. am Ende

- Error Middleware
- start server
🔚
</details>

* Der Upload-Ordner `uploads/` wird automatisch erstellt.
* Starte den Server nach Erstellung manuell aus dem neu erstellten Projektordner:

```bash
cd fileUpload-backend
node server.js
```
#
🖝 [Zurück zum Anfang](#inhaltsverzeichnis)
#
---

## III. 🖥️ React-Frontend mit Vite erstellen


Erstelle die React-Anwendung im selben übergeordneten Verzeichnis, wo das Backend-Generator-Script ausgeführt wurde (z.B. im Ordner `fileUpload-project`).

### ▶️ React-App mit Vite starten

```bash
npm create vite@latest
````

📌 **Projektname-Vorschlag:** `fileUpload-frontend`

* Wähle bei den Prompts:

  * Framework: `React`
  * Variante: `JavaScript`

### 📂 Danach:

```bash
cd fileUpload-frontend
npm install
npm run dev
```

> 💡 Die App sollte jetzt unter `http://localhost:5173` im Browser laufen.


🖝 [Zurück zum Anfang](#inhaltsverzeichnis)

---

## IV. ⚛️ Frontend-Dateien erstellen und Upload-Logik erstellen 

Jetzt bauen wir das Upload-Formular und binden die Upload-Funktionalität über einen API-Service ein.

<details>
<summary>💡 👉️ Ausführliche Erklärung & neuen Code anzeigen 👇️ (bitte ausklappen!👇️)
</summary>

🖝 [Zurück zum Anfang](#inhaltsverzeichnis)

#
### 1️⃣ `App.jsx` ersetzen

Ersetze den Inhalt von `src/App.jsx` mit folgendem Code:

```jsx
import React from 'react';
import UploadForm from './UploadForm';

function App() {
  return (
    <div className="App">
      <UploadForm />
    </div>
  );
}

export default App;
```

---

### 2️⃣ Neue Datei: `src/UploadForm.jsx`

Erstelle die Datei `UploadForm.jsx` im `src/`-Verzeichnis mit folgendem Inhalt:

```js
import React, { useState } from 'react';
import { uploadFile } from './api/uploadService.js';

const UploadForm = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [message, setMessage] = useState('');

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return setMessage('Bitte wähle eine Datei aus.');

    try {
      const res = await uploadFile(file);
      setMessage(res.message);
    } catch (err) {
      setMessage(err.message || 'Upload fehlgeschlagen');
    }
  };

  return (
    <div>
      <h2>Datei hochladen</h2>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={handleFileChange} />
        <button type="submit">Hochladen</button>
      </form>

      {preview && (
        <div>
          <h4>Vorschau:</h4>
          <img src={preview} alt="Preview" width="200" />
        </div>
      )}

      {message && <p>{message}</p>}
    </div>
  );
};

export default UploadForm;
```


> 📌 Diese Komponente kümmert sich rein um die UI und verwendet die Funktion `uploadFile` aus einem separaten API-Service.

---

### 3️⃣ Ordner und Datei für Upload-Service

Erstelle im `src/`-Ordner einen Unterordner `api/` und darin die Datei `uploadService.js` mit dem folgenden Code:

#
📄 `src/api/uploadService.js`:

```js
export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('http://localhost:3000/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) throw new Error('Serverfehler beim Upload');

  return await response.json();
};
```

> ⚠️ **Wichtig:** Stelle sicher, dass die URL (`http://localhost:3000/upload`) mit dem tatsächlichen Port deines Backends übereinstimmt.

> 🔧 Optional kannst du `http://localhost:${PORT}` in eine `.env` oder `config.js` hier im frontend auslagern.

</details>


#
🖝 [Zurück zum Anfang](#inhaltsverzeichnis)

---
#
## V. Optional: Tree-Check, Styling, Favicon

### 📁 Ordnerstruktur überprüfen

Nutze `tree` (oder eigene Übersicht), um die Struktur zu checken:

*~/fileUpload-project ***$**
```bash
tree -L 4 -I node_modules
```

<details><summary>👉️ 🌲 Example tree 👇️ (bitte ausklappen!👇️)</summary>

```
.
├── fileUpload-backend
│   ├── package.json
│   ├── package-lock.json
│   ├── server.js
│   ├── uploads
│   │   ├── 1747233840188-Hokusai.png
│   │   ├── 1747233962924-structure.json
│   │   ├── 1747233998378-fileUpload-table.png
│   │   ├── 1747244012256-upload-favicon.png
│   │   ├── 1747245531156-upload-favicon-no-bg.png
│   │   ├── 1747245591999-one-command-backend-generator.js
│   │   ├── 1747245634049-Anleitung.md
│   │   ├── 1747254727349-Lensen_Lebenslauf.pdf
│   │   ├── Gist-Treasury.png
│   │   ├── GRUB-meldung.png
│   │   ├── Kanagawa.png
│   │   └── Serenity-Zen.png
│   └── utils
│       └── connectDB.js
├── fileUpload-folder-structure.md
├── fileUpload-frontend
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── public
│   │   ├── Hokusai.png
│   │   ├── upload-favicon-no-bg.png
│   │   ├── upload-favicon.png
│   │   └── vite.svg
│   ├── README.md
│   ├── src
│   │   ├── api
│   │   │   └── uploadService.js
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── assets
│   │   │   └── react.svg
│   │   ├── index.css
│   │   ├── main.jsx
│   │   └── UploadForm.jsx
│   └── vite.config.js
└── README.md

9 directories, 37 files
```
</details>

🖝 [Zurück zum Anfang](#inhaltsverzeichnis)


#
### 🎨 Styling anpassen

* Passe `App.css` und ggf. `index.css` an.

* **Tipp:** Hintergrundbild in `public/` speichern und einfach darauf zugreifen.


🖝 [Zurück zum Anfang](#inhaltsverzeichnis)

#

### ⭐ Favicon setzen

* Ersetze das `vite.svg` durch dein eigenes Favicon.

* **Tipp:** Bild für favicon in `public/` speichern und einfach darauf zugreifen.

* In `index.html`:

```html
<link rel="icon" type="image/png" href="/dein-favicon.png" />
```

🖝 [Zurück zum Anfang](#inhaltsverzeichnis)
