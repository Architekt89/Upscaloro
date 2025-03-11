'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function TokenTest() {
  const { session } = useAuth();
  const [token, setToken] = useState('');
  const [planId, setPlanId] = useState('pro');
  const [priceId, setPriceId] = useState('price_1R1UVUBQ1z6vW0DwWfGtyIW0');
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [backendUrl, setBackendUrl] = useState('https://upscaloro.onrender.com');
  const [skipAuth, setSkipAuth] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  
  const testBackendConnection = async () => {
    if (!token) {
      setError('Please enter a token');
      return;
    }
    
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      // Test the token with a debug endpoint
      const debugResponse = await fetch('/api/checkout-debug', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ clientToken: token }),
      });
      
      const debugData = await debugResponse.json();
      setResult({
        type: 'debug',
        data: debugData,
      });
    } catch (err) {
      console.error('Error testing connection:', err);
      setError('Error testing connection: ' + String(err));
    } finally {
      setLoading(false);
    }
  };
  
  const createCheckoutSession = async () => {
    setLoading(true);
    setError('');
    setResult('');

    try {
      // Prepare headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Determine which token to use
      let tokenToUse = token;
      
      // If no token provided but we have a session, use that
      if (!tokenToUse && session?.access_token) {
        tokenToUse = session.access_token;
        console.log('Using session token for checkout');
      }
      
      // Add Authorization header if we have a token
      if (tokenToUse) {
        headers['Authorization'] = `Bearer ${tokenToUse}`;
        console.log('Adding token to Authorization header');
      } else {
        console.log('No token available for Authorization header');
      }

      // Use the provided backend URL or default to the environment variable
      const apiUrl = backendUrl || process.env.NEXT_PUBLIC_API_URL || 'https://upscaloro.onrender.com';
      console.log(`Using backend URL: ${apiUrl}`);

      // Make the request directly to the backend API
      const response = await fetch(`${apiUrl}/billing/create-checkout-session`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          plan_id: planId,
          price_id: priceId || 'price_test',
          billing_cycle: billingCycle,
          success_url: window.location.origin + '/token-test?success=true',
          cancel_url: window.location.origin + '/token-test?success=false',
          skip_auth: !tokenToUse // Skip auth if no token
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      setResult(JSON.stringify(data, null, 2));
      
      // If there's a URL, offer to redirect
      if (data.url) {
        setCheckoutUrl(data.url);
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Manual Token Test</h1>
      <p className="mb-8 text-gray-600">
        This page allows you to manually test authentication with a token.
        Paste your authentication token from the auth-test page or use the "Skip Authentication" option.
      </p>
      
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-8">
        <p className="text-blue-800 font-medium mb-2">
          Testing Options:
        </p>
        <div className="flex flex-col space-y-2">
          <Link 
            href="/checkout-test" 
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            Go to Checkout Test Page (No Auth Required) →
          </Link>
          <Link 
            href="/pricing" 
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            Back to Pricing Page →
          </Link>
        </div>
      </div>
      
      <div className="bg-gray-50 p-6 rounded-lg border mb-8">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Authentication Token
          </label>
          <textarea
            className="w-full p-2 border rounded font-mono text-sm h-24"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Paste your authentication token here..."
            disabled={skipAuth}
          />
          
          <div className="mt-2 flex items-center">
            <input
              type="checkbox"
              id="skipAuth"
              checked={skipAuth}
              onChange={(e) => setSkipAuth(e.target.checked)}
              className="mr-2 h-4 w-4"
            />
            <label htmlFor="skipAuth" className="text-sm text-gray-700">
              Skip Authentication (Test checkout without a token)
            </label>
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Backend URL
          </label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={backendUrl}
            onChange={(e) => setBackendUrl(e.target.value)}
            placeholder="https://upscaloro.onrender.com"
          />
          <p className="text-xs text-gray-500 mt-1">
            Default is set to the Render deployment URL. The correct endpoint is /api/create-checkout-session.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Plan ID
            </label>
            <select
              className="w-full p-2 border rounded"
              value={planId}
              onChange={(e) => setPlanId(e.target.value)}
            >
              <option value="free">Free</option>
              <option value="pro">Pro</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price ID
            </label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={priceId}
              onChange={(e) => setPriceId(e.target.value)}
              placeholder="price_123..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Billing Cycle
            </label>
            <select
              className="w-full p-2 border rounded"
              value={billingCycle}
              onChange={(e) => setBillingCycle(e.target.value)}
            >
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex-1"
            onClick={createCheckoutSession}
            disabled={loading || (!token && !skipAuth)}
          >
            {loading ? 'Loading...' : 'Create Checkout Session'}
          </button>
          
          <button
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
            onClick={() => {
              setToken('');
              setBackendUrl('https://upscaloro.onrender.com');
              setSkipAuth(false);
              setResult(null);
              setError(null);
            }}
            disabled={loading}
          >
            Clear
          </button>
        </div>
      </div>
      
      {error && (
        <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-lg font-semibold text-red-700 mb-2">Error</h2>
          <pre className="text-sm font-mono whitespace-pre-wrap text-red-800 bg-red-50 p-2 rounded">
            {typeof error === 'string' ? error : JSON.stringify(error, null, 2)}
          </pre>
        </div>
      )}
      
      {result && (
        <div className="mt-4">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">
            Result:
          </h2>
          <pre className="text-sm font-mono whitespace-pre-wrap text-green-800 bg-green-50 p-2 rounded">
            {result}
          </pre>
          
          {checkoutUrl && (
            <div className="mt-4">
              <h3 className="text-md font-semibold text-gray-700 mb-2">
                Checkout URL:
              </h3>
              <div className="flex flex-col space-y-2">
                <div className="text-sm font-mono break-all bg-blue-50 p-2 rounded">
                  {checkoutUrl}
                </div>
                <button
                  onClick={() => window.location.href = checkoutUrl}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 