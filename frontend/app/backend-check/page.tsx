'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';

interface EndpointInfo {
  status: 'loading' | 'connected' | 'error';
  data: any;
  error: any;
}

interface Endpoints {
  [key: string]: EndpointInfo;
}

export default function BackendCheckPage() {
  const [backendStatus, setBackendStatus] = useState<'loading' | 'connected' | 'error'>('loading');
  const [errorDetails, setErrorDetails] = useState<any>(null);
  const [apiUrl, setApiUrl] = useState<string>('');
  const [endpoints, setEndpoints] = useState<Endpoints>({
    '/health': { status: 'loading', data: null, error: null },
    '/': { status: 'loading', data: null, error: null },
    '/models': { status: 'loading', data: null, error: null },
    '/billing/plans': { status: 'loading', data: null, error: null }
  });
  
  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    setApiUrl(API_URL);
    
    // Check each endpoint
    const checkEndpoints = async () => {
      const newEndpoints = { ...endpoints };
      
      for (const endpoint of Object.keys(endpoints)) {
        try {
          const response = await axios.get(`${API_URL}${endpoint}`);
          newEndpoints[endpoint] = {
            status: 'connected',
            data: response.data,
            error: null
          };
        } catch (error) {
          newEndpoints[endpoint] = {
            status: 'error',
            data: null,
            error: axios.isAxiosError(error) ? {
              message: error.message,
              status: error.response?.status,
              data: error.response?.data
            } : { message: 'Unknown error' }
          };
        }
      }
      
      setEndpoints(newEndpoints);
      
      // Check overall status
      if (newEndpoints['/health'].status === 'connected') {
        setBackendStatus('connected');
      } else {
        setBackendStatus('error');
        setErrorDetails(newEndpoints['/health'].error);
      }
    };
    
    checkEndpoints();
  }, []);
  
  return (
    <div className="min-h-screen bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Backend Connection Check</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            This page helps diagnose connection issues between the frontend and backend.
          </p>
        </div>
        
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50 shadow-xl mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Backend Configuration</h2>
          
          <div className="mb-6">
            <p className="text-gray-300">API URL: <span className="text-white font-mono">{apiUrl}</span></p>
            <p className="text-gray-400 text-sm mt-1">
              This is set via the <code className="bg-gray-800 px-1 py-0.5 rounded">NEXT_PUBLIC_API_URL</code> environment variable.
            </p>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium text-white mb-2">Overall Status</h3>
            
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
              </div>
            )}
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-white mb-2">Endpoint Status</h3>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-800">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Endpoint</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {Object.entries(endpoints).map(([endpoint, info]) => (
                    <tr key={endpoint}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-300">
                        {endpoint}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {info.status === 'loading' && (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-orange-500 mr-2"></div>
                            <span className="text-gray-300">Checking...</span>
                          </div>
                        )}
                        
                        {info.status === 'connected' && (
                          <div className="flex items-center">
                            <div className="h-4 w-4 bg-green-500 rounded-full mr-2"></div>
                            <span className="text-green-500">Connected</span>
                          </div>
                        )}
                        
                        {info.status === 'error' && (
                          <div className="flex items-center">
                            <div className="h-4 w-4 bg-red-500 rounded-full mr-2"></div>
                            <span className="text-red-500">Error {info.error?.status}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {info.status === 'connected' && (
                          <details>
                            <summary className="cursor-pointer text-orange-500 hover:text-orange-400">View Response</summary>
                            <div className="mt-2 bg-gray-800 p-3 rounded-lg overflow-auto max-h-40">
                              <pre className="text-gray-300 text-xs">
                                {JSON.stringify(info.data, null, 2)}
                              </pre>
                            </div>
                          </details>
                        )}
                        
                        {info.status === 'error' && (
                          <details>
                            <summary className="cursor-pointer text-orange-500 hover:text-orange-400">View Error</summary>
                            <div className="mt-2 bg-gray-800 p-3 rounded-lg overflow-auto max-h-40">
                              <pre className="text-gray-300 text-xs">
                                {JSON.stringify(info.error, null, 2)}
                              </pre>
                            </div>
                          </details>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50 shadow-xl mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Troubleshooting</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-white mb-2">Common Issues</h3>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li>
                  <strong>Backend server is not running</strong> - Start the backend server with:
                  <pre className="bg-gray-800 p-2 rounded-lg mt-1 text-sm overflow-x-auto">
                    cd backend && uvicorn main:app --reload
                  </pre>
                </li>
                <li>
                  <strong>Incorrect API URL</strong> - Check your <code className="bg-gray-800 px-1 py-0.5 rounded">.env</code> file and make sure <code className="bg-gray-800 px-1 py-0.5 rounded">NEXT_PUBLIC_API_URL</code> is set correctly.
                </li>
                <li>
                  <strong>CORS issues</strong> - Make sure the backend has CORS configured to allow requests from your frontend.
                </li>
                <li>
                  <strong>Network issues</strong> - Check if there are any firewalls or network restrictions preventing the connection.
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-white mb-2">Next Steps</h3>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li>Check the backend server logs for any errors</li>
                <li>Verify that the backend server is running on the expected port</li>
                <li>Check the browser console for more detailed error messages</li>
                <li>Try accessing the backend API directly in your browser or with a tool like Postman</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <Link href="/dashboard/billing" className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500">
            Return to Billing Page
          </Link>
        </div>
      </div>
    </div>
  );
} 