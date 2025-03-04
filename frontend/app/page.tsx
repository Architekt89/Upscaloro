import Link from 'next/link';
import Footer from '@/components/Footer';
import ClientHeader from '@/components/ClientHeader';
import { CheckIcon } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <ClientHeader />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-gray-900 to-black text-white relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10">
            <div className="text-center">
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
                <span className="block">YOUR FILES,</span>
                <span className="block text-orange-500">YOUR AUTHORITY.</span>
              </h1>
              <p className="mt-6 text-xl text-gray-300 max-w-3xl mx-auto">
                Create fast and secure endpoints to host and share assets, ensuring your team has secure access and full control.
              </p>
              <div className="mt-10">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 md:text-lg"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-96 h-96 rounded-full bg-orange-500/20 blur-3xl" />
          <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-96 h-96 rounded-full bg-orange-500/20 blur-3xl" />
        </section>

        {/* Dashboard Preview Section */}
        <section className="bg-gray-900 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gray-800 rounded-lg p-8 shadow-2xl">
              {/* Dashboard mockup */}
              <div className="grid grid-cols-3 gap-6">
                <div className="bg-gray-700 rounded-lg p-6">
                  <div className="w-12 h-12 bg-orange-500 rounded-lg mb-4" />
                  <div className="h-4 bg-gray-600 rounded w-2/3 mb-2" />
                  <div className="h-3 bg-gray-600 rounded w-1/2" />
                </div>
                <div className="bg-gray-700 rounded-lg p-6">
                  <div className="w-12 h-12 bg-orange-500 rounded-lg mb-4" />
                  <div className="h-4 bg-gray-600 rounded w-2/3 mb-2" />
                  <div className="h-3 bg-gray-600 rounded w-1/2" />
                </div>
                <div className="bg-gray-700 rounded-lg p-6">
                  <div className="w-12 h-12 bg-orange-500 rounded-lg mb-4" />
                  <div className="h-4 bg-gray-600 rounded w-2/3 mb-2" />
                  <div className="h-3 bg-gray-600 rounded w-1/2" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Strong Tools Section */}
        <section className="bg-gray-900 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold text-white mb-4">
              <span className="text-orange-500">STRONG</span> TOOLS,
              <br />
              <span className="text-orange-500">ENDLESS</span> OPPORTUNITIES
            </h2>
          </div>
        </section>

        {/* Start Your Own Platform Section */}
        <section className="bg-gray-900 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-white mb-6">
                  START YOUR OWN
                  <br />
                  ASSET-SHARING PLATFORM
                </h2>
                <p className="text-gray-300 mb-8">
                  Easily share cloud storage platform designed for teams, with powerful features and robust security.
                </p>
                <div className="space-y-4">
                  {['Secure file sharing', 'Team collaboration', 'Access control', 'Custom branding'].map((feature) => (
                    <div key={feature} className="flex items-center">
                      <CheckIcon className="h-5 w-5 text-orange-500 mr-2" />
                      <span className="text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-gray-800 rounded-lg p-6">
                {/* Platform preview mockup */}
                <div className="aspect-video bg-gray-700 rounded-lg" />
              </div>
            </div>
          </div>
        </section>

        {/* Maximize Productivity Section */}
        <section className="bg-gray-900 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white">
                MAXIMIZE YOUR PRODUCTIVITY WITH
                <br />
                INTEGRATED TOOLS
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {['Google', 'Microsoft', 'Slack', 'GitHub'].map((tool) => (
                <div key={tool} className="bg-gray-800 rounded-lg p-6 flex items-center justify-center">
                  <span className="text-gray-300">{tool}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Customize Platform Section */}
        <section className="bg-gray-900 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-white mb-6">
                  CUSTOMIZE YOUR PLATFORM WITH
                  <br />
                  UNIQUE BRANDING
                </h2>
                <p className="text-gray-300">
                  Take your platform to the next level with custom branding options to create a unique user experience.
                </p>
              </div>
              <div className="bg-gray-800 rounded-lg p-6">
                {/* Branding customization mockup */}
                <div className="space-y-4">
                  <div className="h-4 bg-gray-700 rounded w-3/4" />
                  <div className="h-4 bg-gray-700 rounded w-1/2" />
                  <div className="h-4 bg-gray-700 rounded w-2/3" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="bg-gray-900 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-white mb-12">
              HEAR FROM
              <br />
              OUR SATISFIED CLIENTS
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[1, 2, 3].map((testimonial) => (
                <div key={testimonial} className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gray-700 rounded-full" />
                    <div className="ml-4">
                      <div className="h-4 bg-gray-700 rounded w-24" />
                      <div className="h-3 bg-gray-700 rounded w-32 mt-2" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-700 rounded w-full" />
                    <div className="h-3 bg-gray-700 rounded w-5/6" />
                    <div className="h-3 bg-gray-700 rounded w-4/5" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="bg-gray-900 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-white mb-12">
              GET ANSWERS
              <br />
              TO YOUR TOP QUESTIONS
            </h2>
            <div className="space-y-6 max-w-3xl mx-auto">
              {[1, 2, 3, 4].map((faq) => (
                <div key={faq} className="bg-gray-800 rounded-lg p-6">
                  <div className="h-4 bg-gray-700 rounded w-3/4 mb-4" />
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-700 rounded w-full" />
                    <div className="h-3 bg-gray-700 rounded w-5/6" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="bg-gray-900 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold text-white mb-8">
              GET YOUR
              <span className="text-orange-500"> AUTHORITY</span>
            </h2>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              Create your own secure file sharing platform today.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 md:text-lg"
            >
              Get Started Now
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
} 