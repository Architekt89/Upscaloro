import Link from 'next/link';
import CTASection from '@/components/CTASection';
import FAQSection from '@/components/FAQSection';
import PricingSection from '@/components/PricingSection';
import TestimonialSection from '@/components/TestimonialSection';
import BeforeAfterSection from '@/components/BeforeAfterSection';
import NatureEnhancementSection from '@/components/NatureEnhancementSection';
import AnimeEnhancementSection from '@/components/AnimeEnhancementSection';
import PortraitsEnhancementSection from '@/components/PortraitsEnhancementSection';
import TypewriterText from '@/components/TypewriterText';
import HeroCTAButton from '@/components/HeroCTAButton';

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