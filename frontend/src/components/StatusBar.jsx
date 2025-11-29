import { mockSelectedImage, mockHistory } from '../utils/mockData';

function formatTime(seconds) {
  if (seconds === null || seconds === undefined || Number.isNaN(seconds)) return '—';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0');
  return `${mins}:${secs}`;
}

export default function StatusBar({
  zoom = 100,
  frameTime = null,
  resolution = '—',
  historyCount = 0,
}) {
  return (
    <div className="bg-gray-800 text-white px-6 py-2 flex items-center justify-between text-sm">
      <div className="flex items-center space-x-6">
        <span className="text-gray-300">
          <span className="font-medium">Frame:</span> {formatTime(frameTime)}
        </span>
        <span className="text-gray-300">
          <span className="font-medium">Resolution:</span> {resolution}
        </span>
        <span className="text-gray-300">
          <span className="font-medium">Zoom:</span> {zoom}%
        </span>
      </div>
      <div className="flex items-center space-x-4">
        <button className="text-gray-300 hover:text-white disabled:opacity-50" disabled>
          ↶ Undo
        </button>
        <span className="text-gray-500">|</span>
        <button className="text-gray-300 hover:text-white" disabled>
          ↷ Redo
        </button>
        <span className="text-gray-500 ml-2">
          Annotations: {historyCount}
        </span>
      </div>
    </div>
  );
}

