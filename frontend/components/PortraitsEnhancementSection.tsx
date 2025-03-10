'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SliderProps {
  beforeImage: string;
  afterImage: string;
  beforeAlt: string;
  afterAlt: string;
}

const ImageSlider = ({ beforeImage, afterImage, beforeAlt, afterAlt }: SliderProps) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

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
  }, []);

  // Add and remove event listeners
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mouseup', handleGlobalMouseUp);
    document.addEventListener('touchend', handleGlobalMouseUp);

    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('touchend', handleGlobalMouseUp);
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`relative w-full rounded-xl overflow-hidden shadow-2xl 
        transition-all duration-1000 ease-out p-1 bg-[#0a0a0a] border border-gray-800/50
        ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
      style={{ aspectRatio: '4/5' }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Grid background pattern */}
      <div className="absolute inset-0 grid grid-cols-12 grid-rows-12 gap-4 pointer-events-none opacity-10">
        {Array.from({ length: 144 }).map((_, i) => (
          <div key={i} className="border border-gray-700/30"></div>
        ))}
      </div>
      
      {/* Before Image (Left Side) */}
      <div className="absolute inset-0 brightness-90">
        <Image
          src={beforeImage}
          alt={beforeAlt}
          fill
          className="object-cover"
          style={{ filter: 'blur(0.25px)' }}
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
          src={afterImage}
          alt={afterAlt}
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
  );
};

export default function PortraitsEnhancementSection() {
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Handle client-side mounting to prevent hydration errors
  useEffect(() => {
    setIsMounted(true);
    
    // Check if mobile on mount and when window resizes
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  // Handle carousel navigation for mobile view
  const goToSlide = (index: number) => {
    setActiveSlide(index);
    if (carouselRef.current) {
      carouselRef.current.scrollTo({
        left: index * carouselRef.current.offsetWidth,
        behavior: 'smooth'
      });
    }
  };

  // Handle carousel scroll for mobile view
  const handleCarouselScroll = () => {
    if (carouselRef.current && isMobile) {
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
          <div className="grid md:grid-cols-2 gap-8">
            <div className="w-full rounded-xl overflow-hidden shadow-2xl" style={{ aspectRatio: '4/5' }}>
              <div className="w-full h-full bg-gray-900/60"></div>
            </div>
            <div className="w-full rounded-xl overflow-hidden shadow-2xl" style={{ aspectRatio: '4/5' }}>
              <div className="w-full h-full bg-gray-900/60"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative bg-[#000000] overflow-hidden py-16 md:py-24">
      {/* Content container */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className="text-center mb-12">
          {/* Main Heading with Gradient */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight mb-3">
            <span className="bg-gradient-to-r from-orange-500 via-orange-400 to-white bg-clip-text text-transparent">
              Crisp, Lifelike Portraits
            </span>
          </h2>
          <p className="max-w-2xl mx-auto text-gray-300 text-lg md:text-xl mb-8">
            Face Mode brings out the best in every face, refining features while preserving natural skin textures for ultra-realistic, high-definition results.
          </p>
        </div>
        
        {/* Desktop View - Two side-by-side sliders */}
        <div className="hidden md:grid md:grid-cols-2 gap-8">
          <ImageSlider 
            beforeImage="/Images/papau_before.png"
            afterImage="/Images/papau_after.png"
            beforeAlt="Papua portrait before enhancement"
            afterAlt="Papua portrait after enhancement"
          />
          <ImageSlider 
            beforeImage="/Images/sadhu_before.png"
            afterImage="/Images/sadhu_after.png"
            beforeAlt="Sadhu portrait before enhancement"
            afterAlt="Sadhu portrait after enhancement"
          />
        </div>
        
        {/* Mobile View - Swipeable Carousel */}
        <div className="md:hidden">
          <div 
            ref={carouselRef}
            className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            onScroll={handleCarouselScroll}
          >
            <div className="flex-shrink-0 w-full snap-center px-4">
              <ImageSlider 
                beforeImage="/Images/papau_before.png"
                afterImage="/Images/papau_after.png"
                beforeAlt="Papua portrait before enhancement"
                afterAlt="Papua portrait after enhancement"
              />
            </div>
            <div className="flex-shrink-0 w-full snap-center px-4">
              <ImageSlider 
                beforeImage="/Images/sadhu_before.png"
                afterImage="/Images/sadhu_after.png"
                beforeAlt="Sadhu portrait before enhancement"
                afterAlt="Sadhu portrait after enhancement"
              />
            </div>
          </div>
          
          {/* Carousel Indicators */}
          <div className="flex justify-center mt-6 space-x-2">
            {[0, 1].map((index) => (
              <button
                key={index}
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