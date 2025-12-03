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

export default function VideoTimeline({
  duration = 0,
  currentTime = 0,
  isPlaying = false,
  onSeek,
  onPlayPause,
  annotatedTimestamps = [], // Array of { time, label, sublabels }
}) {
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleTimelineClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const seekTime = percentage * duration;
    onSeek?.(seekTime);
  };

  return (
    <div className="bg-gray-900 border-t border-gray-800">
      {/* Playback Controls */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-gray-800">
        <button
          type="button"
          onClick={onPlayPause}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          {isPlaying ? '⏸ Pause' : '▶ Play'}
        </button>
        <div className="flex items-center space-x-4 text-gray-300 text-sm">
          <span>{formatTime(currentTime)}</span>
          <span className="text-gray-500">/</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Timeline with annotations */}
      <div className="px-4 py-4">
        <div className="relative">
          {/* Timeline track */}
          <div
            className="relative h-2 bg-gray-700 rounded-full cursor-pointer"
            onClick={handleTimelineClick}
          >
            {/* Progress bar */}
            <div
              className="absolute top-0 left-0 h-full bg-blue-600 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
            
            {/* Annotation markers */}
            {annotatedTimestamps.map((annotation) => {
              const markerPosition = duration > 0 ? (annotation.time / duration) * 100 : 0;
              return (
                <div
                  key={annotation.time}
                  className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-lg z-10"
                  style={{ left: `${markerPosition}%` }}
                  title={`Annotation at ${formatTime(annotation.time)}: ${annotation.label}${annotation.sublabels?.length ? ` (${annotation.sublabels.join(', ')})` : ''}`}
                />
              );
            })}
            
            {/* Current time indicator */}
            <div
              className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-white rounded-full border-2 border-blue-600 shadow-lg z-20 cursor-pointer"
              style={{ left: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

