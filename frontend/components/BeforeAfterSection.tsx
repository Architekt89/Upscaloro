'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function BeforeAfterSection() {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Handle client-side mounting to prevent hydration errors
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Handle mouse events for slider
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const containerWidth = containerRect.width;
      const offsetX = e.clientX - containerRect.left;
      
      // Calculate percentage position (0-100)
      let newPosition = (offsetX / containerWidth) * 100;
      
      // Clamp the value between 0 and 100
      newPosition = Math.max(0, Math.min(100, newPosition));
      
      setSliderPosition(newPosition);
    }
  };

  // Handle touch events for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && containerRef.current && e.touches[0]) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const containerWidth = containerRect.width;
      const offsetX = e.touches[0].clientX - containerRect.left;
      
      // Calculate percentage position (0-100)
      let newPosition = (offsetX / containerWidth) * 100;
      
      // Clamp the value between 0 and 100
      newPosition = Math.max(0, Math.min(100, newPosition));
      
      setSliderPosition(newPosition);
    }
  };

  // Set up intersection observer for fade-in effect
  useEffect(() => {
    if (!isMounted) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 } // Trigger when 10% of the element is visible
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, [isMounted]);

  // Add and remove event listeners
  useEffect(() => {
    if (!isMounted) return;
    
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mouseup', handleGlobalMouseUp);
    document.addEventListener('touchend', handleGlobalMouseUp);

    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('touchend', handleGlobalMouseUp);
    };
  }, [isMounted]);

  // If not mounted yet (server-side), render a placeholder
  if (!isMounted) {
    return (
      <section className="relative bg-[#0D0D0D] overflow-hidden py-16 md:py-24 -mt-16 md:-mt-24">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <div className="w-full max-w-5xl mx-auto rounded-xl overflow-hidden shadow-2xl" style={{ aspectRatio: '16/9' }}>
            <div className="w-full h-full bg-gray-900/60"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative bg-[#0D0D0D] overflow-hidden py-16 md:py-24 -mt-16 md:-mt-24">
      {/* Background glow effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-orange-500/10 rounded-full blur-[100px]"></div>
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-orange-500/10 rounded-full blur-[100px]"></div>
      </div>
      
      {/* Content container */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className="text-center mb-12">
          {/* Section Label */}
          <div className="inline-block px-4 py-1 rounded-full border border-white/30 text-white text-sm font-medium mb-6">
            Image Transformation
          </div>
          
          {/* Main Heading with Gradient */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
            <span className="bg-gradient-to-r from-orange-500 via-orange-400 to-white bg-clip-text text-transparent">
              See the Difference
            </span>
          </h2>
          <p className="max-w-2xl mx-auto text-gray-300 text-lg md:text-xl mb-12">
            Drag the slider to reveal the transformation
          </p>
        </div>
        
        {/* Before/After Image Comparison */}
        <div 
          ref={containerRef}
          className={`relative w-full max-w-5xl mx-auto rounded-xl overflow-hidden shadow-2xl 
            transition-all duration-1000 ease-out
            ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
          style={{ aspectRatio: '16/9' }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Before Image (Left Side) */}
          <div className="absolute inset-0 brightness-90">
            <Image
              src="/images/before-image.png"
              alt="Before transformation"
              fill
              className="object-cover"
              priority
            />
            
            {/* Before Label */}
            <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm transition-all duration-300 hover:bg-black/70">
              Before
            </div>
          </div>
          
          {/* After Image (Right Side) */}
          <div 
            className="absolute inset-0 brightness-110 clip-path-polygon"
            style={{ 
              clipPath: `polygon(${sliderPosition}% 0, 100% 0, 100% 100%, ${sliderPosition}% 100%)` 
            }}
          >
            <Image
              src="/images/after-image.png"
              alt="After transformation"
              fill
              className="object-cover"
              priority
            />
            
            {/* After Label */}
            <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm transition-all duration-300 hover:bg-black/70">
              After
            </div>
          </div>
          
          {/* Slider Handle */}
          <div 
            ref={sliderRef}
            className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize group"
            style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 
              flex items-center justify-center shadow-lg
              transition-all duration-300 group-hover:scale-110 group-hover:shadow-orange-500/30 group-hover:shadow-lg">
              <div className="flex items-center justify-center">
                <ChevronLeft className="h-4 w-4 text-gray-800" />
                <ChevronRight className="h-4 w-4 text-gray-800" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 