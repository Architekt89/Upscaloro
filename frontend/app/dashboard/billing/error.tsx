'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';

export default function BillingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Billing page error:', error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Billing &amp; Subscription</h1>
        <Link 
          href="/dashboard" 
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-orange-500 bg-transparent border border-orange-500 rounded-md hover:bg-orange-500 hover:text-white transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>

      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50 shadow-xl mb-8">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <AlertCircle className="h-8 w-8 text-orange-500" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">Subscription Information Temporarily Unavailable</h3>
            <p className="text-gray-300 mb-4">
              We're having trouble loading your subscription details. This might be due to a temporary issue with our billing service.
            </p>
            <p className="text-gray-300 mb-6">
              Don't worry, your subscription status is still active and you can continue using all features. We're working to resolve this issue.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={reset}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                Try Again
              </button>
              <Link
                href="/dashboard"
                className="inline-flex items-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-300 bg-transparent hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                Return to Dashboard
              </Link>
              <Link
                href="/backend-check"
                className="inline-flex items-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-300 bg-transparent hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                Check System Status
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50 shadow-xl">
        <h3 className="text-lg font-semibold text-white mb-2">Need Help?</h3>
        <p className="text-gray-300 mb-4">
          If you continue to experience issues or have questions about your subscription:
        </p>
        <ul className="list-disc list-inside text-gray-300 mb-4 pl-4 space-y-2">
          <li>Check that your internet connection is stable</li>
          <li>Clear your browser cache and try again</li>
          <li>Make sure you're logged in with the correct account</li>
          <li>Contact our support team if the issue persists</li>
        </ul>
        <Link
          href="/contact"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
        >
          Contact Support
        </Link>
      </div>
    </div>
  );
} 