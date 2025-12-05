import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { signedUpload, signedDownload, listByPrefix } from './gcs.js';
import { ensureFolder } from './drive.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_, res) => {
  res.json({ ok: true });
});

app.post('/gcs/signed-upload', async (req, res) => {
  try {
    const { dir = 'raw/videos', fileName, contentType } = req.body;
    if (!fileName || !contentType) {
      return res.status(400).json({ error: 'fileName and contentType required' });
    }

    const datePath = new Date().toISOString().slice(0, 10).replace(/-/g, '/');
    const objectName = `${dir}/${datePath}/${fileName}`;

    const url = await signedUpload({ objectName, contentType });
    res.json({ url, objectName });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/gcs/signed-download', async (req, res) => {
  try {
    const { objectName } = req.query;
    const url = await signedDownload({ objectName });
    res.json({ url });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/gcs/list', async (req, res) => {
  try {
    const prefix = req.query.prefix || '';
    const files = await listByPrefix(prefix);
    res.json({ files });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Video endpoints for frontend
app.get('/videos', async (req, res) => {
  try {
    // Default to VideostoVal/ prefix where videos actually are, but allow override via query param
    const prefix = req.query.prefix || 'VideostoVal/';
    const files = await listByPrefix(prefix);
    // Filter for video files only
    const videoFiles = files.filter(f => 
      f.name.match(/\.(mp4|avi|mov|mkv|webm|mpg)$/i)
    );
    res.json({ videos: videoFiles });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/videos/url', async (req, res) => {
  try {
    const { objectName } = req.query;
    if (!objectName) {
      return res.status(400).json({ error: 'objectName query parameter required' });
    }
    const url = await signedDownload({ objectName });
    res.json({ url });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/drive/folder', async (req, res) => {
  try {
    const { name } = req.body;
    const parentId = process.env.DRIVE_PARENT_ID || undefined;
    const folder = await ensureFolder(name, parentId);
    res.json(folder);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Express running on :${PORT}`);
});
