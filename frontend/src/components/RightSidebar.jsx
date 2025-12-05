import { useState } from 'react';
import LabelSidebar from './LabelSidebar';
import VideoLibraryPanel from './VideoLibraryPanel';
import RecordedAnnotations from './RecordedAnnotations';

export default function RightSidebar({
  activeTab = 'labels',
  onTabChange,
  // Video Library props
  videos = [],
  videosLoading = false,
  videoListError = null,
  selectedVideoName = null,
  onVideoSelect,
  onVideoRefresh,
  // Labels props
  opacity,
  onOpacityChange,
  labels,
  onLabelsChange,
  // Recorded Annotations props
  recordedAnnotations = [],
  onSeekToAnnotation,
}) {
  return (
    <div className="bg-white border-l border-gray-300 w-80 flex flex-col">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200">
        <button
          type="button"
          onClick={() => onTabChange?.('labels')}
          className={`flex-1 px-3 py-2 text-xs font-medium transition ${
            activeTab === 'labels'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
          }`}
        >
          Labels
        </button>
        <button
          type="button"
          onClick={() => onTabChange?.('videos')}
          className={`flex-1 px-3 py-2 text-xs font-medium transition ${
            activeTab === 'videos'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
          }`}
        >
          Videos
        </button>
        <button
          type="button"
          onClick={() => onTabChange?.('annotations')}
          className={`flex-1 px-3 py-2 text-xs font-medium transition ${
            activeTab === 'annotations'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
          }`}
        >
          Annotations
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'labels' && (
          <div className="h-full overflow-y-auto">
            <LabelSidebar
              opacity={opacity}
              onOpacityChange={onOpacityChange}
              labels={labels}
              onLabelsChange={onLabelsChange}
            />
          </div>
        )}
        {activeTab === 'videos' && (
          <div className="h-full overflow-y-auto p-4">
            <VideoLibraryPanel
              isOpen={true}
              videos={videos}
              loading={videosLoading}
              error={videoListError}
              selectedVideoName={selectedVideoName}
              onSelect={onVideoSelect}
              onRefresh={onVideoRefresh}
            />
          </div>
        )}
        {activeTab === 'annotations' && (
          <RecordedAnnotations
            annotations={recordedAnnotations}
            onSeekToTime={onSeekToAnnotation}
          />
        )}
      </div>
    </div>
  );
}

