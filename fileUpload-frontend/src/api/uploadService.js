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