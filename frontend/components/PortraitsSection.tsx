'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import dynamic from 'next/dynamic';

interface PortraitSlide {
  id: string;
  beforeImage: string;
  afterImage: string;
  alt: string;
}

// Define a type for the slider positions
interface SliderPositions {
  [key: string]: number;
}

// Create a client-side only component
const PortraitSlider = ({ 
  portrait, 
  position, 
  onDragStart,
  onSliderClick
}: { 
  portrait: PortraitSlide; 
  position: number; 
  onDragStart: (e: React.MouseEvent | React.TouchEvent, id: string) => void;
  onSliderClick: (e: React.MouseEvent | React.TouchEvent, id: string) => void;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleContainerClick = (e: React.MouseEvent | React.TouchEvent) => {
    if (containerRef.current) {
      onSliderClick(e, portrait.id);
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative rounded-xl overflow-visible shadow-2xl select-none"
      style={{ aspectRatio: '4/5', maxWidth: '100%' }}
      onClick={handleContainerClick}
      onTouchEnd={handleContainerClick}
    >
      {/* Before Image (Left Side) */}
      <div className="absolute inset-0 brightness-90 filter">
        <Image
          src={portrait.beforeImage}
          alt={`Before ${portrait.alt}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
        
        {/* Before Label */}
        <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm transition-all duration-300 hover:bg-black/70">
          Before
        </div>
      </div>
      
      {/* After Image (Right Side) */}
      <div 
        className="absolute inset-0 brightness-110 filter"
        style={{ 
          clipPath: `polygon(${position}% 0, 100% 0, 100% 100%, ${position}% 100%)` 
        }}
      >
        <Image
          src={portrait.afterImage}
          alt={`After ${portrait.alt}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
        
        {/* After Label */}
        <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm transition-all duration-300 hover:bg-black/70">
          After
        </div>
      </div>
      
      {/* Slider Handle */}
      <div
        className="absolute inset-y-0 cursor-ew-resize z-50"
        style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
        onMouseDown={(e) => {
          e.stopPropagation(); // Prevent container click
          onDragStart(e, portrait.id);
        }}
        onTouchStart={(e) => {
          e.stopPropagation(); // Prevent container touch
          onDragStart(e, portrait.id);
        }}
      >
        <div className="absolute inset-y-0 -left-px w-0.5 bg-white">
          <div className="absolute left-1/2 top-1/2 h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-black/40 backdrop-blur">
            <div className="flex h-full items-center justify-center">
              <div className="flex items-center justify-center">
                <ChevronLeft className="h-4 w-4 text-white" />
                <ChevronRight className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Use dynamic import for client-side only rendering
const DynamicPortraitSlider = dynamic(() => Promise.resolve(PortraitSlider), {
  ssr: false
});

export default function PortraitsSection() {
  // Portrait slides data
  const portraits: PortraitSlide[] = [
    {
      id: 'papau',
      beforeImage: '/images/papau_before.png',
      afterImage: '/images/papau_after.png',
      alt: 'Papua portrait transformation'
    },
    {
      id: 'sadhu',
      beforeImage: '/images/sadhu_before.png',
      afterImage: '/images/sadhu_after.png',
      alt: 'Sadhu portrait transformation'
    }
  ];

  // State for slider positions (one for each slider)
  const [sliderPositions, setSliderPositions] = useState<SliderPositions>({
    papau: 50,
    sadhu: 50
  });
  
  // State for tracking which slider is being dragged
  const [draggingId, setDraggingId] = useState<string | null>(null);
  
  // State for mobile carousel
  const [activeSlide, setActiveSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  
  // Refs for container elements
  const containerRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Handle client-side mounting to prevent hydration errors
  useEffect(() => {
    setIsMounted(true);
    
    // Check if mobile on mount and on resize
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

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

  // Handle mouse events for slider dragging
  useEffect(() => {
    if (!isMounted || !draggingId) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      const container = document.getElementById(`slider-container-${draggingId}`);
      if (!container) return;
      
      const rect = container.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      const percentage = (x / rect.width) * 100;
      
      setSliderPositions(prev => ({
        ...prev,
        [draggingId]: percentage
      }));
    };

    const handleMouseUp = () => {
      setDraggingId(null);
    };

    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isMounted, draggingId]);

  // Handle touch events for slider dragging
  useEffect(() => {
    if (!isMounted || !draggingId) return;
    
    const handleTouchMove = (e: TouchEvent) => {
      // Always prevent default to stop scrolling
      e.preventDefault();
      
      const container = document.getElementById(`slider-container-${draggingId}`);
      if (!container) return;
      
      const rect = container.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.touches[0].clientX - rect.left, rect.width));
      const percentage = (x / rect.width) * 100;
      
      setSliderPositions(prev => ({
        ...prev,
        [draggingId]: percentage
      }));
    };

    const handleTouchEnd = () => {
      setDraggingId(null);
    };

    // Add event listeners
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isMounted, draggingId]);

  // Start dragging
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent, id: string) => {
    e.preventDefault();
    setDraggingId(id);
  };

  // Handle slider click (for mobile and desktop)
  const handleSliderClick = (e: React.MouseEvent | React.TouchEvent, id: string) => {
    // Only handle clicks when not dragging
    if (draggingId) return;
    
    const container = document.getElementById(`slider-container-${id}`);
    if (!container) return;
    
    // Get the click/touch position
    let clientX = 0;
    if ('clientX' in e) {
      // Mouse event
      clientX = e.clientX;
    } else if (e.touches && e.touches.length > 0) {
      // Touch event
      clientX = e.touches[0].clientX;
    } else if (e.changedTouches && e.changedTouches.length > 0) {
      // Touch end event
      clientX = e.changedTouches[0].clientX;
    }
    
    const rect = container.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percentage = (x / rect.width) * 100;
    
    setSliderPositions(prev => ({
      ...prev,
      [id]: percentage
    }));
  };

  // Handle carousel navigation
  const goToSlide = (index: number) => {
    setActiveSlide(index);
    if (carouselRef.current) {
      carouselRef.current.scrollTo({
        left: index * carouselRef.current.offsetWidth,
        behavior: 'smooth'
      });
    }
  };

  // Handle carousel scroll
  const handleCarouselScroll = () => {
    if (carouselRef.current) {
      const scrollPosition = carouselRef.current.scrollLeft;
      const slideWidth = carouselRef.current.offsetWidth;
      const newActiveSlide = Math.round(scrollPosition / slideWidth);
      
      if (newActiveSlide !== activeSlide) {
        setActiveSlide(newActiveSlide);
      }
    }
  };

  // If not mounted yet (server-side), render a placeholder
  if (!isMounted) {
    return (
      <section className="relative bg-[#000000] overflow-hidden py-16 md:py-24">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <div className="w-full max-w-5xl mx-auto rounded-xl overflow-hidden shadow-2xl" style={{ aspectRatio: '16/9' }}>
            <div className="w-full h-full bg-gray-900/60"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section 
      ref={containerRef}
      className="relative bg-[#000000] py-16 md:py-24"
    >
      {/* Content container */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className={`text-center mb-12 transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {/* Section Label */}
          <div className="inline-block px-4 py-1 rounded-full border border-white/30 text-white text-sm font-medium mb-6">
            Portrait Enhancement
          </div>
          
          {/* Main Heading with Gradient */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4 font-poppins">
            <span className="text-white">Transform </span>
            <span className="bg-gradient-to-r from-orange-500 via-orange-400 to-white bg-clip-text text-transparent">
              Portrait Photography
            </span>
          </h2>
          <p className="max-w-2xl mx-auto text-white/80 text-lg md:text-xl mb-8">
            Our AI upscaling technology brings out incredible detail in portrait photography, 
            enhancing facial features while maintaining natural skin textures.
          </p>
        </div>
        
        {/* Desktop: Two side-by-side sliders */}
        <div className={`hidden md:grid grid-cols-2 gap-8 transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {portraits.map((portrait) => (
            <div 
              key={portrait.id}
              id={`slider-container-${portrait.id}`}
              className="relative"
            >
              {isMounted && (
                <DynamicPortraitSlider
                  portrait={portrait}
                  position={sliderPositions[portrait.id]}
                  onDragStart={handleDragStart}
                  onSliderClick={handleSliderClick}
                />
              )}
            </div>
          ))}
        </div>
        
        {/* Mobile: Swipeable Carousel */}
        <div className={`md:hidden transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div 
            ref={carouselRef}
            className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
            style={{ 
              scrollbarWidth: 'none', 
              msOverflowStyle: 'none',
              touchAction: draggingId ? 'none' : 'pan-x'
            }}
            onScroll={handleCarouselScroll}
          >
            {portraits.map((portrait, index) => (
              <div 
                key={portrait.id}
                className="flex-shrink-0 w-full snap-center"
                style={{ scrollSnapAlign: 'center' }}
              >
                <div 
                  id={`slider-container-${portrait.id}`}
                  className="relative mx-auto"
                  style={{ maxWidth: '90vw' }}
                >
                  {isMounted && (
                    <DynamicPortraitSlider
                      portrait={portrait}
                      position={sliderPositions[portrait.id]}
                      onDragStart={handleDragStart}
                      onSliderClick={handleSliderClick}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Carousel Indicators */}
          <div className="flex justify-center mt-6 space-x-2">
            {portraits.map((portrait, index) => (
              <button
                key={portrait.id}
                onClick={() => goToSlide(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  activeSlide === index 
                    ? 'bg-orange-500 w-8' 
                    : 'bg-white/30 hover:bg-white/50'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
} 