'use client';

import ContactForm from '@/components/ContactForm';
import ContactInfo from '@/components/ContactInfo';
import ContactFAQ from '@/components/ContactFAQ';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-gray-950 to-black">
      {/* Background glow effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-orange-500/10 rounded-full blur-[100px]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-500/5 rounded-full blur-[150px]"></div>
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-orange-500/10 rounded-full blur-[100px]"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">Get in Touch</h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Have questions about our services or need help with your account? 
            We're here to help. Fill out the form below and we'll get back to you as soon as possible.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Information */}
          <div className="lg:col-span-1">
            <ContactInfo />
          </div>
          
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <ContactForm />
          </div>
        </div>
        
        {/* FAQ Section */}
        <ContactFAQ />
      </div>
    </div>
  );
} 