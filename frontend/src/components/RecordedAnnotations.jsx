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

export default function RecordedAnnotations({
  annotations = [], // Array of { time, label, sublabels, savedAt }
  onSeekToTime,
}) {
  if (!annotations.length) {
    return (
      <div className="p-4 text-sm text-gray-500 text-center">
        No annotations saved yet. Pause the video and click "Save Annotation" to create one.
      </div>
    );
  }

  // Sort by timestamp (newest first)
  const sortedAnnotations = [...annotations].sort((a, b) => b.time - a.time);

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          Recorded Annotations ({annotations.length})
        </h3>
        <div className="space-y-2">
          {sortedAnnotations.map((annotation, index) => (
            <div
              key={`${annotation.time}-${index}`}
              className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition cursor-pointer"
              onClick={() => onSeekToTime?.(annotation.time)}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-800">
                  {formatTime(annotation.time)}
                </span>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    annotation.label === 'clean'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {annotation.label}
                </span>
              </div>
              {annotation.sublabels && annotation.sublabels.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {annotation.sublabels.map((sublabel) => (
                    <span
                      key={sublabel}
                      className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded"
                    >
                      {sublabel}
                    </span>
                  ))}
                </div>
              )}
              {annotation.savedAt && (
                <div className="text-xs text-gray-500 mt-2">
                  Saved: {new Date(annotation.savedAt).toLocaleString()}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

