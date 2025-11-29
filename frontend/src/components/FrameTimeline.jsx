import React from 'react';

function formatTime(seconds = 0) {
  if (seconds === null || seconds === undefined || Number.isNaN(seconds)) {
    return '0:00';
  }
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0');
  return `${mins}:${secs}`;
}

export default function FrameTimeline({
  frames = [],
  selectedFrameTime = null,
  onSelect,
  isLoading = false,
  error = null,
}) {
  if (error) {
    return (
      <div className="bg-gray-900 text-red-400 px-4 py-3 text-sm">
        {error}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-gray-900 text-gray-300 px-4 py-3 text-sm">
        Generating video timeline…
      </div>
    );
  }

  if (!frames.length) {
    return (
      <div className="bg-gray-900 text-gray-400 px-4 py-3 text-sm">
        No frames available yet. Select a video to start extracting frames.
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border-t border-gray-800">
      <div className="px-4 py-2 text-gray-300 text-sm flex items-center justify-between">
        <span className="font-medium">Video Timeline</span>
        <span>{frames.length} frames</span>
      </div>
      <div className="overflow-x-auto">
        <div className="flex space-x-3 px-4 pb-4">
          {frames.map((frame) => {
            const isSelected = selectedFrameTime === frame.time;
            return (
              <button
                key={frame.time}
                type="button"
                onClick={() => onSelect?.(frame)}
                className={`flex-shrink-0 border-2 rounded-lg overflow-hidden transition ${
                  isSelected
                    ? 'border-blue-500 ring-2 ring-blue-300'
                    : 'border-gray-700 hover:border-gray-500'
                }`}
              >
                <img
                  src={frame.image}
                  alt={`Frame at ${formatTime(frame.time)}`}
                  className="w-32 h-20 object-cover"
                />
                <div className="bg-gray-800 text-gray-200 text-xs text-center py-1">
                  {formatTime(frame.time)}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

