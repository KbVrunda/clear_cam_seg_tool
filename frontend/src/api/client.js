const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000').replace(/\/$/, '');

async function request(path, options = {}) {
  const url = `${API_BASE_URL}${path}`;
  let response;

  try {
    response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      ...options,
    });
  } catch (error) {
    throw new Error('Failed to Connect to Google Cloud');
  }

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const payload = isJson ? await response.json() : null;

  if (!response.ok) {
    const message = payload?.message || 'Failed to Connect to Google Cloud';
    throw new Error(message);
  }

  return payload;
}

/**
 * Fetches list of all videos from GCS bucket
 * @returns {Promise<Array>} Array of video objects with name, size, updated
 */
export async function getVideos() {
  const data = await request('/videos');
  return data?.videos || [];
}

/**
 * Fetches a signed URL for a video by object name
 * @param {string} objectName - The full path/name of the video object in GCS
 * @returns {Promise<string>} The signed URL for streaming the video
 */
export async function getVideoUrl(objectName) {
  const encoded = encodeURIComponent(objectName);
  const data = await request(`/videos/url?objectName=${encoded}`);
  return data?.url || null;
}

// Legacy function names for backward compatibility
export async function listVideos() {
  return getVideos();
}

export async function getVideoSignedUrl(name) {
  const url = await getVideoUrl(name);
  return { url };
}

export async function uploadAnnotatedFrame({ fileName, imageData, videoName, frameTime }) {
  return request('/api/frames', {
    method: 'POST',
    body: JSON.stringify({ fileName, imageData, videoName, frameTime }),
  });
}
