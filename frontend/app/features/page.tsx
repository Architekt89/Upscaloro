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
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="py-6 px-6 text-left text-base font-semibold text-gray-300 border-b border-gray-800">Feature</th>
            <th className="py-6 px-6 text-center text-base font-semibold text-gray-300 border-b border-gray-800">Traditional Upscaling</th>
            <th className="py-6 px-6 text-center text-base font-semibold text-orange-500 border-b border-gray-800">Picluxe AI Upscaling</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="py-5 px-6 text-left text-sm text-gray-300 border-b border-gray-800">Image Quality</td>
            <td className="py-5 px-6 text-center text-sm text-gray-400 border-b border-gray-800">Pixelated, blurry at high resolutions</td>
            <td className="py-5 px-6 text-center text-sm text-white border-b border-gray-800">Crystal clear, even at 16K resolution</td>
          </tr>
          <tr>
            <td className="py-5 px-6 text-left text-sm text-gray-300 border-b border-gray-800">Detail Enhancement</td>
            <td className="py-5 px-6 text-center text-sm text-gray-400 border-b border-gray-800">No detail recovery or improvement</td>
            <td className="py-5 px-6 text-center text-sm text-white border-b border-gray-800">Smart detail enhancement and recovery</td>
          </tr>
          <tr>
            <td className="py-5 px-6 text-left text-sm text-gray-300 border-b border-gray-800">Color Accuracy</td>
            <td className="py-5 px-6 text-center text-sm text-gray-400 border-b border-gray-800">Colors often fade or distort</td>
            <td className="py-5 px-6 text-center text-sm text-white border-b border-gray-800">Vibrant, natural color enhancement</td>
          </tr>
          <tr>
            <td className="py-5 px-6 text-left text-sm text-gray-300 border-b border-gray-800">Processing Time</td>
            <td className="py-5 px-6 text-center text-sm text-gray-400 border-b border-gray-800">Faster but lower quality</td>
            <td className="py-5 px-6 text-center text-sm text-white border-b border-gray-800">Optimized for speed without sacrificing quality</td>
          </tr>
          <tr>
            <td className="py-5 px-6 text-left text-sm text-gray-300 border-b border-gray-800">Noise Handling</td>
            <td className="py-5 px-6 text-center text-sm text-gray-400 border-b border-gray-800">Amplifies existing noise</td>
            <td className="py-5 px-6 text-center text-sm text-white border-b border-gray-800">Intelligent noise reduction</td>
          </tr>
          <tr>
            <td className="py-5 px-6 text-left text-sm text-gray-300">Specific Enhancements</td>
            <td className="py-5 px-6 text-center text-sm text-gray-400">Generic approach to all images</td>
            <td className="py-5 px-6 text-center text-sm text-white">Specialized fixes for hands, faces, and detailed elements</td>
          </tr>
        </tbody>
      </table>
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
        {/* Features Hero Section */}
        <section className="relative overflow-hidden bg-[#000000] py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight mb-6">
              <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                Powerful Features
              </span>
              <span className="text-white"> for Perfect Images</span>
            </h1>
            <p className="max-w-2xl mx-auto text-gray-300 text-lg mb-12">
              Our AI-powered technology transforms your images with precision and quality that standard tools simply can't match.
            </p>
          </div>
          
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-30 z-0">
            <div className="absolute top-0 left-0 w-full h-full grid grid-cols-10 grid-rows-10">
              {Array.from({ length: 100 }).map((_, i) => (
                <div key={i} className="border border-gray-700/20"></div>
              ))}
            </div>
          </div>
        </section>

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
            
            <div className="bg-[#0a0a0a] rounded-xl border border-gray-800 p-0 sm:p-2 md:p-4 shadow-lg">
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