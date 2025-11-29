import { useMemo } from 'react';

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
                          <span className="text-sm font-medium truncate">
                            {video.isFallback ? `${video.name} (fallback)` : video.name}
                          </span>
                          {sizeMb && <span className="text-xs text-gray-400">{sizeMb} MB</span>}
                        </div>
                        <div className="mt-1 text-xs text-gray-500 flex justify-between">
                          <span>{video.bucket}</span>
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
