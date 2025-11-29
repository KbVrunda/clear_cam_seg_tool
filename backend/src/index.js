import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Storage } from '@google-cloud/storage';
import path from 'node:path';
import crypto from 'node:crypto';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (/^http:\/\/(localhost|127\.0\.0\.1)/.test(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json({ limit: '25mb' }));

const VIDEO_BUCKET = process.env.GCS_VIDEO_BUCKET;
const ANNOTATION_BUCKET = process.env.GCS_ANNOTATION_BUCKET;

const storage = new Storage(
  process.env.GOOGLE_APPLICATION_CREDENTIALS
    ? { keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS }
    : {}
);

const connectionErrorCodes = new Set(['ENOTFOUND', 'EAI_AGAIN', 'ECONNREFUSED']);

function isConnectionIssue(error) {
  return (
    connectionErrorCodes.has(error?.code) ||
    error?.message?.includes('Could not load the default credentials') ||
    error?.message?.includes('The caller does not have permission')
  );
}

function handleCloudError(res, error, fallback = 'Failed to Connect to Google Cloud') {
  console.error('[GCS]', error);
  if (isConnectionIssue(error)) {
    return res.status(502).json({ message: 'Failed to Connect to Google Cloud' });
  }
  if (error?.code === 404) {
    return res.status(404).json({ message: 'Video not found.' });
  }
  return res.status(500).json({ message: error?.message || fallback });
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/videos', async (req, res) => {
  if (!VIDEO_BUCKET) {
    return res.status(500).json({ message: 'Video bucket is not configured.' });
  }

  try {
    const bucket = storage.bucket(VIDEO_BUCKET);
    const [files] = await bucket.getFiles({ maxResults: 1000 });
    const items = files
      .filter((file) => file.name.toLowerCase().endsWith('.mp4'))
      .map((file) => ({
        name: file.name,
        size: Number(file.metadata?.size) || null,
        updatedAt: file.metadata?.updated || null,
        bucket: VIDEO_BUCKET,
      }));

    res.json({ items });
  } catch (error) {
    handleCloudError(res, error, 'Unable to list videos.');
  }
});

app.get('/api/videos/:name/url', async (req, res) => {
  if (!VIDEO_BUCKET) {
    return res.status(500).json({ message: 'Video bucket is not configured.' });
  }

  try {
    const objectName = decodeURIComponent(req.params.name);
    const bucket = storage.bucket(VIDEO_BUCKET);
    const file = bucket.file(objectName);
    const [exists] = await file.exists();

    if (!exists) {
      return res.status(404).json({ message: 'Video not found.' });
    }

    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes
    const [signedUrl] = await file.getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: expiresAt,
    });

    res.json({
      name: objectName,
      url: signedUrl,
      expiresAt: new Date(expiresAt).toISOString(),
    });
  } catch (error) {
    handleCloudError(res, error, 'Unable to generate signed URL.');
  }
});

function parseDataUrl(dataUrl) {
  const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec(dataUrl || '');
  if (!match) return null;
  const [, mimeType, base64] = match;
  return { mimeType, base64 };
}

app.post('/api/frames', async (req, res) => {
  if (!ANNOTATION_BUCKET) {
    return res.status(500).json({ message: 'Annotation bucket is not configured.' });
  }

  const { imageData, fileName, videoName, frameTime } = req.body || {};
  if (!imageData) {
    return res.status(400).json({ message: 'imageData is required.' });
  }

  const parsed = parseDataUrl(imageData);
  if (!parsed) {
    return res.status(400).json({ message: 'imageData must be a base64-encoded data URL.' });
  }

  const { mimeType, base64 } = parsed;
  const buffer = Buffer.from(base64, 'base64');
  const extension = mimeType === 'image/png' ? 'png' : 'jpg';
  const safeVideoName = (videoName || 'video')
    .toString()
    .replace(/[^a-z0-9-_]/gi, '_')
    .toLowerCase();
  const timestamp = Number.isFinite(frameTime) ? Math.round(frameTime * 1000) : Date.now();
  const generatedName = `${safeVideoName || 'annotation'}-${timestamp}-${crypto
    .randomUUID()
    .slice(0, 8)}.${extension}`;
  const targetFileName = (fileName || generatedName).replace(/\s+/g, '_');
  const objectPath = path.posix.join(safeVideoName, targetFileName);

  try {
    const bucket = storage.bucket(ANNOTATION_BUCKET);
    const file = bucket.file(objectPath);
    await file.save(buffer, {
      metadata: {
        contentType: mimeType,
        metadata: {
          sourceVideo: videoName || null,
          frameTime: frameTime !== undefined ? String(frameTime) : null,
        },
      },
      resumable: false,
    });

    res.json({
      bucket: ANNOTATION_BUCKET,
      objectPath,
      size: buffer.length,
      mimeType,
      savedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleCloudError(res, error, 'Unable to upload annotated frame.');
  }
});

app.use((req, res) => {
  res.status(404).json({ message: 'Not Found' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal Server Error' });
});

app.listen(port, () => {
  console.log(`Backend API running on http://localhost:${port}`);
});
