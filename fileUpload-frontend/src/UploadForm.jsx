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
