'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import CTASection from '@/components/CTASection';

const FeatureCard = ({ title, description, icon }: { title: string; description: string; icon: string }) => {
  return (
    <div className="group relative flex flex-col h-full rounded-xl p-8 transition-all duration-300 bg-transparent hover:bg-[#111111] border border-gray-800 hover:border-gray-700">
      <h3 className="text-xl font-bold text-white group-hover:text-orange-500 transition-colors duration-300">{title}</h3>
      <p className="mt-3 text-gray-400 text-sm leading-relaxed">{description}</p>
      <div className="mt-auto pt-4">
        <div className="text-orange-500 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          <i className={`${icon} text-lg`}></i>
        </div>
      </div>
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
        {/* Main container with three-column grid */}
        <div className="grid grid-cols-12 mb-6">
          {/* Left column header (25%) */}
          <div className="col-span-3 text-gray-400 text-lg font-medium"></div>
          {/* Middle column header (35%) */}
          <div className="col-span-4 text-gray-400 text-lg font-medium">TRADITIONAL UPSCALING</div>
          {/* Right column header (40%) - with container */}
          <div className="col-span-5 relative">
            {/* Right column background container */}
            <div className="absolute -top-8 -bottom-[450px] -right-8 left-0 bg-[#181818] rounded-xl shadow-[0_4px_30px_rgba(0,0,0,0.3)] z-0 border border-[#2A2A2A]"></div>
            <div className="relative z-10 text-white text-lg font-medium pl-6 py-2">
              <span className="text-orange-500 font-semibold">picluxe</span> AI Upscaling
            </div>
          </div>
        </div>
        
        {/* Table rows */}
        <div className="relative">
          {/* Image Quality row */}
          <div className="border-b border-[#333333] py-5 grid grid-cols-12">
            <div className="col-span-3 text-white font-bold uppercase">IMAGE QUALITY</div>
            <div className="col-span-4 text-[#AAAAAA]">Pixelated, blurry at high resolutions</div>
            <div className="col-span-5 text-white flex items-center pl-6 relative z-10">
              <span className="bg-green-500 rounded-full p-1 mr-3 flex items-center justify-center w-5 h-5 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </span>
              <span>Crystal clear, even at 16K resolution</span>
            </div>
          </div>
          
          {/* Detail Enhancement row */}
          <div className="border-b border-[#333333] py-5 grid grid-cols-12">
            <div className="col-span-3 text-white font-bold uppercase">DETAIL ENHANCEMENT</div>
            <div className="col-span-4 text-[#AAAAAA]">No detail recovery or improvement</div>
            <div className="col-span-5 text-white flex items-center pl-6 relative z-10">
              <span className="bg-green-500 rounded-full p-1 mr-3 flex items-center justify-center w-5 h-5 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </span>
              <span>Smart detail enhancement and recovery</span>
            </div>
          </div>
          
          {/* Color Accuracy row */}
          <div className="border-b border-[#333333] py-5 grid grid-cols-12">
            <div className="col-span-3 text-white font-bold uppercase">COLOR ACCURACY</div>
            <div className="col-span-4 text-[#AAAAAA]">Colors often fade or distort</div>
            <div className="col-span-5 text-white flex items-center pl-6 relative z-10">
              <span className="bg-green-500 rounded-full p-1 mr-3 flex items-center justify-center w-5 h-5 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </span>
              <span>Vibrant, natural color enhancement</span>
            </div>
          </div>
          
          {/* Processing Time row */}
          <div className="border-b border-[#333333] py-5 grid grid-cols-12">
            <div className="col-span-3 text-white font-bold uppercase">PROCESSING TIME</div>
            <div className="col-span-4 text-[#AAAAAA]">Faster but lower quality</div>
            <div className="col-span-5 text-white flex items-center pl-6 relative z-10">
              <span className="bg-green-500 rounded-full p-1 mr-3 flex items-center justify-center w-5 h-5 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </span>
              <span>Optimized for speed without sacrificing quality</span>
            </div>
          </div>
          
          {/* Noise Handling row */}
          <div className="border-b border-[#333333] py-5 grid grid-cols-12">
            <div className="col-span-3 text-white font-bold uppercase">NOISE HANDLING</div>
            <div className="col-span-4 text-[#AAAAAA]">Amplifies existing noise</div>
            <div className="col-span-5 text-white flex items-center pl-6 relative z-10">
              <span className="bg-green-500 rounded-full p-1 mr-3 flex items-center justify-center w-5 h-5 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </span>
              <span>Intelligent noise reduction</span>
            </div>
          </div>
          
          {/* Special Enhancements row */}
          <div className="py-5 grid grid-cols-12">
            <div className="col-span-3 text-white font-bold uppercase">SPECIAL ENHANCEMENTS</div>
            <div className="col-span-4 text-[#AAAAAA]">Generic approach to all images</div>
            <div className="col-span-5 text-white flex items-center pl-6 relative z-10">
              <span className="bg-green-500 rounded-full p-1 mr-3 flex items-center justify-center w-5 h-5 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </span>
              <span>Specialized fixes for hands, faces, and detailed elements</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FeaturedOnSection = () => {
  const logos = [
    { name: 'Medium', url: '/images/medium-logo.svg' },
    { name: 'Google', url: '/images/google-logo.svg' },
    { name: 'Reddit', url: '/images/reddit-logo.svg' },
    { name: 'Quora', url: '/images/quora-logo.svg' },
  ];

  return (
    <div className="py-12">
      <div className="text-center mb-10">
        <h3 className="text-gray-400 uppercase text-sm font-medium tracking-wider">Featured On</h3>
      </div>
      <div className="flex flex-wrap justify-center items-center gap-14">
        {logos.map((logo, index) => (
          <div 
            key={index} 
            className="opacity-40 hover:opacity-80 transition-all duration-300 grayscale hover:grayscale-0"
          >
            <Image src={logo.url} alt={logo.name} width={120} height={40} className="h-6 w-auto object-contain" />
          </div>
        ))}
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
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                Built for professionals and enthusiasts alike
              </h2>
              <p className="mt-4 text-gray-400 max-w-2xl mx-auto">
                Our platform offers a comprehensive suite of image enhancement features that deliver professional-quality results.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
              {features.map((feature, index) => (
                <div key={index} className="h-full">
                  <FeatureCard 
                    title={feature.title} 
                    description={feature.description} 
                    icon={feature.icon} 
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 bg-[#000000]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white">
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
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                Traditional vs AI Upscaling
              </h2>
              <p className="mt-4 text-gray-400 max-w-2xl mx-auto">
                See how our AI-powered solution outperforms traditional image enhancement methods.
              </p>
            </div>
            
            <div className="bg-[#121212] rounded-xl p-8 shadow-[0_10px_50px_rgba(0,0,0,0.5)] border border-[#1D1D1D] overflow-hidden">
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