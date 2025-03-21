import React, { useState, useEffect, useRef } from 'react';

interface ImageComparisonSliderProps {
  beforeImage: string;
  afterImage: string;
  className?: string;
}

const ImageComparisonSlider: React.FC<ImageComparisonSliderProps> = ({
  beforeImage,
  afterImage,
  className = '',
}) => {
  const [isResizing, setIsResizing] = useState(false);
  const [position, setPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  // Function to handle clicks/taps on the container to move the slider
  const handleContainerClick = (e: React.MouseEvent | React.TouchEvent) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    let clientX: number;
    
    // Handle both mouse and touch events
    if ('clientX' in e) {
      clientX = e.clientX;
    } else if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
    } else {
      return;
    }
    
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percentage = (x / rect.width) * 100;
    setPosition(percentage);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      const percentage = (x / rect.width) * 100;
      setPosition(percentage);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  // Handle touch events
  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => {
      if (!isResizing || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.touches[0].clientX - rect.left, rect.width));
      const percentage = (x / rect.width) * 100;
      setPosition(percentage);

      // Prevent scrolling while dragging
      e.preventDefault();
    };

    const handleTouchEnd = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isResizing]);

  return (
    <div
      ref={containerRef}
      className={`relative select-none overflow-hidden rounded-lg ${className}`}
      onClick={handleContainerClick}
      onTouchEnd={(e) => {
        // Only handle touch end if not resizing (to avoid conflicts with drag)
        if (!isResizing) {
          handleContainerClick(e);
        }
      }}
    >
      {/* Original Image (Left Side) */}
      <div className="absolute inset-0">
        <img
          src={afterImage}
          alt="Original"
          className="h-full w-full object-contain"
        />
      </div>

      {/* Upscaled Image (Right Side - shown through clip-path) */}
      <div
        className="absolute inset-0"
        style={{
          clipPath: `inset(0 0 0 ${position}%)`,
        }}
      >
        <img
          src={beforeImage}
          alt="Upscaled"
          className="h-full w-full object-contain"
        />
      </div>

      {/* Slider Handle */}
      <div
        className="absolute inset-y-0 cursor-ew-resize"
        style={{ left: `${position}%` }}
        onMouseDown={(e) => {
          e.stopPropagation(); // Prevent container click when dragging handle
          setIsResizing(true);
        }}
        onTouchStart={(e) => {
          e.stopPropagation(); // Prevent container click when dragging handle
          setIsResizing(true);
        }}
      >
        <div className="absolute inset-y-0 -left-px w-0.5 bg-white">
          <div className="absolute left-1/2 top-1/2 h-9 w-9 md:h-10 md:w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-black/40 backdrop-blur shadow-lg">
            <div className="flex h-full items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-white"
              >
                <path d="M21 12H3M9 18l-6-6 6-6M15 18l6-6-6-6" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute bottom-2 md:bottom-4 left-2 md:left-4 rounded bg-black/40 px-2 py-1 text-xs md:text-sm text-white backdrop-blur">
        Original
      </div>
      <div className="absolute bottom-2 md:bottom-4 right-2 md:right-4 rounded bg-black/40 px-2 py-1 text-xs md:text-sm text-white backdrop-blur">
        Upscaled
      </div>
    </div>
  );
};

export default ImageComparisonSlider; 