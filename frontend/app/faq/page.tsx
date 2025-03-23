import FAQSection from '@/components/FAQSection';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FAQ - Frequently Asked Questions | Upscaloro',
  description: 'Get answers to commonly asked questions about our AI image upscaling service, pricing, and features.',
};

export default function FAQPage() {
  return (
    <main className="min-h-screen bg-black">
      <FAQSection />
    </main>
  );
} 