import { useRef, useEffect, useState } from 'react';

export default function VideoPlayer({
  videoUrl,
  currentTime = 0,
  isPlaying = false,
  onTimeUpdate,
  onPlay,
  onPause,
  onLoadedMetadata,
  onError,
}) {
  const videoRef = useRef(null);
  const [isReady, setIsReady] = useState(false);

  // Sync external currentTime with video element
  useEffect(() => {
    if (videoRef.current && Math.abs(videoRef.current.currentTime - currentTime) > 0.5) {
      videoRef.current.currentTime = currentTime;
    }
  }, [currentTime]);

  // Sync playing state
  useEffect(() => {
    if (!videoRef.current || !isReady) return;
    if (isPlaying) {
      videoRef.current.play().catch(console.error);
    } else {
      videoRef.current.pause();
    }
  }, [isPlaying, isReady]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      onTimeUpdate?.(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    setIsReady(true);
    if (videoRef.current) {
      onLoadedMetadata?.({
        duration: videoRef.current.duration,
        width: videoRef.current.videoWidth,
        height: videoRef.current.videoHeight,
      });
    }
  };

  const handlePlay = () => {
    onPlay?.();
  };

  const handlePause = () => {
    onPause?.();
  };

  const handleError = (e) => {
    console.error('Video error', e);
    const errorMessage = videoUrl 
      ? `Failed to load video: ${videoUrl.includes('storage.googleapis.com') ? 'GCS video' : videoUrl}`
      : 'Failed to load video.';
    onError?.(errorMessage);
  };

  // Only set crossOrigin for local files, not for GCS signed URLs
  const shouldUseCrossOrigin = videoUrl && !videoUrl.includes('storage.googleapis.com') && !videoUrl.includes('http');

  return (
    <video
      ref={videoRef}
      src={videoUrl}
      className="w-full h-full object-contain"
      onTimeUpdate={handleTimeUpdate}
      onLoadedMetadata={handleLoadedMetadata}
      onPlay={handlePlay}
      onPause={handlePause}
      onError={handleError}
      crossOrigin={shouldUseCrossOrigin ? "anonymous" : undefined}
      playsInline
    />
  );
}

