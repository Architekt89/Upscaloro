import Link from 'next/link';
import CTASection from '@/components/CTASection';
import FAQSection from '@/components/FAQSection';
import PricingSection from '@/components/PricingSection';
import TestimonialSection from '@/components/TestimonialSection';
import BeforeAfterSection from '@/components/BeforeAfterSection';
import NatureEnhancementSection from '@/components/NatureEnhancementSection';
import AnimeEnhancementSection from '@/components/AnimeEnhancementSection';
import PortraitsEnhancementSection from '@/components/PortraitsEnhancementSection';
import PortraitsSection from '@/components/PortraitsSection';
import TypewriterText from '@/components/TypewriterText';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-black font-sans overflow-x-hidden">
      <main className="flex-grow">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-[#000000] min-h-[90vh] flex items-start pt-[10.5vh]">
          {/* Content */}
          <div className="relative w-full">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
              <div className="text-center">
                <h1 className="flex flex-col items-center font-extrabold tracking-tight mb-8 drop-shadow-2xl">
                  <div className="overflow-visible mb-2">
                    <span className="text-orange-500 bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-orange-600 text-4xl md:text-5xl lg:text-6xl tracking-wider leading-relaxed py-2 inline-block">
                    <TypewriterText 
                      text="Stop settling for blurred pixels."
                      typingSpeed={50}
                    />
                    </span>
                  </div>
                  <span className="text-white text-4xl md:text-5xl lg:text-6xl break-words">
                  Present images that command attention at every scale.
                  </span>
                </h1>
                <p className="max-w-2xl mx-auto text-md md:text-md text-gray-200 mb-10 tracking-wide font-medium drop-shadow-lg text-shadow-sm">
                picluxe adds vivid detail and depth to your images, so you can showcase them with absolute confidence—no complex editing required.
                </p>
                <div className="flex flex-col items-center">
                  <Link
                    href="/auth/signup"
                    className="inline-block px-10 py-5 text-lg font-semibold text-white 
                    bg-gradient-to-r from-orange-500 to-orange-600 
                    rounded-full 
                    shadow-[0_0_40px_-5px_rgba(249,115,22,0.5)] 
                    hover:shadow-[0_0_60px_-5px_rgba(249,115,22,0.7)] 
                    hover:bg-gradient-to-r hover:from-orange-400 hover:to-orange-600 
                    transition-all duration-300 ease-out hover:scale-105 
                    animate-pulse-subtle 
                    border border-orange-500/20
                    backdrop-blur-sm
                    relative
                    before:content-[''] before:absolute before:inset-0 before:bg-white/10 before:rounded-full before:opacity-0 before:hover:opacity-20 before:transition-opacity"
                  >
                    Get Started For Free
                  </Link>
                  <p className="mt-4 text-gray-400 text-sm font-medium">
                    No credit card required
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Before/After Comparison Section - No dividing line */}
        <div className="bg-black">
          <BeforeAfterSection />
        </div>

        {/* Nature Enhancement Section */}
        <div className="bg-black">
          <NatureEnhancementSection />
        </div>

        {/* Anime Enhancement Section */}
        <div className="bg-black">
          <AnimeEnhancementSection />
        </div>

        {/* Portraits Enhancement Section */}
        <div className="bg-black">
          <PortraitsEnhancementSection />
        </div>

        {/* Features Section */}
        <div className="py-24 bg-[#000000]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:text-center">
              <h2 className="text-base text-orange-500 font-semibold tracking-wide uppercase">Features</h2>
              <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-white sm:text-4xl">
                Advanced Image Upscaling
              </p>
              <p className="mt-4 max-w-2xl text-xl text-gray-300 lg:mx-auto">
                Our AI models are trained on millions of images to deliver exceptional results.
              </p>
            </div>

            <div className="mt-10">
              <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
                <div className="relative">
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-orange-500 text-white">
                    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="ml-16">
                    <h3 className="text-lg leading-6 font-medium text-white">Up to 16x Upscaling</h3>
                    <p className="mt-2 text-base text-gray-300">
                      Increase image resolution by up to 16 times while preserving details and enhancing quality.
                    </p>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-orange-500 text-white">
                    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  </div>
                  <div className="ml-16">
                    <h3 className="text-lg leading-6 font-medium text-white">Multiple AI Models</h3>
                    <p className="mt-2 text-base text-gray-300">
                      Choose from specialized models for photos, faces, anime, and more to get the best results.
                    </p>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-orange-500 text-white">
                    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="ml-16">
                    <h3 className="text-lg leading-6 font-medium text-white">Fast Processing</h3>
                    <p className="mt-2 text-base text-gray-300">
                      Our optimized infrastructure delivers results in seconds, not minutes.
                    </p>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-orange-500 text-white">
                    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                    </svg>
                  </div>
                  <div className="ml-16">
                    <h3 className="text-lg leading-6 font-medium text-white">Advanced Controls</h3>
                    <p className="mt-2 text-base text-gray-300">
                      Fine-tune parameters like creativity, resemblance, and dynamic range for perfect results.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Portraits Section */}
        <div className="bg-black">
          <PortraitsSection />
        </div>

        {/* Testimonial Section */}
        <div className="bg-black">
          <TestimonialSection />
        </div>

        {/* Pricing Section */}
        <div className="bg-black">
          <PricingSection />
        </div>

        {/* FAQ Section */}
        <div className="bg-black">
          <FAQSection />
        </div>

        {/* CTA Section */}
        <div className="bg-black">
          <CTASection />
        </div>
      </main>
    </div>
  );
} 