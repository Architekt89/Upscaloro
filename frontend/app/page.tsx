import Link from 'next/link';
import Footer from '@/components/Footer';
import ClientHeader from '@/components/ClientHeader';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <ClientHeader />
      <main className="flex-grow">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -left-10 top-1/4 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl"></div>
            <div className="absolute right-0 top-1/2 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"></div>
            <div className="absolute left-1/3 bottom-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl"></div>
          </div>

          {/* Content */}
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6">
                <span className="text-orange-500 inline-block">Enhance Your</span>{' '}
                <span className="text-white">Images with AI-Powered Upscaling</span>
              </h1>
              <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-300 mb-10">
                Transform low-resolution images into stunning high-definition visuals with our cutting-edge AI technology.
              </p>
              <Link
                href="/auth/signup"
                className="inline-block px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-orange-500 to-orange-600 rounded-full shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:brightness-110 transition-all duration-300 animate-pulse-subtle"
              >
                Get Started For Free
              </Link>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-12 bg-gray-50 dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:text-center">
              <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">Features</h2>
              <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                Advanced Image Upscaling
              </p>
              <p className="mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-400 lg:mx-auto">
                Our AI models are trained on millions of images to deliver exceptional results.
              </p>
            </div>

            <div className="mt-10">
              <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
                <div className="relative">
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="ml-16">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Up to 16x Upscaling</h3>
                    <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
                      Increase image resolution by up to 16 times while preserving details and enhancing quality.
                    </p>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  </div>
                  <div className="ml-16">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Multiple AI Models</h3>
                    <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
                      Choose from specialized models for photos, faces, anime, and more to get the best results.
                    </p>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="ml-16">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Fast Processing</h3>
                    <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
                      Our optimized infrastructure delivers results in seconds, not minutes.
                    </p>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                    </svg>
                  </div>
                  <div className="ml-16">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Advanced Controls</h3>
                    <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
                      Fine-tune parameters like creativity, resemblance, and dynamic range for perfect results.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-primary-700">
          <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              <span className="block">Ready to enhance your images?</span>
              <span className="block">Start using Upscalor today.</span>
            </h2>
            <p className="mt-4 text-lg leading-6 text-primary-200">
              Join thousands of professionals who trust our AI technology for their image upscaling needs.
            </p>
            <Link
              href="/dashboard"
              className="mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-primary-50 sm:w-auto"
            >
              Get started
            </Link>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 