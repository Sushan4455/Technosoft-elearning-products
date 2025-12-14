import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

/* ===============================
   UPLOAD FILE TO CLOUDFLARE R2
   =============================== */

export const uploadToR2 = async (file, folder = 'uploads') => {
  if (!file) throw new Error('No file selected');

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');

  // 1️⃣ Request presigned upload URL
  const { data } = await axios.post(`${API_URL}/r2/upload-url`, {
    fileName: safeName,
    fileType: file.type,
    folder
  });

  const { uploadUrl, key } = data;

  if (!uploadUrl || !key) {
    throw new Error('Invalid upload URL response');
  }

  // 2️⃣ Upload directly to R2
  await axios.put(uploadUrl, file, {
    headers: {
      'Content-Type': file.type
    },
    maxBodyLength: Infinity,
    maxContentLength: Infinity
  });

  return {
    key,
    name: safeName,
    type: file.type
  };
};

/* ===============================
   GET SIGNED ACCESS URL
   =============================== */

export const getR2Url = async (key) => {
  if (!key) return null;
  const { data } = await axios.post(`${API_URL}/r2/access-url`, { key });
  return data.accessUrl;
};

/* ===============================
   BACKWARD COMPATIBILITY
   =============================== */

export const uploadToS3 = uploadToR2;
export const uploadToFirebase = uploadToR2;
export const getSecureUrl = getR2Url;
