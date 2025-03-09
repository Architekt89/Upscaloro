'use client';

import Link from 'next/link';

export default function CTASection() {
  return (
    <section className="relative bg-[#000000] overflow-hidden py-16 md:py-20">
      {/* Content container with rounded corners */}
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className="bg-[#000000] backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-xl border border-gray-800/50">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4 leading-tight">
              <span className="text-white drop-shadow-md">Ready to create stunning,</span>
              <br />
              <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
              high-resolution images without tedious edits?.
              </span>
            </h2>
            
            <p className="max-w-2xl mx-auto text-gray-300 text-lg md:text-xl mb-8 tracking-wide">
            Start your free trial of picluxe now and transform your visuals into powerful statements.
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