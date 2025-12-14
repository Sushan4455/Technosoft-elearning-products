require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

const PORT = process.env.PORT || 5000;

/* ================= R2 CONFIG ================= */

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY,
    secretAccessKey: process.env.R2_SECRET_KEY
  },
  forcePathStyle: true
});

const BUCKET = process.env.R2_BUCKET;

/* ================= CREATE UPLOAD URL ================= */

app.post('/api/r2/upload-url', async (req, res) => {
  try {
    const { fileName, fileType, folder } = req.body;

    if (!fileName || !fileType || !folder) {
      return res.status(400).json({ error: 'Missing file details' });
    }

    const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const key = `${folder}/${Date.now()}-${safeName}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      ContentType: fileType
    });

    const uploadUrl = await getSignedUrl(r2, command, { expiresIn: 3600 });

    // ❗ DO NOT GUESS PUBLIC URL
    res.json({
      uploadUrl,
      key
    });
  } catch (err) {
    console.error('UPLOAD URL ERROR:', err);
    res.status(500).json({ error: 'Upload URL failed' });
  }
});

/* ================= GET ACCESS URL ================= */

app.post('/api/r2/access-url', async (req, res) => {
  try {
    const { key } = req.body;

    const command = new GetObjectCommand({
      Bucket: BUCKET,
      Key: key
    });

    const accessUrl = await getSignedUrl(r2, command, { expiresIn: 3600 });
    res.json({ accessUrl });
  } catch (err) {
    console.error('ACCESS URL ERROR:', err);
    res.status(500).json({ error: 'Access URL failed' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
