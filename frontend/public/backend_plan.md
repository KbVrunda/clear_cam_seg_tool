# Backend & Integration Plan

## Phase 1 – Backend Foundations

1. **Service Account & Bucket Access**
   - Create or reuse a GCP service account with read access to the source video bucket and write access to the destination (annotated) bucket.
   - Store the JSON key securely (never commit it). Use this key for server-side GCS operations.

2. **API Scaffolding**
   - Choose a backend stack (Node + Express or FastAPI). Both can interact with GCS and trigger Python scripts.
   - Implement endpoints:
     - `GET /api/videos`: list MP4 files (name, size, metadata) from the source bucket.
     - `GET /api/videos/:id/url`: return a short-lived signed URL with CORS headers for direct browser access.
     - `POST /api/frames`: accept annotated frame data (PNG/JPEG) and upload it to the destination bucket.

3. **CORS & Security**
   - Configure the video bucket’s CORS policy to allow the web app origin (e.g. `http://localhost:5173`).
   - Add authentication/authorization to the API endpoints (API key, JWTs, session, etc.).

---

## Phase 2 – Frontend Integration

1. **Configuration**
   - Add environment variables (e.g. `.env.local`) for `VITE_API_BASE_URL` and any default video IDs.
   - Build API utilities for listing videos, fetching signed URLs, and uploading frames.

2. **Collapsible Video Sidebar**
   - Extend the nav to include a collapsible “Video Library” panel populated from `/api/videos`.
   - Allow search/filter for large libraries; preserve existing tool buttons.

3. **Video Selection Flow**
   - On video selection, fetch the signed URL, clear previous annotations, and start frame extraction.
   - Display loading/progress indicators during extraction.

---

## Phase 3 – Frame Extraction & Annotation

1. **Frame Extraction**
   - Use the signed URL in `SegmentationDashboard` to load the video via an off-screen `<video>` element.
   - Capture thumbnails every 10 seconds by drawing to canvas and storing `{ time, image }`.
   - Keep annotations keyed by `(videoId, frameTime)`.

2. **Annotation Workflow**
   - Reuse current draw/erase tools; selecting a thumbnail swaps the canvas image.
   - `Save` should render the base frame with shapes and POST the result to `/api/frames`.

---

## Phase 4 – Python Integration & Processing

1. **Python Script Integration**
   - If backend is FastAPI (Python), integrate the script as a module or background task.
   - If backend is Node, call the Python script via `child_process` or run it as a separate microservice exposed via REST/gRPC.

2. **Asynchronous Processing**
   - For heavier workloads, enqueue metadata for the Python worker after upload to the annotated bucket.

---

## Phase 5 – Polish & Hardening

1. **UX Enhancements**
   - Responsive loaders, retry buttons, better error messages.
   - Provide history/logging of saved annotations with user & timestamp metadata.

2. **Testing & CI**
   - Unit tests for API endpoints and frontend data flow.
   - Optional E2E tests for the video → annotate → save cycle.

---

### GCS Connection Notes

- Use official GCS SDKs (`@google-cloud/storage` for Node, `google-cloud-storage` for Python).
- Generate signed URLs with appropriate expiration and CORS headers.
- Ensure buckets allow `GET` from the app origin and `PUT` from the backend uploading annotations.

This phased approach lets you ship value incrementally while keeping a clear path for future Python integration and scaling.
