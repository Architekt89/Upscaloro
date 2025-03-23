'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import CTASection from '@/components/CTASection';
import { AnimatePresence, motion } from 'framer-motion';
import { InfiniteMovingCards } from '@/components/ui/infinite-moving-cards';
import FeaturedOnSection from '@/components/FeaturedOnSection';

// Utility function similar to the cn function from Aceternity UI
const cn = (...classes: (string | undefined)[]) => {
  return classes.filter(Boolean).join(' ');
};

// Card hover effect components
const Card = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "rounded-2xl h-full w-full p-4 overflow-hidden bg-transparent border border-gray-800 relative z-20",
        className
      )}
    >
      <div className="relative z-50">
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};

const CardTitle = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <h4 className={cn("text-xl font-bold text-white group-hover:text-orange-500 transition-colors duration-300", className)}>
      {children}
    </h4>
  );
};

const CardDescription = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <p
      className={cn(
        "mt-3 text-gray-400 text-sm leading-relaxed",
        className
      )}
    >
      {children}
    </p>
  );
};

const CardIcon = ({
  className,
  icon,
}: {
  className?: string;
  icon: string;
}) => {
  return (
    <div className={cn("mt-auto pt-4", className)}>
        <div className="text-orange-500 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          <i className={`${icon} text-lg`}></i>
      </div>
    </div>
  );
};

// HoverEffect component
const HoverEffect = ({
  items,
  className,
}: {
  items: {
    title: string;
    description: string;
    icon: string;
  }[];
  className?: string;
}) => {
  let [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10",
        className
      )}
    >
      {items.map((item, idx) => (
        <div
          key={idx}
          className="relative group block p-2 h-full w-full"
          onMouseEnter={() => setHoveredIndex(idx)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <AnimatePresence>
            {hoveredIndex === idx && (
              <motion.span
                className="absolute inset-0 h-full w-full bg-neutral-800/80 block rounded-2xl"
                layoutId="hoverBackground"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                  transition: { 
                    type: "spring",
                    stiffness: 125,
                    damping: 15,
                    mass: 0.5
                  },
                }}
                exit={{
                  opacity: 0,
                  transition: { 
                    duration: 0.2,
                    ease: "easeOut"
                  },
                }}
              />
            )}
          </AnimatePresence>
          <Card>
            <CardTitle>{item.title}</CardTitle>
            <CardDescription>{item.description}</CardDescription>
            <CardIcon icon={item.icon} />
          </Card>
        </div>
      ))}
    </div>
  );
};

const HowItWorksStep = ({ number, title, description }: { number: number; title: string; description: string }) => {
  return (
    <div className="flex flex-col items-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#111111] border border-gray-800 text-orange-500 text-xl font-medium mb-5 shadow-lg">
        {number}
      </div>
      <h3 className="text-xl font-bold text-white mb-3 text-center">{title}</h3>
      <p className="text-gray-400 text-sm text-center max-w-xs">{description}</p>
    </div>
  );
};

