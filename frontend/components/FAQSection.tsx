'use client';

import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "What is the main benefit of using the AI-based upscaling tool?",
    answer: "Our AI-powered upscaling technology enhances image resolution while preserving and improving details that traditional resizing methods would lose. It's perfect for professionals who need to enlarge images without sacrificing quality, or for restoring old, low-resolution photos to modern standards."
  },
  {
    question: "How many images can I process with a free account?",
    answer: "Free accounts can process up to 10 images per month. This gives you a chance to experience our technology before committing to a subscription. For unlimited processing and additional features, consider upgrading to our Pro plan."
  },
  {
    question: "Can I collaborate with users who don't have an account?",
    answer: "Yes! You can share your processed images with anyone, even if they don't have an Upscaloro account. Simply use the download or share options after processing your image. For team collaboration with shared workspaces, our Pro plan offers enhanced sharing capabilities."
  },
  {
    question: "Is there a limit to the number of collaborators I can have on a single file?",
    answer: "There's no limit to the number of collaborators for Pro accounts. Free accounts can share with up to 3 collaborators per project. Our enterprise solutions offer additional administrative controls for larger teams."
  },
  {
    question: "What types of files can I upscale with your tool?",
    answer: "Our tool supports all major image formats including JPEG, PNG, WEBP, and TIFF. We recommend using lossless formats like PNG for the best results, especially when working with detailed images or graphics with text."
  }
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="relative bg-[#0D0D0D] overflow-hidden py-16 md:py-24">
      {/* Background glow effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-orange-500/10 rounded-full blur-[100px]"></div>
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-orange-500/10 rounded-full blur-[100px]"></div>
      </div>
      
      {/* Content container */}
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-wider uppercase mb-2 leading-tight">
            <span className="bg-gradient-to-r from-orange-500 via-orange-400 to-white bg-clip-text text-transparent">GET ANSWERS</span>
            <br />
            <span className="bg-gradient-to-r from-orange-500 via-orange-400 to-white bg-clip-text text-transparent">TO YOUR TOP QUESTIONS</span>
          </h2>
        </div>
        
        <div className="bg-gray-900/60 backdrop-blur-sm rounded-3xl p-6 md:p-8 shadow-xl border border-gray-800/50">
          <div className="divide-y divide-gray-800">
            {faqs.map((faq, index) => (
              <div key={index} className="py-5">
                <button
                  onClick={() => toggleFAQ(index)}
                  className="flex justify-between items-center w-full text-left focus:outline-none group"
                >
                  <h3 className="text-lg md:text-xl font-semibold text-white group-hover:text-orange-400 transition-colors duration-200">
                    {faq.question}
                  </h3>
                  <span className="ml-6 flex-shrink-0 text-orange-500">
                    {openIndex === index ? (
                      <Minus className="h-6 w-6" />
                    ) : (
                      <Plus className="h-6 w-6" />
                    )}
                  </span>
                </button>
                <div
                  className={`mt-3 transition-all duration-300 ease-in-out overflow-hidden ${
                    openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <p className="text-gray-300 text-base md:text-lg leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
} 