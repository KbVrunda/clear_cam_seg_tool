import { useCallback, useEffect, useMemo, useState } from 'react';
import SegmentationCanvas from './SegmentationCanvas';
import ToolPanel from './ToolPanel';
import LabelSidebar from './LabelSidebar';
import StatusBar from './StatusBar';
import TopBar from './TopBar';
import FrameTimeline from './FrameTimeline';
import VideoLibraryPanel from './VideoLibraryPanel';
import { uploadAnnotatedFrame } from '../api/client';
import { computeDisplaySize } from '../utils/canvasSizing';

const FRAME_INTERVAL_SECONDS = 10;
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
  const [videoListError, setVideoListError] = useState('Google Cloud integration to be implemented.');
  const [isVideoPanelOpen, setIsVideoPanelOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(FALLBACK_VIDEO);

  const [frames, setFrames] = useState([]);
  const [isGeneratingFrames, setIsGeneratingFrames] = useState(false);
  const [frameError, setFrameError] = useState(null);
  const [selectedFrame, setSelectedFrame] = useState(null);
  const [videoInfo, setVideoInfo] = useState({ width: null, height: null, duration: null });

  const [frameAnnotations, setFrameAnnotations] = useState({});
  const [selectedShapeId, setSelectedShapeId] = useState(null);

  const [saveStatus, setSaveStatus] = useState(null);
  const [saveError, setSaveError] = useState(null);

  const currentVideoKey = selectedVideo?.name || null;

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

  const currentShapes = useMemo(() => {
    if (!selectedVideo || !selectedFrame) return [];
    return frameAnnotations[currentVideoKey]?.[selectedFrame.time] || [];
  }, [frameAnnotations, selectedVideo, selectedFrame, currentVideoKey]);

  const updateAnnotationsForFrame = useCallback(
    (frameTime, updater) => {
      if (!selectedVideo) return;
      setFrameAnnotations((prev) => {
        const videoAnnotations = prev[currentVideoKey] || {};
        const existing = videoAnnotations[frameTime] || [];
        const updated = updater(existing);
        return {
          ...prev,
          [currentVideoKey]: {
            ...videoAnnotations,
            [frameTime]: updated,
          },
        };
      });
    },
    [selectedVideo, currentVideoKey]
  );

  const handleShapeAdd = useCallback(
    (shape) => {
      if (!selectedVideo || !selectedFrame) return;
      updateAnnotationsForFrame(selectedFrame.time, (existing) => [...existing, shape]);
      setSelectedShapeId(shape.id);
    },
    [selectedVideo, selectedFrame, updateAnnotationsForFrame]
  );

  const handleShapeUpdate = useCallback(
    (shapeId, updates) => {
      if (!selectedVideo || !selectedFrame) return;
      updateAnnotationsForFrame(selectedFrame.time, (existing) =>
        existing.map((shape) => (shape.id === shapeId ? { ...shape, ...updates } : shape))
      );
    },
    [selectedVideo, selectedFrame, updateAnnotationsForFrame]
  );

  const handleShapeDelete = useCallback(
    (shapeId) => {
      if (!selectedVideo || !selectedFrame) return;
      updateAnnotationsForFrame(selectedFrame.time, (existing) =>
        existing.filter((shape) => shape.id !== shapeId)
      );
      if (selectedShapeId === shapeId) {
        setSelectedShapeId(null);
      }
    },
    [selectedVideo, selectedFrame, selectedShapeId, updateAnnotationsForFrame]
  );

  const handleOpacityChange = (newOpacity) => {
    setOpacity(newOpacity);
    if (selectedShapeId && selectedFrame) {
      handleShapeUpdate(selectedShapeId, { opacity: newOpacity });
    }
  };

  const loadFramesFromLocal = useCallback(async () => {
    setIsGeneratingFrames(true);
    setFrameError(null);
    setFrames([]);
    setVideoInfo({ width: null, height: null, duration: null });
    setSelectedFrame(null);
    setSelectedShapeId(null);

    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) {
      setFrameError('Canvas is not supported in this browser.');
      setIsGeneratingFrames(false);
      return;
    }

    const cleanup = () => {
      video.pause();
      video.removeAttribute('src');
      video.load();
    };

    const captureFrame = (time) =>
      new Promise((resolve, reject) => {
        const seekTime = Math.min(time, Math.max(video.duration - 0.1, 0));

        const handleSeeked = () => {
          try {
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const image = canvas.toDataURL('image/jpeg', 0.8);
            resolve({ time, image });
          } catch (err) {
            reject(err);
          } finally {
            video.removeEventListener('error', handleError);
          }
        };

        const handleError = (event) => {
          video.removeEventListener('seeked', handleSeeked);
          reject(event instanceof Error ? event : new Error('Failed to capture frame.'));
        };

        video.addEventListener('seeked', handleSeeked, { once: true });
        video.addEventListener('error', handleError, { once: true });
        video.currentTime = seekTime;
      });

    const handleMetadata = async () => {
      try {
        const { duration, videoWidth, videoHeight } = video;
        if (!duration || Number.isNaN(duration)) {
          throw new Error('Video metadata unavailable');
        }

        canvas.width = videoWidth || 1920;
        canvas.height = videoHeight || 1080;
        setVideoInfo({ width: videoWidth, height: videoHeight, duration });

        const captureTimes = [];
        for (let time = 0; time < duration; time += FRAME_INTERVAL_SECONDS) {
          captureTimes.push(time);
        }
        if (!captureTimes.length || duration - captureTimes[captureTimes.length - 1] > 1) {
          captureTimes.push(duration);
        }

        const newFrames = [];
        for (const time of captureTimes) {
          try {
            const frame = await captureFrame(time);
            newFrames.push(frame);
          } catch (error) {
            console.error('Frame capture failed', error);
            setFrameError('Unable to capture frames from the video. The file may be corrupted.');
            break;
          }
        }

        if (newFrames.length) {
          setFrames(newFrames);
          setSelectedFrame(newFrames[0]);
        }
      } catch (error) {
        console.error('Video processing failed', error);
        const message = error?.message?.includes('metadata')
          ? 'Video appears to be corrupted.'
          : 'Failed to load the video frames.';
        setFrameError(message);
      } finally {
        setIsGeneratingFrames(false);
      }
    };

    const handleVideoError = (event) => {
      console.error('Video load error', event);
      setFrameError('Failed to load video. It may be corrupted or inaccessible.');
      setIsGeneratingFrames(false);
    };

    video.crossOrigin = 'anonymous';
    video.preload = 'auto';
    video.muted = true;
    video.addEventListener('error', handleVideoError, { once: true });
    video.addEventListener('loadedmetadata', handleMetadata, { once: true });
    video.src = FALLBACK_VIDEO_URL;
    video.load();

    return cleanup;
  }, []);

  useEffect(() => {
    setSelectedVideo(FALLBACK_VIDEO);
    loadFramesFromLocal();
  }, [loadFramesFromLocal]);

  const handleVideoSelect = useCallback(
    async () => {
      setIsVideoPanelOpen(false);
      setFrameError('Google Cloud integration to be implemented.');
      setSaveStatus(null);
      setSaveError(null);
      setSelectedVideo(FALLBACK_VIDEO);
      await loadFramesFromLocal();
    },
    [loadFramesFromLocal]
  );

  const handleFrameSelect = useCallback((frame) => {
    setSelectedFrame(frame);
    setSelectedShapeId(null);
    setSaveStatus(null);
    setSaveError(null);
  }, []);

  const composeAnnotatedImage = useCallback(async () => {
    if (!selectedFrame) {
      throw new Error('Select a frame before saving.');
    }

    const baseImage = new Image();
    baseImage.crossOrigin = 'anonymous';
    baseImage.src = selectedFrame.image;
    await baseImage.decode();

    const canvas = document.createElement('canvas');
    canvas.width = baseImage.width;
    canvas.height = baseImage.height;
    const context = canvas.getContext('2d');
    context.drawImage(baseImage, 0, 0);

    const { width: displayWidth, height: displayHeight } = computeDisplaySize(videoInfo);
    const scaleX = displayWidth ? canvas.width / displayWidth : 1;
    const scaleY = displayHeight ? canvas.height / displayHeight : 1;
    const scaleAvg = (scaleX + scaleY) / 2;

    currentShapes.forEach((shape) => {
      context.globalAlpha = (shape.opacity ?? 60) / 100;
      context.fillStyle = shape.color || '#ef4444';
      if (shape.type === 'circle') {
        const scaledRadius = shape.radius * scaleAvg;
        context.beginPath();
        context.arc(shape.x * scaleX, shape.y * scaleY, scaledRadius, 0, Math.PI * 2);
        context.fill();
      } else if (shape.type === 'square') {
        const scaledSize = shape.size * scaleAvg;
        context.fillRect(
          shape.x * scaleX - scaledSize / 2,
          shape.y * scaleY - scaledSize / 2,
          scaledSize,
          scaledSize
        );
      }
      context.globalAlpha = 1;
    });

    return canvas.toDataURL('image/png');
  }, [selectedFrame, currentShapes, videoInfo]);

  const handleSaveAnnotation = useCallback(async () => {
    if (!selectedVideo) {
      setSaveError('Select a video before saving annotations.');
      return;
    }
    if (!selectedFrame) {
      setSaveError('Select a frame before saving annotations.');
      return;
    }

    try {
      setSaveError(null);
      setSaveStatus('Saving…');
      const imageData = await composeAnnotatedImage();
      const response = await uploadAnnotatedFrame({
        fileName: undefined,
        imageData,
        videoName: selectedVideo.name,
        frameTime: selectedFrame.time,
      });
      setSaveStatus(`Saved to ${response.bucket}/${response.objectPath}`);
    } catch (error) {
      console.error('Save annotation failed', error);
      const message = error.message || 'Failed to save annotation.';
      setSaveError(message);
      setSaveStatus(null);
    }
  }, [selectedVideo, selectedFrame, composeAnnotatedImage]);

  const selectedShapeOpacity = selectedShapeId
    ? currentShapes.find((shape) => shape.id === selectedShapeId)?.opacity
    : null;

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <ToolPanel activeTool={activeTool} onToolChange={handleToolChange} />
        <div className="flex-1 flex flex-col min-w-0 relative">
          <VideoLibraryPanel
            isOpen={isVideoPanelOpen}
            onToggle={() => setIsVideoPanelOpen((open) => !open)}
            videos={videos}
            loading={false}
            error={videoListError}
            selectedVideoName={selectedVideo?.name || null}
            onSelect={handleVideoSelect}
            onRefresh={() => {}}
          />

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
                disabled={!selectedFrame || isGeneratingFrames}
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

          {(videoListError || saveStatus || saveError) && (
            <div className="px-6 py-2 text-sm border-b border-gray-200 bg-white space-y-1">
              {videoListError && (
                <div className="text-blue-600">{videoListError}</div>
              )}
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
            frameImage={selectedFrame?.image ?? null}
            frameTime={selectedFrame?.time ?? null}
            videoInfo={videoInfo}
          />
          <FrameTimeline
            frames={frames}
            selectedFrameTime={selectedFrame?.time ?? null}
            onSelect={handleFrameSelect}
            isLoading={isGeneratingFrames}
            error={frameError}
          />
        </div>
        <LabelSidebar
          opacity={selectedShapeOpacity ?? opacity}
          onOpacityChange={handleOpacityChange}
        />
      </div>
      <StatusBar
        zoom={zoom}
        frameTime={selectedFrame?.time ?? null}
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

