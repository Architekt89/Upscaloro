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
        <div className="relative overflow-hidden bg-[#000000] min-h-[90vh] flex items-start pt-[10.5vh]">
          {/* Content */}
          <div className="relative w-full z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
              <div className="text-center">
                <h1 className="flex flex-col items-center font-extrabold tracking-tight mb-8">
                  <div className="mb-2">
                    <div className="text-3xl md:text-4xl lg:text-5xl tracking-wider leading-relaxed py-0 inline-block">
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600 drop-shadow-[0_0_10px_rgba(249,115,22,0.5)] [text-shadow:_0_0_15px_rgba(249,115,22,0.3)]">
                        Stop settling for blurred pixels.
                      </span>
                    </div>
                  </div>
                  <div className="mt-0 flex flex-col">
                    <span className="text-3xl md:text-4xl lg:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] [text-shadow:_0_0_15px_rgba(255,255,255,0.3)]">
                      Present images that command
                    </span>
                    <span className="text-3xl md:text-4xl lg:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] [text-shadow:_0_0_15px_rgba(255,255,255,0.3)]">
                      attention at every scale.
                    </span>
                  </div>
                </h1>
                <p className="max-w-2xl mx-auto text-sm md:text-base text-gray-200 mb-10 tracking-wide font-medium drop-shadow-lg text-shadow-sm">
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