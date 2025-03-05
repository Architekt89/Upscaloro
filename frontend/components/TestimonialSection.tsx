'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Testimonial {
  id: number;
  quote: string;
  name: string;
  title: string;
  image: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    quote: "Upscaloro transformed my low-resolution photos into stunning high-quality images. The AI technology is truly impressive and the results exceeded my expectations.",
    name: "Sarah Johnson",
    title: "Professional Photographer",
    image: "/testimonials/user1.jpg"
  },
  {
    id: 2,
    quote: "As a graphic designer, image quality is everything. Upscaloro has become an essential tool in my workflow, allowing me to upscale and enhance images with incredible detail.",
    name: "Michael Chen",
    title: "Senior Graphic Designer",
    image: "/testimonials/user2.jpg"
  },
  {
    id: 3,
    quote: "The batch processing feature saves me hours of work every week. The upscaled images retain their natural look while gaining remarkable clarity and sharpness.",
    name: "Emily Rodriguez",
    title: "Marketing Director",
    image: "/testimonials/user3.jpg"
  }
];

export default function TestimonialSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Check if mobile on mount and window resize
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  const nextSlide = () => {
    setActiveIndex((prevIndex) => 
      prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setActiveIndex((prevIndex) => 
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
    );
  };

  useEffect(() => {
    if (carouselRef.current && isMobile) {
      carouselRef.current.scrollTo({
        left: activeIndex * carouselRef.current.offsetWidth,
        behavior: 'smooth'
      });
    }
  }, [activeIndex, isMobile]);

  return (
    <section className="relative bg-[#0D0D0D] overflow-hidden py-16 md:py-24">
      {/* Background glow effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-orange-500/10 rounded-full blur-[100px]"></div>
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-orange-500/10 rounded-full blur-[100px]"></div>
      </div>
      
      {/* Content container */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className="text-center mb-12 md:mb-16">
          {/* Section Label */}
          <div className="inline-block px-4 py-1 rounded-full border border-white/30 text-white text-sm font-medium mb-6">
            Testimonials
          </div>
          
          {/* Main Heading with Gradient */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight uppercase mb-8">
            <span className="bg-gradient-to-r from-orange-300 via-orange-100 to-white bg-clip-text text-transparent">
              Hear From
            </span>{" "}
            <span className="bg-gradient-to-r from-orange-500 via-orange-400 to-white bg-clip-text text-transparent">
              Our Satisfied Clients
            </span>
          </h2>
        </div>
        
        {/* Desktop View - Grid Layout */}
        <div className="hidden md:grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div 
              key={testimonial.id}
              className="relative rounded-2xl p-6 bg-[#0D0D0D] border border-gray-800/30 
                shadow-xl transition-all duration-300 hover:scale-[1.02] hover:border-orange-500/20 group"
            >
              {/* Quote Icon */}
              <div className="text-6xl text-orange-500 opacity-70 group-hover:opacity-100 group-hover:text-orange-400 
                transition-all duration-300 group-hover:shadow-glow absolute -top-2 left-4">
                ❝
              </div>
              
              {/* Quote Text */}
              <div className="pt-8 pb-6 text-gray-300 group-hover:text-white transition-colors duration-300">
                {testimonial.quote}
              </div>
              
              {/* User Info */}
              <div className="flex items-center mt-4">
                <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-orange-500/30">
                  <Image 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="ml-4">
                  <div className="font-bold text-white">{testimonial.name}</div>
                  <div className="text-sm text-gray-400">{testimonial.title}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Mobile View - Carousel */}
        <div className="md:hidden relative">
          <div 
            ref={carouselRef}
            className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {testimonials.map((testimonial, index) => (
              <div 
                key={testimonial.id}
                className={`min-w-full px-4 snap-center`}
              >
                <div className="relative rounded-2xl p-6 bg-[#0D0D0D] border border-gray-800/30 
                  shadow-xl transition-all duration-300">
                  {/* Quote Icon */}
                  <div className="text-5xl text-orange-500 opacity-70 absolute -top-2 left-4">
                    ❝
                  </div>
                  
                  {/* Quote Text */}
                  <div className="pt-8 pb-6 text-gray-300">
                    {testimonial.quote}
                  </div>
                  
                  {/* User Info */}
                  <div className="flex items-center mt-4">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-orange-500/30">
                      <Image 
                        src={testimonial.image} 
                        alt={testimonial.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="ml-4">
                      <div className="font-bold text-white">{testimonial.name}</div>
                      <div className="text-sm text-gray-400">{testimonial.title}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Carousel Controls */}
          <div className="flex justify-center items-center mt-8 space-x-4">
            <button 
              onClick={prevSlide}
              className="p-2 rounded-full bg-gray-900 text-white hover:bg-orange-500 transition-colors duration-300"
              aria-label="Previous testimonial"
            >
              <ChevronLeft size={20} />
            </button>
            
            {/* Dots */}
            <div className="flex space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    activeIndex === index ? 'bg-orange-500 w-4' : 'bg-gray-600'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
            
            <button 
              onClick={nextSlide}
              className="p-2 rounded-full bg-gray-900 text-white hover:bg-orange-500 transition-colors duration-300"
              aria-label="Next testimonial"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
} 