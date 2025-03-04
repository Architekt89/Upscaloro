'use client';

import Link from 'next/link';
import ClientHeader from '@/components/ClientHeader';
import Footer from '@/components/Footer';
import CTASection from '@/components/CTASection';
import FAQSection from '@/components/FAQSection';

export const dynamic = "force-dynamic"; // Add this line

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-950">
      <ClientHeader />
      <main className="flex-grow">
        <div className="flex items-center justify-center py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-extrabold text-white sm:text-5xl">
              404 - Page Not Found
            </h1>
            <p className="mt-4 text-lg text-gray-300">
              The page you're looking for doesn't exist or has been moved.
            </p>
            <div className="mt-10">
              <Link
                href="/"
                className="inline-block px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-600 transition-all duration-300"
              >
                Go back home
              </Link>
            </div>
          </div>
        </div>
        
        {/* FAQ Section */}
        <FAQSection />
        
        {/* CTA Section */}
        <CTASection />
      </main>
      <Footer />
    </div>
  );
} 