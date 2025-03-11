'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function TokenDisplay() {
  const { session } = useAuth();
  const [copied, setCopied] = useState(false);
  const [showToken, setShowToken] = useState(false);
  
  const accessToken = session?.access_token || '';
  const displayToken = showToken 
    ? accessToken
    : accessToken.length > 10 
      ? `${accessToken.substring(0, 10)}...${accessToken.substring(accessToken.length - 5)}` 
      : '';
  
  const copyToClipboard = () => {
    if (accessToken) {
      navigator.clipboard.writeText(accessToken);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  if (!session) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        No valid session found. Please log in first.
      </div>
    );
  }
  
  return (
    <div className="bg-gray-100 p-4 rounded-lg border mb-6">
      <h3 className="font-bold text-lg mb-2">Your Authentication Token</h3>
      <p className="text-sm text-gray-600 mb-2">
        This token is used to authenticate your requests to the backend API. You can use this for debugging.
      </p>
      
      <div className="flex items-center gap-2 mb-2">
        <button 
          onClick={() => setShowToken(!showToken)}
          className="text-sm px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded"
        >
          {showToken ? 'Hide Token' : 'Show Full Token'}
        </button>
        
        <button 
          onClick={copyToClipboard}
          className="text-sm px-2 py-1 bg-blue-500 text-white hover:bg-blue-600 rounded"
        >
          {copied ? 'Copied!' : 'Copy Token'}
        </button>
      </div>
      
      <div className="bg-white p-3 rounded border overflow-x-auto font-mono text-sm">
        {displayToken || 'No token available'}
      </div>
      
      <div className="mt-4 text-sm">
        <div><strong>Token Length:</strong> {accessToken.length} characters</div>
        <div><strong>Expires At:</strong> {session.expires_at 
          ? new Date(session.expires_at * 1000).toLocaleString() 
          : 'Unknown'}</div>
      </div>
      
      <div className="mt-4">
        <h4 className="font-semibold mb-1">Direct API Call Test</h4>
        <button
          onClick={async () => {
            try {
              const response = await fetch('/api/checkout-debug', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ clientToken: accessToken }),
              });
              const data = await response.json();
              console.log('Direct API test result:', data);
              alert(JSON.stringify(data, null, 2));
            } catch (error) {
              console.error('API test error:', error);
              alert('Error testing API: ' + String(error));
            }
          }}
          className="text-sm px-3 py-1.5 bg-green-500 text-white hover:bg-green-600 rounded"
        >
          Test Token with API
        </button>
      </div>
    </div>
  );
} 