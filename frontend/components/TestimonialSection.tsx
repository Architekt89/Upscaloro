'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { InfiniteMovingCards } from '@/components/ui/infinite-moving-cards';

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
    quote: "picluxe transformed my low-resolution photos into stunning high-quality images. The AI technology is truly impressive and the results exceeded my expectations.",
    name: "Sarah Johnson",
    title: "Professional Photographer",
    image: "/testimonials/user1.jpg"
  },
  {
    id: 2,
    quote: "As a graphic designer, image quality is everything. picluxe has become an essential tool in my workflow, allowing me to upscale and enhance images with incredible detail.",
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
  },
  {
    id: 4,
    quote: "picluxe's AI algorithms are remarkable. I've tried other upscaling tools, but none match the quality and natural results I get with picluxe.",
    name: "David Wilson",
    title: "Content Creator",
    image: "/testimonials/user4.jpg"
  },
  {
    id: 5,
    quote: "After using picluxe, I can't imagine going back to traditional upscaling methods. The quality and speed are unmatched.",
    name: "Jessica Lee",
    title: "Social Media Manager",
    image: "/testimonials/user5.jpg"
  }
];

export default function TestimonialSection() {
  const [isMounted, setIsMounted] = useState(false);

  // Handle client-side mounting to prevent hydration errors
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Format testimonials for the InfiniteMovingCards component
  const testimonialItems = testimonials.map(item => ({
    quote: item.quote,
    name: item.name,
    title: item.title
  }));

  // If not mounted yet (server-side), render a placeholder
  if (!isMounted) {
    return (
      <section className="relative bg-[#000000] overflow-hidden py-16 md:py-24">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <div className="text-center mb-12 md:mb-16">
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative bg-[#000000] overflow-hidden py-16 md:py-24">
      {/* Content container */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className="text-center mb-12 md:mb-16">
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
        
        {/* Aceternity UI InfiniteMovingCards */}
        <div className="mx-auto">
          <InfiniteMovingCards
            items={testimonialItems}
            direction="left"
            speed="slow"
            pauseOnHover={true}
          />
        </div>
        
        {/* Second row moving in opposite direction */}
        <div className="mx-auto mt-10">
          <InfiniteMovingCards
            items={[...testimonialItems].reverse()}
            direction="right"
            speed="slow"
            pauseOnHover={true}
          />
        </div>
      </div>
    </section>
  );
} 