'use client';

import Link from 'next/link';
import ClientHeader from '@/components/ClientHeader';
import Footer from '@/components/Footer';

export const dynamic = "force-dynamic"; // Add this line

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <ClientHeader />
      <main className="flex-grow flex items-center justify-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl">
            404 - Page Not Found
          </h1>
          <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="mt-10">
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Go back home
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 