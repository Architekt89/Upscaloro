'use client';

import React, { useState } from 'react';

export default function TokenTest() {
  const [token, setToken] = useState('');
  const [planId, setPlanId] = useState('pro');
  const [priceId, setPriceId] = useState('price_1R1UVUBQ1z6vW0DwWfGtyIW0');
  const [billingCycle, setBillingCycle] = useState('monthly');
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
              <option value="pro">Pro</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price ID
            </label>
            <select
              className="w-full p-2 border rounded"
              value={priceId}
              onChange={(e) => setPriceId(e.target.value)}
            >
              <option value="price_1R1UVUBQ1z6vW0DwWfGtyIW0">Pro Monthly ($15)</option>
              <option value="price_1R1UWMBQ1z6vW0DwRkcoXWT7">Pro Annual ($144)</option>
              <option value="price_1R1UWzBQ1z6vW0DwRDLKndlG">Enterprise Monthly ($30)</option>
              <option value="price_1R1UXlBQ1z6vW0DwMaBDmKaZ">Enterprise Annual ($288)</option>
            </select>
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
              <option value="annual">Annual</option>
            </select>
          </div>
        </div>
        
        <div className="flex gap-4 mt-6">
          <button
            onClick={testBackendConnection}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Backend Connection'}
          </button>
          
          <button
            onClick={createCheckoutSession}
            disabled={loading}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Checkout Session'}
          </button>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <strong className="font-bold">Error!</strong>
          <p className="mt-1">{error}</p>
        </div>
      )}
      
      {result && (
        <div className="bg-white border rounded-lg overflow-hidden">
          <div className="bg-gray-100 px-4 py-2 border-b">
            <h3 className="font-bold">
              {result.type === 'debug' ? 'Backend Connection Test Result' : 'Checkout Session Result'}
            </h3>
          </div>
          <div className="p-4 overflow-x-auto">
            <pre className="text-sm">{JSON.stringify(result.data, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
} 