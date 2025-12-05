import { useCallback, useEffect, useMemo, useState } from 'react';
import SegmentationCanvas from './SegmentationCanvas';
import ToolPanel from './ToolPanel';
import RightSidebar from './RightSidebar';
import StatusBar from './StatusBar';
import TopBar from './TopBar';
import VideoTimeline from './VideoTimeline';
import { uploadAnnotatedFrame, getVideos, getVideoUrl } from '../api/client';
import { mockLabels } from '../utils/mockData';

const FALLBACK_VIDEO = {
  name: 'JA_2.mp4',
  bucket: 'local',
  isFallback: true,
  size: null,
  updatedAt: null,
};
const FALLBACK_VIDEO_URL = '/JA_2.mp4';

export default function SegmentationDashboard() {
  const [opacity, setOpacity] = useState(60);
  const [zoom, setZoom] = useState(100);
  const [activeTool, setActiveTool] = useState('brush');
  const [panMode, setPanMode] = useState(false);

  const [videos, setVideos] = useState([FALLBACK_VIDEO]);
  const [videosLoading, setVideosLoading] = useState(false);
  const [videoListError, setVideoListError] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(FALLBACK_VIDEO);
  const [rightSidebarTab, setRightSidebarTab] = useState('labels');
  const [videoUrlLoading, setVideoUrlLoading] = useState(false);

  // Video playback state
  const [videoUrl, setVideoUrl] = useState(null); // Start with null, will be set when video is selected
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoInfo, setVideoInfo] = useState({ width: null, height: null, duration: null });
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [videoError, setVideoError] = useState(null);

  // Annotations: keyed by timestamp (in seconds)
  const [annotationsByTime, setAnnotationsByTime] = useState({}); // { [time]: { shapes, labels } }
  const [selectedShapeId, setSelectedShapeId] = useState(null);
  
  // Saved annotations (for Recorded Annotations tab)
  const [savedAnnotations, setSavedAnnotations] = useState([]); // Array of { time, label, sublabels, savedAt }

  // Labels state
  const [labels, setLabels] = useState(mockLabels);

  const [saveStatus, setSaveStatus] = useState(null);
  const [saveError, setSaveError] = useState(null);

  // Get current timestamp's annotations
  const currentTimestamp = Math.floor(currentTime);
  const currentShapes = useMemo(() => {
    return annotationsByTime[currentTimestamp]?.shapes || [];
  }, [annotationsByTime, currentTimestamp]);

  const handleToolChange = (toolId) => {
    setActiveTool(toolId);
    setPanMode(toolId === 'pan');
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 25, 500));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 25, 25));
  };

  const handleZoomReset = () => {
    setZoom(100);
  };

  // Video playback handlers
  const handleVideoReady = useCallback((metadata) => {
    setVideoInfo({
      width: metadata.width,
      height: metadata.height,
      duration: metadata.duration,
    });
    setIsVideoReady(true);
    setVideoError(null);
  }, []);

  const handleVideoTimeUpdate = useCallback((time) => {
    setCurrentTime(time);
  }, []);

  const handleVideoPlay = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const handleVideoPause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const handleVideoError = useCallback((error) => {
    setVideoError(error || 'Failed to load video.');
    setIsVideoReady(false);
  }, []);

  const handlePlayPause = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const handleSeek = useCallback((time) => {
    setCurrentTime(time);
    setIsPlaying(false); // Pause when seeking
  }, []);

  // Annotation handlers
  const updateAnnotationsForTime = useCallback(
    (timestamp, updater) => {
      setAnnotationsByTime((prev) => {
        const existing = prev[timestamp] || { shapes: [], labels: null };
        const updated = updater(existing);
        return {
          ...prev,
          [timestamp]: updated,
        };
      });
    },
    []
  );

  const handleShapeAdd = useCallback(
    (shape) => {
      if (!isVideoReady || isPlaying) return;
      updateAnnotationsForTime(currentTimestamp, (existing) => ({
        ...existing,
        shapes: [...existing.shapes, shape],
      }));
      setSelectedShapeId(shape.id);
    },
    [isVideoReady, isPlaying, currentTimestamp, updateAnnotationsForTime]
  );

  const handleShapeUpdate = useCallback(
    (shapeId, updates) => {
      if (!isVideoReady || isPlaying) return;
      updateAnnotationsForTime(currentTimestamp, (existing) => ({
        ...existing,
        shapes: existing.shapes.map((shape) =>
          shape.id === shapeId ? { ...shape, ...updates } : shape
        ),
      }));
    },
    [isVideoReady, isPlaying, currentTimestamp, updateAnnotationsForTime]
  );

  const handleShapeDelete = useCallback(
    (shapeId) => {
      if (!isVideoReady || isPlaying) return;
      updateAnnotationsForTime(currentTimestamp, (existing) => ({
        ...existing,
        shapes: existing.shapes.filter((shape) => shape.id !== shapeId),
      }));
      if (selectedShapeId === shapeId) {
        setSelectedShapeId(null);
      }
    },
    [isVideoReady, isPlaying, currentTimestamp, selectedShapeId, updateAnnotationsForTime]
  );

  const handleOpacityChange = (newOpacity) => {
    setOpacity(newOpacity);
    if (selectedShapeId && currentShapes.length) {
      handleShapeUpdate(selectedShapeId, { opacity: newOpacity });
    }
  };

  // Fetch videos from backend on mount
  const fetchVideos = useCallback(async () => {
    setVideosLoading(true);
    setVideoListError(null);
    try {
      console.log('Fetching videos from backend...');
      const videoList = await getVideos();
      console.log('Received videos:', videoList);
      // Transform backend response to match expected format
      const transformedVideos = videoList.map((video) => ({
        name: video.name,
        size: video.size,
        updatedAt: video.updated,
        bucket: 'gcs',
        isFallback: false,
      }));
      console.log('Transformed videos:', transformedVideos);
      // Only include fallback if we have no real videos
      if (transformedVideos.length === 0) {
        console.log('No videos found, using fallback');
        setVideos([FALLBACK_VIDEO]);
      } else {
        console.log('Setting videos:', transformedVideos);
        setVideos(transformedVideos);
      }
    } catch (error) {
      console.error('Failed to fetch videos:', error);
      setVideoListError(error.message || 'Failed to load videos');
      // Keep fallback video available even on error
      setVideos([FALLBACK_VIDEO]);
    } finally {
      setVideosLoading(false);
    }
  }, []);

  // Video selection handler
  const handleVideoSelect = useCallback(
    async (video) => {
      setVideoError(null);
      setSaveStatus(null);
      setSaveError(null);
      setSelectedVideo(video || FALLBACK_VIDEO);
      setIsVideoReady(false);
      setCurrentTime(0);
      setIsPlaying(false);
      // Clear annotations when switching videos
      setAnnotationsByTime({});
      setSavedAnnotations([]);

      // If it's the fallback video, use the fallback URL
      if (video?.isFallback) {
        setVideoUrl(FALLBACK_VIDEO_URL);
        return;
      }

      // Otherwise, fetch the signed URL from backend
      if (video?.name) {
        setVideoUrlLoading(true);
        try {
          const url = await getVideoUrl(video.name);
          if (url) {
            setVideoUrl(url);
          } else {
            setVideoError('Failed to get video URL');
          }
        } catch (error) {
          console.error('Failed to fetch video URL:', error);
          setVideoError(error.message || 'Failed to load video URL');
        } finally {
          setVideoUrlLoading(false);
        }
      }
    },
    []
  );

  // Fetch videos on mount
  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  // Save annotation
  const composeAnnotatedImage = useCallback(async () => {
    if (!isVideoReady) {
      throw new Error('Video not ready.');
    }

    // Capture current frame from video
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.src = videoUrl;
    video.currentTime = currentTime;
    
    await new Promise((resolve, reject) => {
      video.addEventListener('loadeddata', resolve, { once: true });
      video.addEventListener('error', reject, { once: true });
    });

    await new Promise((resolve) => {
      video.addEventListener('seeked', resolve, { once: true });
    });

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1920;
    canvas.height = video.videoHeight || 1080;
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0);

    // Draw shapes
    currentShapes.forEach((shape) => {
      context.globalAlpha = (shape.opacity ?? 60) / 100;
      context.fillStyle = shape.color || '#ef4444';
      if (shape.type === 'circle') {
        context.beginPath();
        context.arc(shape.x, shape.y, shape.radius, 0, Math.PI * 2);
        context.fill();
      } else if (shape.type === 'square') {
        context.fillRect(
          shape.x - shape.size / 2,
          shape.y - shape.size / 2,
          shape.size,
          shape.size
        );
      }
      context.globalAlpha = 1;
    });

    return canvas.toDataURL('image/png');
  }, [isVideoReady, videoUrl, currentTime, currentShapes]);

  const handleSaveAnnotation = useCallback(async () => {
    if (!selectedVideo) {
      setSaveError('Select a video before saving annotations.');
      return;
    }
    if (!isVideoReady) {
      setSaveError('Video not ready.');
      return;
    }
    if (isPlaying) {
      setSaveError('Pause the video before saving annotations.');
      return;
    }

    // Get selected labels
    const selectedLabel = labels.clean.checked ? 'clean' : labels.dirty.checked ? 'dirty' : null;
    if (!selectedLabel) {
      setSaveError('Please select a label (Clean or Dirty) before saving.');
      return;
    }

    const selectedSublabels = labels.dirty.checked && labels.dirty.sublabels
      ? labels.dirty.sublabels.filter((s) => s.checked).map((s) => s.name)
      : [];

    try {
      setSaveError(null);
      setSaveStatus('Saving…');
      
      const imageData = await composeAnnotatedImage();
      
      // Save to backend (if implemented)
      try {
        await uploadAnnotatedFrame({
          fileName: undefined,
          imageData,
          videoName: selectedVideo.name,
          frameTime: currentTime,
        });
      } catch (error) {
        console.warn('Backend save failed, saving locally', error);
      }

      // Save annotation metadata locally
      const annotation = {
        time: currentTime,
        label: selectedLabel,
        sublabels: selectedSublabels,
        savedAt: new Date().toISOString(),
      };

      // Update annotations for this timestamp
      updateAnnotationsForTime(currentTimestamp, (existing) => ({
        ...existing,
        labels: { label: selectedLabel, sublabels: selectedSublabels },
      }));

      // Add to saved annotations list
      setSavedAnnotations((prev) => {
        // Remove existing annotation at this time if any
        const filtered = prev.filter((a) => Math.abs(a.time - currentTime) > 0.1);
        return [...filtered, annotation].sort((a, b) => a.time - b.time);
      });

      setSaveStatus(`Annotation saved at ${Math.floor(currentTime)}s`);
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      console.error('Save annotation failed', error);
      const message = error.message || 'Failed to save annotation.';
      setSaveError(message);
      setSaveStatus(null);
    }
  }, [
    selectedVideo,
    isVideoReady,
    isPlaying,
    currentTime,
    currentTimestamp,
    labels,
    composeAnnotatedImage,
    updateAnnotationsForTime,
  ]);

  const selectedShapeOpacity = selectedShapeId
    ? currentShapes.find((shape) => shape.id === selectedShapeId)?.opacity
    : null;

  // Get annotated timestamps for timeline markers
  const annotatedTimestamps = useMemo(() => {
    return savedAnnotations.map((annotation) => ({
      time: annotation.time,
      label: annotation.label,
      sublabels: annotation.sublabels,
    }));
  }, [savedAnnotations]);

  const handleSeekToAnnotation = useCallback((time) => {
    handleSeek(time);
  }, [handleSeek]);

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <ToolPanel activeTool={activeTool} onToolChange={handleToolChange} />
        <div className="flex-1 flex flex-col min-w-0 relative">
          <div className="bg-white border-b border-gray-300 px-6 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <h2 className="text-lg font-semibold text-gray-800">Segmentation Workspace</h2>
              {selectedVideo && (
                <span className="text-sm text-gray-500 truncate max-w-xs">
                  {selectedVideo.name}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleSaveAnnotation}
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                disabled={!isVideoReady || isPlaying || !labels.clean.checked && !labels.dirty.checked}
              >
                Save Annotation
              </button>
              <button
                onClick={handleZoomOut}
                className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
                title="Zoom Out"
              >
                −
              </button>
              <button
                onClick={handleZoomReset}
                className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
                title="Reset Zoom"
              >
                {zoom}%
              </button>
              <button
                onClick={handleZoomIn}
                className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
                title="Zoom In"
              >
                +
              </button>
            </div>
          </div>

          {(videoListError || saveStatus || saveError || videoError || videoUrlLoading) && (
            <div className="px-6 py-2 text-sm border-b border-gray-200 bg-white space-y-1">
              {videoUrlLoading && (
                <div className="text-blue-600">Loading video URL…</div>
              )}
              {videoListError && (
                <div className="text-blue-600">{videoListError}</div>
              )}
              {videoError && <div className="text-red-500">{videoError}</div>}
              {saveStatus && <div className="text-green-600">{saveStatus}</div>}
              {saveError && <div className="text-red-500">{saveError}</div>}
            </div>
          )}

          <SegmentationCanvas
            opacity={opacity}
            zoom={zoom}
            activeTool={activeTool}
            panMode={panMode}
            shapes={currentShapes}
            selectedShapeId={selectedShapeId}
            onShapeAdd={handleShapeAdd}
            onShapeSelect={setSelectedShapeId}
            onShapeUpdate={handleShapeUpdate}
            onShapeDelete={handleShapeDelete}
            videoUrl={videoUrl}
            videoInfo={videoInfo}
            isVideoReady={isVideoReady}
            onVideoReady={handleVideoReady}
            onVideoTimeUpdate={handleVideoTimeUpdate}
            onVideoPlay={handleVideoPlay}
            onVideoPause={handleVideoPause}
            onVideoError={handleVideoError}
            currentTime={currentTime}
            isPlaying={isPlaying}
          />
          <VideoTimeline
            duration={videoInfo.duration || 0}
            currentTime={currentTime}
            isPlaying={isPlaying}
            onSeek={handleSeek}
            onPlayPause={handlePlayPause}
            annotatedTimestamps={annotatedTimestamps}
          />
        </div>
        <RightSidebar
          activeTab={rightSidebarTab}
          onTabChange={setRightSidebarTab}
          videos={videos}
          videosLoading={videosLoading}
          videoListError={videoListError}
          selectedVideoName={selectedVideo?.name || null}
          onVideoSelect={handleVideoSelect}
          onVideoRefresh={fetchVideos}
          opacity={selectedShapeOpacity ?? opacity}
          onOpacityChange={handleOpacityChange}
          labels={labels}
          onLabelsChange={setLabels}
          recordedAnnotations={savedAnnotations}
          onSeekToAnnotation={handleSeekToAnnotation}
        />
      </div>
      <StatusBar
        zoom={zoom}
        frameTime={currentTime}
        resolution={
          videoInfo.width && videoInfo.height
            ? `${videoInfo.width}×${videoInfo.height}`
            : '—'
        }
        historyCount={currentShapes.length}
      />
    </div>
  );
}
