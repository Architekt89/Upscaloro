'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PortraitSlide {
  id: string;
  beforeImage: string;
  afterImage: string;
  alt: string;
}

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
  const [sliderPositions, setSliderPositions] = useState<{ [key: string]: number }>({
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
  const sliderRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const imageContainerRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

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

  // Handle mouse events for sliders
  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setDraggingId(id);
    
    // Immediately update position on click
    updateSliderPosition(e.clientX, id);
  };

  const handleMouseUp = () => {
    setDraggingId(null);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingId && imageContainerRefs.current[draggingId]) {
      updateSliderPosition(e.clientX, draggingId);
    }
  };

  // Update slider position based on mouse or touch position
  const updateSliderPosition = (clientX: number, id: string) => {
    const containerRect = imageContainerRefs.current[id]?.getBoundingClientRect();
    if (!containerRect) return;
    
    const containerWidth = containerRect.width;
    const offsetX = clientX - containerRect.left;
    
    // Calculate percentage position (0-100)
    let newPosition = (offsetX / containerWidth) * 100;
    
    // Clamp the value between 0 and 100
    newPosition = Math.max(0, Math.min(100, newPosition));
    
    setSliderPositions(prev => ({
      ...prev,
      [id]: newPosition
    }));
  };

  // Handle touch events for mobile
  const handleTouchStart = (e: React.TouchEvent, id: string) => {
    if (e.touches.length === 1) {
      e.preventDefault();
      setDraggingId(id);
      
      // Immediately update position on touch
      updateSliderPosition(e.touches[0].clientX, id);
    }
  };

  const handleTouchEnd = () => {
    setDraggingId(null);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (draggingId && e.touches.length === 1 && imageContainerRefs.current[draggingId]) {
      e.preventDefault();
      updateSliderPosition(e.touches[0].clientX, draggingId);
    }
  };

  // Add and remove event listeners for global mouse/touch events
  useEffect(() => {
    if (!isMounted) return;
    
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (draggingId && imageContainerRefs.current[draggingId]) {
        updateSliderPosition(e.clientX, draggingId);
      }
    };
    
    const handleGlobalTouchMove = (e: TouchEvent) => {
      if (draggingId && e.touches.length === 1 && imageContainerRefs.current[draggingId]) {
        updateSliderPosition(e.touches[0].clientX, draggingId);
      }
    };
    
    const handleGlobalMouseUp = () => {
      setDraggingId(null);
    };

    // Add global event listeners when dragging
    if (draggingId) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('touchmove', handleGlobalTouchMove, { passive: false });
    }
    
    document.addEventListener('mouseup', handleGlobalMouseUp);
    document.addEventListener('touchend', handleGlobalMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('touchmove', handleGlobalTouchMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('touchend', handleGlobalMouseUp);
    };
  }, [isMounted, draggingId]);

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

  // Ref callbacks
  const setSliderRef = (id: string) => (el: HTMLDivElement | null) => {
    sliderRefs.current[id] = el;
  };
  
  const setImageContainerRef = (id: string) => (el: HTMLDivElement | null) => {
    imageContainerRefs.current[id] = el;
  };

  // If not mounted yet (server-side), render a placeholder
  if (!isMounted) {
    return (
      <section className="relative bg-[#0D0D0D] overflow-hidden py-16 md:py-24">
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
      className="relative bg-[#0D0D0D] overflow-hidden py-16 md:py-24"
    >
      {/* Background glow effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-orange-500/10 rounded-full blur-[100px]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-500/5 rounded-full blur-[150px]"></div>
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-orange-500/10 rounded-full blur-[100px]"></div>
      </div>
      
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
              ref={setImageContainerRef(portrait.id)}
              className="relative rounded-xl overflow-hidden shadow-2xl cursor-ew-resize"
              style={{ aspectRatio: '4/5' }}
              onMouseDown={(e) => handleMouseDown(e, portrait.id)}
              onMouseUp={handleMouseUp}
              onTouchStart={(e) => handleTouchStart(e, portrait.id)}
              onTouchEnd={handleTouchEnd}
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
                  clipPath: `polygon(${sliderPositions[portrait.id]}% 0, 100% 0, 100% 100%, ${sliderPositions[portrait.id]}% 100%)` 
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
                ref={setSliderRef(portrait.id)}
                className="absolute top-0 bottom-0 w-0.5 bg-white/80 cursor-ew-resize group z-10"
                style={{ left: `${sliderPositions[portrait.id]}%`, transform: 'translateX(-50%)' }}
              >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 
                  flex items-center justify-center shadow-lg
                  transition-all duration-300 group-hover:scale-110 group-hover:shadow-orange-500/50 group-hover:shadow-lg">
                  <div className="flex items-center justify-center">
                    <ChevronLeft className="h-4 w-4 text-gray-800" />
                    <ChevronRight className="h-4 w-4 text-gray-800" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Mobile: Swipeable Carousel */}
        <div className={`md:hidden transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div 
            ref={carouselRef}
            className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            onScroll={handleCarouselScroll}
          >
            {portraits.map((portrait, index) => (
              <div 
                key={portrait.id}
                className="flex-shrink-0 w-full snap-center"
                style={{ scrollSnapAlign: 'center' }}
              >
                <div 
                  ref={setImageContainerRef(portrait.id)}
                  className="relative mx-auto rounded-xl overflow-hidden shadow-2xl cursor-ew-resize"
                  style={{ aspectRatio: '4/5', maxWidth: '90vw' }}
                  onMouseDown={(e) => handleMouseDown(e, portrait.id)}
                  onMouseUp={handleMouseUp}
                  onTouchStart={(e) => handleTouchStart(e, portrait.id)}
                  onTouchEnd={handleTouchEnd}
                >
                  {/* Before Image (Left Side) */}
                  <div className="absolute inset-0 brightness-90 filter">
                    <Image
                      src={portrait.beforeImage}
                      alt={`Before ${portrait.alt}`}
                      fill
                      className="object-cover"
                      sizes="100vw"
                      priority
                    />
                    
                    {/* Before Label */}
                    <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
                      Before
                    </div>
                  </div>
                  
                  {/* After Image (Right Side) */}
                  <div 
                    className="absolute inset-0 brightness-110 filter"
                    style={{ 
                      clipPath: `polygon(${sliderPositions[portrait.id]}% 0, 100% 0, 100% 100%, ${sliderPositions[portrait.id]}% 100%)` 
                    }}
                  >
                    <Image
                      src={portrait.afterImage}
                      alt={`After ${portrait.alt}`}
                      fill
                      className="object-cover"
                      sizes="100vw"
                      priority
                    />
                    
                    {/* After Label */}
                    <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
                      After
                    </div>
                  </div>
                  
                  {/* Slider Handle */}
                  <div 
                    ref={setSliderRef(portrait.id)}
                    className="absolute top-0 bottom-0 w-0.5 bg-white/80 cursor-ew-resize z-10"
                    style={{ left: `${sliderPositions[portrait.id]}%`, transform: 'translateX(-50%)' }}
                  >
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 
                      flex items-center justify-center shadow-lg">
                      <div className="flex items-center justify-center">
                        <ChevronLeft className="h-4 w-4 text-gray-800" />
                        <ChevronRight className="h-4 w-4 text-gray-800" />
                      </div>
                    </div>
                  </div>
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