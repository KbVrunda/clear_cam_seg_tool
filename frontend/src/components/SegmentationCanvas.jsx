import { useState, useRef, useEffect } from 'react';
import { computeDisplaySize } from '../utils/canvasSizing';

const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=1600&h=900&fit=crop&auto=format';

export default function SegmentationCanvas({
  opacity = 60,
  zoom = 100,
  activeTool = 'brush',
  panMode = false,
  shapes = [],
  selectedShapeId = null,
  onShapeAdd,
  onShapeSelect,
  onShapeUpdate,
  onShapeDelete,
  frameImage = null,
  frameTime = null,
  videoInfo = {},
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState(null);
  const [currentShape, setCurrentShape] = useState(null);
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  const canAnnotate = Boolean(frameImage);
  const displaySrc = frameImage || PLACEHOLDER_IMAGE;
  const { width: displayWidth, height: displayHeight } = computeDisplaySize(videoInfo);
  const containerStyle = {
    width: '100%',
    maxWidth: `${displayWidth}px`,
    maxHeight: `${displayHeight}px`,
    flexShrink: 1,
  };

  useEffect(() => {
    setImageLoaded(false);
    setPosition({ x: 0, y: 0 });
    setIsDragging(false);
  }, [frameImage]);

  // Handle pan mode
  const handleMouseDown = (e) => {
    if (e.button !== 0) return; // Only handle left mouse button

    // Handle pan mode - if pan mode is ON, always allow panning
    if (panMode) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
      return;
    }

    if (!canAnnotate) return;

    // Handle eraser tool - delete shape on click
    if (activeTool === 'eraser') {
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - position.x) / (zoom / 100);
      const y = (e.clientY - rect.top - position.y) / (zoom / 100);

      // Find clicked shape
      const clickedShape = shapes.find((shape) => {
        if (shape.type === 'circle') {
          const dist = Math.sqrt(
            Math.pow(x - shape.x, 2) + Math.pow(y - shape.y, 2)
          );
          return dist <= shape.radius;
        }
        if (shape.type === 'square') {
          return (
            x >= shape.x - shape.size / 2 &&
            x <= shape.x + shape.size / 2 &&
            y >= shape.y - shape.size / 2 &&
            y <= shape.y + shape.size / 2
          );
        }
        return false;
      });

      if (clickedShape) {
        onShapeDelete(clickedShape.id);
        return;
      }
    }

    // Handle drawing - only when pan mode is OFF
    if (activeTool === 'brush') {
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - position.x) / (zoom / 100);
      const y = (e.clientY - rect.top - position.y) / (zoom / 100);

      setIsDrawing(true);
      setDrawStart({ x, y });

      // Check if clicking on existing shape
      const clickedShape = shapes.find((shape) => {
        if (shape.type === 'circle') {
          const dist = Math.sqrt(
            Math.pow(x - shape.x, 2) + Math.pow(y - shape.y, 2)
          );
          return dist <= shape.radius;
        }
        if (shape.type === 'square') {
          return (
            x >= shape.x - shape.size / 2 &&
            x <= shape.x + shape.size / 2 &&
            y >= shape.y - shape.size / 2 &&
            y <= shape.y + shape.size / 2
          );
        }
        return false;
      });

      if (clickedShape) {
        onShapeSelect(clickedShape.id);
        setIsDrawing(false);
        setDrawStart(null);
        return;
      }

      // Start drawing new shape (default to circle, can toggle with shift)
      const newShape = {
        id: Date.now(),
        type: e.shiftKey ? 'square' : 'circle',
        x,
        y,
        radius: 0,
        size: 0,
        opacity,
        color: '#ef4444',
      };
      setCurrentShape(newShape);
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && panMode) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
      return;
    }

    if (!canAnnotate || !isDrawing || !currentShape || activeTool !== 'brush') return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - position.x) / (zoom / 100);
    const y = (e.clientY - rect.top - position.y) / (zoom / 100);

    if (currentShape.type === 'circle') {
      const radius = Math.sqrt(
        Math.pow(x - drawStart.x, 2) + Math.pow(y - drawStart.y, 2)
      );
      setCurrentShape({ ...currentShape, radius, x: drawStart.x, y: drawStart.y });
    } else if (currentShape.type === 'square') {
      const size = Math.max(
        Math.abs(x - drawStart.x),
        Math.abs(y - drawStart.y)
      ) * 2;
      setCurrentShape({
        ...currentShape,
        size,
        x: drawStart.x,
        y: drawStart.y,
      });
    }
  };

  const finishDrawing = () => {
    if (isDrawing && currentShape) {
      if (currentShape.radius > 5 || currentShape.size > 5) {
        onShapeAdd(currentShape);
      }
      setIsDrawing(false);
      setCurrentShape(null);
      setDrawStart(null);
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      return;
    }
    if (!canAnnotate) return;
    finishDrawing();
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    if (!canAnnotate) return;
    finishDrawing();
  };

  // Handle keyboard delete
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedShapeId) {
        onShapeDelete(selectedShapeId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedShapeId, onShapeDelete]);

  const getCursor = () => {
    if (panMode) {
      return isDragging ? 'grabbing' : 'grab';
    }
    if (!canAnnotate) {
      return 'not-allowed';
    }
    if (activeTool === 'brush') {
      return 'crosshair';
    }
    if (activeTool === 'eraser') {
      return 'cell';
    }
    return 'default';
  };

  const allShapes = currentShape ? [...shapes, currentShape] : shapes;

  return (
    <div
      ref={containerRef}
      className="relative bg-gray-900 flex items-center justify-center overflow-hidden"
      style={{
        height: 'calc(100vh - 200px)',
        cursor: getCursor(),
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      <div
        ref={canvasRef}
        className="relative flex items-center justify-center"
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${zoom / 100})`,
          transformOrigin: 'center',
          ...containerStyle,
        }}
      >
        <img
          key={frameTime ?? 'placeholder'}
          src={displaySrc}
          alt={frameTime !== null ? `Frame at ${frameTime.toFixed(2)}s` : 'Segmentation frame'}
          className="select-none"
          style={{
            width: '100%',
            height: 'auto',
            pointerEvents: 'none',
            objectFit: 'contain',
          }}
          draggable={false}
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            e.target.src = PLACEHOLDER_IMAGE;
          }}
        />
        {imageLoaded && canAnnotate && (
          <div
            className="absolute pointer-events-none"
            style={{
              width: '100%',
              height: '100%',
              opacity: opacity / 100,
              background:
                'linear-gradient(45deg, rgba(239, 68, 68, 0.3) 25%, transparent 25%), linear-gradient(-45deg, rgba(239, 68, 68, 0.3) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(239, 68, 68, 0.3) 75%), linear-gradient(-45deg, transparent 75%, rgba(239, 68, 68, 0.3) 75%)',
              backgroundSize: '20px 20px',
              backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
            }}
          />
        )}
        {imageLoaded && (
          <svg
            className="absolute top-0 left-0"
            style={{
              width: '100%',
              height: '100%',
              pointerEvents: panMode || !canAnnotate ? 'none' : 'auto',
            }}
          >
            {allShapes.map((shape) => {
              const isSelected = shape.id === selectedShapeId;
              if (shape.type === 'circle') {
                return (
                  <circle
                    key={shape.id}
                    cx={shape.x}
                    cy={shape.y}
                    r={shape.radius}
                    fill={shape.color}
                    opacity={shape.opacity / 100}
                    stroke={isSelected ? '#3b82f6' : 'transparent'}
                    strokeWidth={isSelected ? 3 : 0}
                    style={{ cursor: 'pointer' }}
                    onClick={(e) => {
                      if (panMode || !canAnnotate) return;
                      e.stopPropagation();
                      onShapeSelect(shape.id);
                    }}
                  />
                );
              }
              return (
                <rect
                  key={shape.id}
                  x={shape.x - shape.size / 2}
                  y={shape.y - shape.size / 2}
                  width={shape.size}
                  height={shape.size}
                  fill={shape.color}
                  opacity={shape.opacity / 100}
                  stroke={isSelected ? '#3b82f6' : 'transparent'}
                  strokeWidth={isSelected ? 3 : 0}
                  style={{ cursor: 'pointer' }}
                  onClick={(e) => {
                    if (panMode || !canAnnotate) return;
                    e.stopPropagation();
                    onShapeSelect(shape.id);
                  }}
                />
              );
            })}
          </svg>
        )}
        {!canAnnotate && (
          <div
            className="absolute inset-0 flex items-center justify-center bg-black/50 text-gray-200 text-sm text-center px-4"
            style={{ width: '100%', height: '100%' }}
          >
            Frames are still loading. Please select a video frame from the timeline once available.
          </div>
        )}
      </div>
    </div>
  );
}
