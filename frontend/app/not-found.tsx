'use client';

import Link from 'next/link';

export const dynamic = "force-dynamic";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-black">
      <main className="flex-grow flex items-center justify-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-32 md:py-40">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-white sm:text-7xl">
            404 - Page Not Found
          </h1>
          <p className="mt-6 text-xl text-gray-300">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="mt-10">
            <Link
              href="/"
              className="inline-block px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-600 transition-all duration-300 hover:scale-105"
            >
              Go back home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
} 