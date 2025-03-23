import Link from 'next/link';
import CTASection from '@/components/CTASection';
import FAQSection from '@/components/FAQSection';
import PricingSection from '@/components/PricingSection';
import TestimonialSection from '@/components/TestimonialSection';
import BeforeAfterSection from '@/components/BeforeAfterSection';
import NatureEnhancementSection from '@/components/NatureEnhancementSection';
import AnimeEnhancementSection from '@/components/AnimeEnhancementSection';
import PortraitsEnhancementSection from '@/components/PortraitsEnhancementSection';
import FeaturedOnSection from '@/components/FeaturedOnSection';
import { TypewriterEffectSmooth } from '@/components/ui/typewriter-effect';
import HeroCTAButton from '@/components/HeroCTAButton';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-black font-sans overflow-x-hidden">
      <main className="flex-grow">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-[#000000] min-h-[90vh] flex items-start pt-[3.8vh] pb-16 sm:pb-0 sm:pt-[6.3vh]">
          {/* Content */}
          <div className="relative w-full z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
              <div className="text-center">
                <div className="mb-4">
                  <span className="inline-block text-sm md:text-base text-gray-300 font-medium tracking-wide py-1 px-3 rounded-full bg-white/5 backdrop-blur-sm">
                    Trusted by 10,000+ users
                  </span>
                </div>
                <h1 className="flex flex-col items-center font-extrabold tracking-tight mb-12">
                  <div className="mb-6">
                    <div className="text-4xl md:text-5xl lg:text-6xl tracking-wider leading-relaxed py-0 inline-block">
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600 drop-shadow-[0_0_10px_rgba(249,115,22,0.5)] [text-shadow:_0_0_15px_rgba(249,115,22,0.3)]">
                        Stop settling for blurred pixels.
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-col">
                    <span className="text-3xl md:text-4xl lg:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] [text-shadow:_0_0_15px_rgba(255,255,255,0.3)]">
                      Present images that command
                    </span>
                    <span className="text-3xl md:text-4xl lg:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] [text-shadow:_0_0_15px_rgba(255,255,255,0.3)]">
                      attention at every scale.
                    </span>
                  </div>
                </h1>
                <p className="max-w-2xl mx-auto text-base md:text-lg text-gray-200 mb-16 tracking-wide font-medium drop-shadow-lg text-shadow-sm px-4">
                picluxe adds vivid detail and depth to your images, so you can showcase them with absolute confidence—no complex editing required.
                </p>
                <div className="flex flex-col items-center">
                  <HeroCTAButton />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Before/After Comparison Section - No dividing line */}
        <div className="bg-black">
          <BeforeAfterSection />
        </div>

        {/* Portraits Enhancement Section */}
        <div className="bg-black">
          <PortraitsEnhancementSection />
        </div>

        {/* Nature Enhancement Section */}
        <div className="bg-black">
          <NatureEnhancementSection />
        </div>

        {/* Anime Enhancement Section */}
        <div className="bg-black">
          <AnimeEnhancementSection />
        </div>

        {/* Testimonial Section */}
        <div className="bg-black">
          <TestimonialSection />
        </div>

        {/* Pricing Section */}
        <div className="bg-black">
          <PricingSection />
        </div>

        {/* Featured On Section */}
        <div className="bg-black py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <FeaturedOnSection />
          </div>
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