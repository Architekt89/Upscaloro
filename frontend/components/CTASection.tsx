'use client';

import Link from 'next/link';

export default function CTASection() {
  return (
    <section className="relative bg-gray-950 overflow-hidden py-16 md:py-20">
      {/* Background glow effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-orange-500/15 rounded-full blur-[100px]"></div>
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-orange-500/15 rounded-full blur-[100px]"></div>
      </div>
      
      {/* Content container with rounded corners */}
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className="bg-gray-900/60 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-xl border border-gray-800/50">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4 leading-tight">
              <span className="text-white drop-shadow-md">Ready to enhance your images?</span>
              <br />
              <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                Start using Upscalor today.
              </span>
            </h2>
            
            <p className="max-w-2xl mx-auto text-gray-300 text-lg md:text-xl mb-8 tracking-wide">
              Join thousands of professionals who trust our AI technology for their image upscaling needs.
            </p>
            
            <Link 
              href="/auth/signup" 
              className="inline-block px-8 py-4 text-lg font-semibold text-white 
                bg-gradient-to-r from-orange-500 to-orange-600 
                rounded-full 
                shadow-[0_0_30px_-5px_rgba(249,115,22,0.4)] 
                hover:shadow-[0_0_45px_-5px_rgba(249,115,22,0.6)] 
                hover:bg-gradient-to-r hover:from-orange-400 hover:to-orange-600 
                transition-all duration-300 ease-out hover:scale-105 
                border border-orange-500/20"
            >
              Get Started For Free
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
} 