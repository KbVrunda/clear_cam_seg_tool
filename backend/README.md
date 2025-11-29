# ClearCam Backend

This directory contains the Express API that powers ClearCam’s video listing, signed URL generation, and annotated-frame uploads.

## Prerequisites

- Node.js 18+
- Google Cloud project with:
  - Source bucket containing MP4 videos
  - Destination bucket for annotated frames
  - Service account with:
    - `roles/storage.objectViewer` on the source bucket
    - `roles/storage.objectCreator` (or Admin) on the destination bucket

## Environment Variables

Copy `env.example` to `.env` and fill in the values:

```
GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/service-account.json
GCS_VIDEO_BUCKET=your-video-bucket-name
GCS_ANNOTATION_BUCKET=your-annotation-bucket-name
PORT=4000
```

> `GOOGLE_APPLICATION_CREDENTIALS` should point to the service-account JSON key file on disk. Keep this file **out** of source control.

## Installation & Development

```bash
cd backend
npm install
npm run dev
```

This starts the API on `http://localhost:4000` with hot reload (`node --watch`).

## Next Steps

- Replace the stub responses in `src/index.js` with real Google Cloud Storage SDK calls (list files, generate signed URLs, upload annotated frames).
- Add authentication/authorization when exposing the API beyond local development.
- Optionally integrate background processing or a Python worker for additional image analysis.
