import dotenv from 'dotenv';
dotenv.config();  // ← load .env before we read process.env

import { Storage } from '@google-cloud/storage';

let storage = null;
let bucketName = process.env.GCS_BUCKET;

try {
  storage = new Storage();
  console.log('Using bucket:', bucketName || 'NOT CONFIGURED');  // optional debug
} catch (error) {
  console.warn('GCS Storage initialization failed:', error.message);
  console.warn('Backend will start but GCS operations will fail until configured.');
}

export async function signedUpload({ objectName, contentType, expiresInSec = 900 }) {
  if (!storage || !bucketName) {
    throw new Error('GCS not configured. Please set GCS_BUCKET and GCS credentials.');
  }
  const [url] = await storage.bucket(bucketName).file(objectName).getSignedUrl({
    version: 'v4',
    action: 'write',
    expires: Date.now() + expiresInSec * 1000,
    contentType,
  });
  return url;
}

export async function signedDownload({ objectName, expiresInSec = 900 }) {
  if (!storage || !bucketName) {
    throw new Error('GCS not configured. Please set GCS_BUCKET and GCS credentials.');
  }
  const [url] = await storage.bucket(bucketName).file(objectName).getSignedUrl({
    version: 'v4',
    action: 'read',
    expires: Date.now() + expiresInSec * 1000,
  });
  return url;
}

export async function listByPrefix(prefix = '') {
  if (!storage || !bucketName) {
    throw new Error('GCS not configured. Please set GCS_BUCKET and GCS credentials.');
  }
  const [files] = await storage.bucket(bucketName).getFiles({ prefix });
  return files.map(f => ({
    name: f.name,
    size: Number(f.metadata.size || 0),
    updated: f.metadata.updated,
    metadata: f.metadata.metadata || {},
  }));
}
