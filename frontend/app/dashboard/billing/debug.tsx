'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

export default function BackendDebug() {
  const [backendStatus, setBackendStatus] = useState<'loading' | 'connected' | 'error'>('loading');
  const [errorDetails, setErrorDetails] = useState<any>(null);
  const [apiUrl, setApiUrl] = useState<string>('');
  
  useEffect(() => {
    const checkBackend = async () => {
      try {
        // Get the API URL from environment variable
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        setApiUrl(API_URL);
        
        // Try to connect to the backend health endpoint
        const response = await axios.get(`${API_URL}/health`);
        
        if (response.status === 200) {
          setBackendStatus('connected');
        } else {
          setBackendStatus('error');
          setErrorDetails({
            status: response.status,
            data: response.data
          });
        }
      } catch (error) {
        setBackendStatus('error');
        
        if (axios.isAxiosError(error)) {
          setErrorDetails({
            message: error.message,
            code: error.code,
            status: error.response?.status,
            data: error.response?.data
          });
        } else {
          setErrorDetails({ message: 'Unknown error' });
        }
      }
    };
    
    checkBackend();
  }, []);
  
  return (
    <div className="p-4 bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800/50 shadow-xl mb-8">
      <h2 className="text-xl font-semibold text-white mb-4">Backend Connection Status</h2>
      
      <div className="mb-4">
        <p className="text-gray-300">API URL: <span className="text-white">{apiUrl}</span></p>
      </div>
      
      {backendStatus === 'loading' && (
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-orange-500 mr-2"></div>
          <p className="text-gray-300">Checking backend connection...</p>
        </div>
      )}
      
      {backendStatus === 'connected' && (
        <div className="flex items-center">
          <div className="h-5 w-5 bg-green-500 rounded-full mr-2"></div>
          <p className="text-green-500">Backend is connected and healthy</p>
        </div>
      )}
      
      {backendStatus === 'error' && (
        <div>
          <div className="flex items-center mb-2">
            <div className="h-5 w-5 bg-red-500 rounded-full mr-2"></div>
            <p className="text-red-500">Backend connection error</p>
          </div>
          
          <div className="bg-gray-800 p-4 rounded-lg overflow-auto max-h-60">
            <pre className="text-gray-300 text-sm">
              {JSON.stringify(errorDetails, null, 2)}
            </pre>
          </div>
          
          <div className="mt-4">
            <p className="text-gray-300 text-sm">
              <strong>Possible solutions:</strong>
            </p>
            <ul className="list-disc list-inside text-gray-300 text-sm mt-2">
              <li>Make sure the backend server is running</li>
              <li>Check that the API URL is correct in your .env file</li>
              <li>Verify that CORS is properly configured on the backend</li>
              <li>Check for network issues or firewall restrictions</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
} 