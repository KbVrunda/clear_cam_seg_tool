import { useMemo } from 'react';

/**
 * Extracts the filename from a full path
 * @param {string} path - Full path like "raw/videos/2025/12/01/demo.mp4"
 * @returns {string} - Filename like "demo.mp4"
 */
function getFilename(path) {
  if (!path) return path;
  const parts = path.split('/');
  return parts[parts.length - 1];
}

export default function VideoLibraryPanel({
  isOpen,
  onToggle,
  videos = [],
  loading = false,
  error = null,
  selectedVideoName = null,
  onSelect,
  onRefresh,
}) {
  const sortedVideos = useMemo(() => {
    return [...videos].sort((a, b) => {
      if (a.isFallback) return -1;
      if (b.isFallback) return 1;
      const aDate = new Date(a.updatedAt || 0).valueOf();
      const bDate = new Date(b.updatedAt || 0).valueOf();
      return bDate - aDate;
    });
  }, [videos]);

  // If used as a sidebar (always open), render simplified version
  if (isOpen && !onToggle) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Available Videos</h3>
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-600"
            >
              Refresh
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 text-sm text-blue-600 bg-blue-50 rounded border border-blue-200">
            {error}
          </div>
        )}
        {loading && (
          <div className="py-6 text-sm text-gray-500 text-center">Loading videos…</div>
        )}
        {!loading && !sortedVideos.length && (
          <div className="py-6 text-sm text-gray-500 text-center">No videos available.</div>
        )}
        {!loading && sortedVideos.length > 0 && (
          <ul className="space-y-2">
            {sortedVideos.map((video) => {
              const isSelected = video.name === selectedVideoName;
              const sizeMb = video.size ? (Number(video.size) / (1024 * 1024)).toFixed(1) : null;
              return (
                <li key={video.name}>
                  <button
                    type="button"
                    onClick={() => onSelect?.(video)}
                    className={`w-full text-left p-3 rounded transition ${
                      isSelected
                        ? 'bg-blue-50 text-blue-700 border-2 border-blue-300'
                        : 'hover:bg-gray-50 border-2 border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium truncate" title={video.name}>
                        {video.isFallback ? `${video.name} (fallback)` : getFilename(video.name)}
                      </span>
                      {sizeMb && <span className="text-xs text-gray-400 ml-2">{sizeMb} MB</span>}
                    </div>
                    <div className="text-xs text-gray-500 flex justify-between">
                      <span>{video.bucket || 'gcs'}</span>
                      {video.updatedAt && (
                        <span>{new Date(video.updatedAt).toLocaleString()}</span>
                      )}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    );
  }

  // Original floating panel version (for backward compatibility)
  return (
    <div className="absolute top-6 left-6 z-30">
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center space-x-2 bg-white shadow px-4 py-2 rounded-lg border border-gray-200 hover:border-gray-300 transition"
      >
        <span className="text-sm font-medium text-gray-700">Video Library</span>
        <span className="text-xs text-gray-500">{isOpen ? 'Hide' : 'Show'}</span>
      </button>

      {isOpen && (
        <div className="mt-3 w-72 max-h-[70vh] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div>
              <h3 className="text-sm font-semibold text-gray-800">Available Videos</h3>
              <p className="text-xs text-gray-500">Select a video to load frames</p>
            </div>
            <button
              type="button"
              onClick={onRefresh}
              className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-600"
            >
              Refresh
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {error && (
              <div className="px-4 py-4 text-sm text-blue-600 border-b border-gray-100">
                {error}
              </div>
            )}
            {loading && (
              <div className="px-4 py-6 text-sm text-gray-500">Loading videos…</div>
            )}
            {!loading && !sortedVideos.length && (
              <div className="px-4 py-6 text-sm text-gray-500">No videos available.</div>
            )}
            {!loading && sortedVideos.length > 0 && (
              <ul className="divide-y divide-gray-100">
                {sortedVideos.map((video) => {
                  const isSelected = video.name === selectedVideoName;
                  const sizeMb = video.size ? (Number(video.size) / (1024 * 1024)).toFixed(1) : null;
                  return (
                    <li key={video.name}>
                      <button
                        type="button"
                        onClick={() => onSelect?.(video)}
                        className={`w-full text-left px-4 py-3 transition ${
                          isSelected ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium truncate" title={video.name}>
                            {video.isFallback ? `${video.name} (fallback)` : getFilename(video.name)}
                          </span>
                          {sizeMb && <span className="text-xs text-gray-400">{sizeMb} MB</span>}
                        </div>
                        <div className="mt-1 text-xs text-gray-500 flex justify-between">
                          <span>{video.bucket || 'gcs'}</span>
                          {video.updatedAt && (
                            <span>{new Date(video.updatedAt).toLocaleString()}</span>
                          )}
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
