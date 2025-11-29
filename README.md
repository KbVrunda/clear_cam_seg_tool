# ClearCam Monorepo

This repository now contains two projects:

- `frontend/` – React + Vite app (annotation UI)
- `backend/` – Express API scaffolding (video listing, signed URLs, uploads)

## Getting Started

### Frontend

```bash
cd frontend
npm install        # first time only
npm run dev        # starts Vite on http://localhost:5173
```

### Backend

```bash
cd backend
npm install        # first time only
cp env.example .env
# edit .env with your bucket names & service-account JSON path
npm run dev        # starts API on http://localhost:4000
```

The frontend will later call the backend endpoints (e.g. `/api/videos`). During development you can leave both servers running in separate terminals.

## Directory Structure

```
clear_cam_seg_tool/
├── backend/
│   ├── env.example
│   ├── package.json
│   ├── src/index.js
│   └── ...
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── src/
│   └── public/
└── README.md (this file)
```

## Next Steps

- Implement real Google Cloud Storage integration in `backend/src/index.js`.
- Update the frontend to consume the new API (video picker, uploads).
- Add authentication/security before deploying beyond local development.
