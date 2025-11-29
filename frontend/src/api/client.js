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

export async function listVideos() {
  const data = await request('/api/videos');
  return data?.items || [];
}

export async function getVideoSignedUrl(name) {
  const encoded = encodeURIComponent(name);
  return request(`/api/videos/${encoded}/url`);
}

export async function uploadAnnotatedFrame({ fileName, imageData, videoName, frameTime }) {
  return request('/api/frames', {
    method: 'POST',
    body: JSON.stringify({ fileName, imageData, videoName, frameTime }),
  });
}
