# 📦 [Project Name Here]

## 🔧 Tech Stack
- Frontend: React, Vite
- Backend: Express, Multer, MongoDB
- Styling: SCSS / Tailwind (if used)

## 🗂️ Key Structure
- `/client/src/components`
- `/server/routes/upload.js`
- `/utils/connectDB.js`

## 📦 Features Implemented
- [x] File Upload (single file)
- [x] Multer storage setup
- [x] Upload preview
- [ ] Text inputs (extendable)
- [ ] File overview / gallery
- [ ] Auto date saving (to Mongo)

## 📊 Dev Status
| Part          | Done % | Notes                        |
|---------------|--------|------------------------------|
| UploadForm UI | 100%   | Working preview               |
| API Setup     | 100%   | Multer tested, file saved     |
| Mongo Save    | 40%    | Text input to be added        |

## 🚧 Todos
- [ ] Add Overview section on UploadForm page
- [ ] Auto add `createdAt` field to Mongo
- [ ] Create DevDashboard with toggle
