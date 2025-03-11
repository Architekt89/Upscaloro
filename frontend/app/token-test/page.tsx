'use client';

import React, { useState } from 'react';

export default function TokenTest() {
  const [token, setToken] = useState('');
  const [planId, setPlanId] = useState('pro');
  const [priceId, setPriceId] = useState('price_1R1UVUBQ1z6vW0DwWfGtyIW0');
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [backendUrl, setBackendUrl] = useState('https://upscaloro.onrender.com');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
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
    if (!token) {
      setError('Please enter a token');
      return;
    }
    
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      // Create a checkout session using the token
      const checkoutResponse = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          priceId,
          billingCycle,
          directToken: token,
          customBackendUrl: backendUrl || undefined,
        }),
      });
      
      const checkoutData = await checkoutResponse.json();
      setResult({
        type: 'checkout',
        data: checkoutData,
      });
      
      // If successful, redirect to Stripe
      if (checkoutData.url) {
        window.location.href = checkoutData.url;
      }
    } catch (err) {
      console.error('Error creating checkout session:', err);
      setError('Error creating checkout session: ' + String(err));
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Manual Token Test</h1>
      <p className="mb-8 text-gray-600">
        This page allows you to manually test authentication with a token.
        Paste your authentication token from the auth-test page.
      </p>
      
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
          />
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
            disabled={loading || !token}
          >
            {loading ? 'Loading...' : 'Create Checkout Session'}
          </button>
          
          <button
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
            onClick={() => {
              setToken('');
              setBackendUrl('');
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
        <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h2 className="text-lg font-semibold text-green-700 mb-2">
            {result.type === 'checkout' ? 'Checkout Result' : 'Test Result'}
          </h2>
          <pre className="text-sm font-mono whitespace-pre-wrap text-green-800 bg-green-50 p-2 rounded">
            {JSON.stringify(result.data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
} 