const ComparisonTable = () => {
  return (
    <div className="w-full">
      <div className="relative">
        {/* Dark backdrop for the entire Picluxe column including the header - hidden on mobile */}
        <div className="absolute right-0 top-0 bottom-0 w-[41.666%] h-full bg-neutral-900 rounded-xl overflow-hidden border border-neutral-800 shadow-xl z-0 hidden md:block"></div>
        
        {/* Main container with three-column grid */}
        <div className="grid grid-cols-12 mb-8 relative z-10">
          {/* Left column header (25%) */}
          <div className="col-span-3 text-gray-400 text-lg font-medium py-4 hidden md:block"></div>
          {/* Middle column header (35%) */}
          <div className="col-span-12 md:col-span-4 text-gray-400 text-lg font-medium py-4 md:py-8 px-2 flex items-center justify-center md:justify-start mb-2 md:mb-0">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="18" rx="2" ry="2"></rect>
                <line x1="8" y1="21" x2="16" y2="21"></line>
                <line x1="12" y1="17" x2="12" y2="21"></line>
              </svg>
              <span>TRADITIONAL UPSCALING</span>
            </div>
          </div>
          {/* Right column header (40%) - with container */}
          <div className="col-span-12 md:col-span-5 relative">
            {/* Right column content */}
            <div className="relative z-10 text-white text-lg font-medium py-4 md:py-8 px-2 md:pl-6">
              <div className="flex flex-col items-center justify-center">
                <div>
                  <Image src="/Images/logo.png" alt="Picluxe Logo" width={91} height={91} className="mx-auto" />
                </div>
              </div>
            </div>
            {/* Mobile dark backdrop for Picluxe logo - only visible on mobile */}
            <div className="absolute inset-0 bg-neutral-900 rounded-xl border border-neutral-800 shadow-xl z-0 md:hidden"></div>
          </div>
        </div>
        
        {/* Table rows */}
        <div className="relative z-10">
          {/* Mobile-friendly table structure */}
          <div className="block md:hidden space-y-6">
            {/* Image Quality - Mobile */}
            <div className="border-b border-[#333333] pb-6">
              <div className="font-bold text-white uppercase tracking-wide text-center mb-4">IMAGE QUALITY</div>
              <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-4 mb-3">
                <div className="flex items-center justify-center">
                  <span className="bg-gradient-to-br from-green-500 to-green-600 rounded-full p-1 mr-3 flex items-center justify-center w-5 h-5 flex-shrink-0 shadow-md">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <span className="text-white">Crystal clear, even at 16K resolution</span>
                </div>
              </div>
              <div className="bg-black/20 rounded-xl p-4">
                <div className="flex items-center justify-center">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center bg-red-500/10 text-red-400 mr-3 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <span className="text-[#AAAAAA]">Pixelated, blurry at high resolutions</span>
                </div>
              </div>
            </div>

            {/* Detail Enhancement - Mobile */}
            <div className="border-b border-[#333333] pb-6">
              <div className="font-bold text-white uppercase tracking-wide text-center mb-4">DETAIL ENHANCEMENT</div>
              <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-4 mb-3">
                <div className="flex items-center justify-center">
                  <span className="bg-gradient-to-br from-green-500 to-green-600 rounded-full p-1 mr-3 flex items-center justify-center w-5 h-5 flex-shrink-0 shadow-md">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <span className="text-white">Smart detail enhancement and recovery</span>
                </div>
              </div>
              <div className="bg-black/20 rounded-xl p-4">
                <div className="flex items-center justify-center">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center bg-red-500/10 text-red-400 mr-3 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <span className="text-[#AAAAAA]">No detail recovery or improvement</span>
                </div>
              </div>
            </div>

            {/* Color Accuracy - Mobile */}
            <div className="border-b border-[#333333] pb-6">
              <div className="font-bold text-white uppercase tracking-wide text-center mb-4">COLOR ACCURACY</div>
              <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-4 mb-3">
                <div className="flex items-center justify-center">
                  <span className="bg-gradient-to-br from-green-500 to-green-600 rounded-full p-1 mr-3 flex items-center justify-center w-5 h-5 flex-shrink-0 shadow-md">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <span className="text-white">Vibrant, natural color enhancement</span>
                </div>
              </div>
              <div className="bg-black/20 rounded-xl p-4">
                <div className="flex items-center justify-center">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center bg-red-500/10 text-red-400 mr-3 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <span className="text-[#AAAAAA]">Colors often fade or distort</span>
                </div>
              </div>
            </div>
            
            {/* Processing Time - Mobile */}
            <div className="border-b border-[#333333] pb-6">
              <div className="font-bold text-white uppercase tracking-wide text-center mb-4">PROCESSING TIME</div>
              <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-4 mb-3">
                <div className="flex items-center justify-center">
                  <span className="bg-gradient-to-br from-green-500 to-green-600 rounded-full p-1 mr-3 flex items-center justify-center w-5 h-5 flex-shrink-0 shadow-md">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <span className="text-white">Optimized for speed without sacrificing quality</span>
                </div>
              </div>
              <div className="bg-black/20 rounded-xl p-4">
                <div className="flex items-center justify-center">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center bg-yellow-500/10 text-yellow-400 mr-3 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <span className="text-[#AAAAAA]">Faster but lower quality</span>
                </div>
              </div>
            </div>
            
            {/* Noise Handling - Mobile */}
            <div className="border-b border-[#333333] pb-6">
              <div className="font-bold text-white uppercase tracking-wide text-center mb-4">NOISE HANDLING</div>
              <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-4 mb-3">
                <div className="flex items-center justify-center">
                  <span className="bg-gradient-to-br from-green-500 to-green-600 rounded-full p-1 mr-3 flex items-center justify-center w-5 h-5 flex-shrink-0 shadow-md">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <span className="text-white">Intelligent noise reduction</span>
                </div>
              </div>
              <div className="bg-black/20 rounded-xl p-4">
                <div className="flex items-center justify-center">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center bg-red-500/10 text-red-400 mr-3 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <span className="text-[#AAAAAA]">Amplifies existing noise</span>
                </div>
              </div>
            </div>
            
            {/* Special Enhancements - Mobile */}
            <div className="pb-6">
              <div className="font-bold text-white uppercase tracking-wide text-center mb-4">SPECIAL ENHANCEMENTS</div>
              <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-4 mb-3">
                <div className="flex items-center justify-center">
                  <span className="bg-gradient-to-br from-green-500 to-green-600 rounded-full p-1 mr-3 flex items-center justify-center w-5 h-5 flex-shrink-0 shadow-md">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <span className="text-white text-center">Specialized fixes for hands, faces, and detailed elements</span>
                </div>
              </div>
              <div className="bg-black/20 rounded-xl p-4">
                <div className="flex items-center justify-center">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center bg-red-500/10 text-red-400 mr-3 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <span className="text-[#AAAAAA]">Generic approach to all images</span>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop table - hidden on mobile */}
          <div className="hidden md:block">
            {/* Image Quality row - Desktop */}
            <div className="border-b border-[#333333] py-6 grid grid-cols-12 items-center">
              <div className="col-span-3 text-white font-bold uppercase tracking-wide">IMAGE QUALITY</div>
              <div className="col-span-4 text-[#AAAAAA] px-2 hover:bg-black/20 transition-colors duration-200">
                <div className="flex items-start">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center bg-red-500/10 text-red-400 mt-0.5 mr-3 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <span>Pixelated, blurry at high resolutions</span>
                </div>
              </div>
              <div className="col-span-5 text-white flex items-start pl-6 relative z-10">
                <span className="bg-gradient-to-br from-green-500 to-green-600 rounded-full p-1 mr-3 flex items-center justify-center w-5 h-5 flex-shrink-0 shadow-md relative z-10">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
                <span className="relative z-10">Crystal clear, even at 16K resolution</span>
              </div>
            </div>
            
            {/* Detail Enhancement row - Desktop */}
            <div className="border-b border-[#333333] py-6 grid grid-cols-12 items-center">
              <div className="col-span-3 text-white font-bold uppercase tracking-wide">DETAIL ENHANCEMENT</div>
              <div className="col-span-4 text-[#AAAAAA] px-2 hover:bg-black/20 transition-colors duration-200">
                <div className="flex items-start">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center bg-red-500/10 text-red-400 mt-0.5 mr-3 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <span>No detail recovery or improvement</span>
                </div>
              </div>
              <div className="col-span-5 text-white flex items-start pl-6 relative z-10">
                <span className="bg-gradient-to-br from-green-500 to-green-600 rounded-full p-1 mr-3 flex items-center justify-center w-5 h-5 flex-shrink-0 shadow-md relative z-10">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
                <span className="relative z-10">Smart detail enhancement and recovery</span>
              </div>
            </div>
            
            {/* Color Accuracy row - Desktop */}
            <div className="border-b border-[#333333] py-6 grid grid-cols-12 items-center">
              <div className="col-span-3 text-white font-bold uppercase tracking-wide">COLOR ACCURACY</div>
              <div className="col-span-4 text-[#AAAAAA] px-2 hover:bg-black/20 transition-colors duration-200">
                <div className="flex items-start">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center bg-red-500/10 text-red-400 mt-0.5 mr-3 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <span>Colors often fade or distort</span>
                </div>
              </div>
              <div className="col-span-5 text-white flex items-start pl-6 relative z-10">
                <span className="bg-gradient-to-br from-green-500 to-green-600 rounded-full p-1 mr-3 flex items-center justify-center w-5 h-5 flex-shrink-0 shadow-md relative z-10">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
                <span className="relative z-10">Vibrant, natural color enhancement</span>
              </div>
            </div>
            
            {/* Processing Time row - Desktop */}
            <div className="border-b border-[#333333] py-6 grid grid-cols-12 items-center">
              <div className="col-span-3 text-white font-bold uppercase tracking-wide">PROCESSING TIME</div>
              <div className="col-span-4 text-[#AAAAAA] px-2 hover:bg-black/20 transition-colors duration-200">
                <div className="flex items-start">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center bg-yellow-500/10 text-yellow-400 mt-0.5 mr-3 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <span>Faster but lower quality</span>
                </div>
              </div>
              <div className="col-span-5 text-white flex items-start pl-6 relative z-10">
                <span className="bg-gradient-to-br from-green-500 to-green-600 rounded-full p-1 mr-3 flex items-center justify-center w-5 h-5 flex-shrink-0 shadow-md relative z-10">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
                <span className="relative z-10">Optimized for speed without sacrificing quality</span>
              </div>
            </div>
            
            {/* Noise Handling row - Desktop */}
            <div className="border-b border-[#333333] py-6 grid grid-cols-12 items-center">
              <div className="col-span-3 text-white font-bold uppercase tracking-wide">NOISE HANDLING</div>
              <div className="col-span-4 text-[#AAAAAA] px-2 hover:bg-black/20 transition-colors duration-200">
                <div className="flex items-start">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center bg-red-500/10 text-red-400 mt-0.5 mr-3 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <span>Amplifies existing noise</span>
                </div>
              </div>
              <div className="col-span-5 text-white flex items-start pl-6 relative z-10">
                <span className="bg-gradient-to-br from-green-500 to-green-600 rounded-full p-1 mr-3 flex items-center justify-center w-5 h-5 flex-shrink-0 shadow-md relative z-10">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
                <span className="relative z-10">Intelligent noise reduction</span>
              </div>
            </div>
            
            {/* Special Enhancements row - Desktop */}
            <div className="py-6 grid grid-cols-12 items-center">
              <div className="col-span-3 text-white font-bold uppercase tracking-wide">SPECIAL ENHANCEMENTS</div>
              <div className="col-span-4 text-[#AAAAAA] px-2 hover:bg-black/20 transition-colors duration-200">
                <div className="flex items-start">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center bg-red-500/10 text-red-400 mt-0.5 mr-3 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <span>Generic approach to all images</span>
                </div>
              </div>
              <div className="col-span-5 text-white flex items-start pl-6 relative z-10">
                <span className="bg-gradient-to-br from-green-500 to-green-600 rounded-full p-1 mr-3 flex items-center justify-center w-5 h-5 flex-shrink-0 shadow-md relative z-10">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
                <span className="relative z-10">Specialized fixes for hands, faces, and detailed elements</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function FeaturesPage() {
  const features = [
    {
      title: 'High-Resolution Export',
      description: 'Export images up to 16K resolution for ultra-high-quality results.',
      icon: 'ri-artboard-2-line'
    },
    {
      title: 'AI-Powered Color Enhancement',
      description: 'Automatically adjust brightness, contrast, and colors for a more vibrant and natural look.',
      icon: 'ri-palette-line'
    },
    {
      title: 'Noise Reduction & Denoising',
      description: 'Remove unwanted noise and grain from low-quality images while preserving details.',
      icon: 'ri-bubble-chart-line'
    },
    {
      title: 'Sharpening & Clarity Enhancement',
      description: 'Enhance edges and details to make blurry images look sharp and professional.',
      icon: 'ri-focus-2-line'
    },
    {
      title: 'Old Photo Restoration',
      description: 'Revive damaged, faded, or scratched images by removing imperfections and restoring original colors.',
      icon: 'ri-history-line'
    },
    {
      title: 'Improve Hand Details',
      description: 'Enhance and refine hand features, making them look more natural and realistic in AI-generated or edited images.',
      icon: 'ri-hand-heart-line'
    },
    {
      title: 'Format Support',
      description: 'Supports multiple file formats including JPEG, PNG, JPG, and WebP for seamless compatibility.',
      icon: 'ri-file-list-3-line'
    },
    {
      title: 'Batch Processing',
      description: 'Enhance multiple images at once, saving time for professionals and photographers.',
      icon: 'ri-stack-line'
    }
  ];

  const howItWorksSteps = [
    {
      number: 1,
      title: 'Upload Image',
      description: 'Simply upload your image to our platform with an intuitive drag-and-drop interface.'
    },
    {
      number: 2,
      title: 'Select Enhancement Options',
      description: 'Choose from various AI enhancement options to customize your image output.'
    },
    {
      number: 3,
      title: 'Download Image',
      description: 'Download your enhanced high-resolution image in your preferred format.'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-black font-sans overflow-x-hidden">
      <main className="flex-grow">
        {/* Features Grid Section */}
        <section className="py-20 bg-[#050505]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-orange-500 via-orange-400 to-white bg-clip-text text-transparent flex flex-col items-center">
                <span>Built for professionals</span>
                <span>and enthusiasts alike</span>
              </h2>
              <p className="mt-4 text-gray-400 max-w-2xl mx-auto">
                Our platform offers a comprehensive suite of image enhancement features that deliver professional-quality results.
              </p>
            </div>
            
            <HoverEffect items={features} />
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 bg-[#000000]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-orange-500 via-orange-400 to-white bg-clip-text text-transparent">
                How It Works
              </h2>
              <p className="mt-4 text-gray-400 max-w-2xl mx-auto">
                Our intuitive platform makes it easy to enhance your images in just three simple steps.
              </p>
            </div>
            
            <div className="relative">
              {/* Timeline line */}
              <div className="hidden md:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-gray-800 via-orange-500/30 to-gray-800 z-0"></div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative z-10">
                {howItWorksSteps.map((step, index) => (
                  <HowItWorksStep 
                    key={index} 
                    number={step.number} 
                    title={step.title} 
                    description={step.description} 
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Comparison Table Section */}
        <section className="py-20 bg-[#050505]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-orange-500 via-orange-400 to-white bg-clip-text text-transparent">
                <span className="bg-gradient-to-r from-orange-500 via-orange-400 to-white bg-clip-text text-transparent">Traditional</span> vs <span className="bg-gradient-to-r from-orange-500 via-orange-400 to-white bg-clip-text text-transparent">AI</span> Upscaling
              </h2>
              <p className="mt-4 text-gray-400 max-w-2xl mx-auto">
                See how our AI-powered solution outperforms traditional image enhancement methods.
              </p>
            </div>
            
            <div className="rounded-2xl p-8 overflow-hidden transform transition-all">
              <ComparisonTable />
            </div>
          </div>
        </section>

        {/* Featured On Section */}
        <section className="py-20 bg-[#000000]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <FeaturedOnSection />
          </div>
        </section>

        {/* CTA Section */}
        <div className="bg-black">
          <CTASection />
        </div>
      </main>
    </div>
  );
} 