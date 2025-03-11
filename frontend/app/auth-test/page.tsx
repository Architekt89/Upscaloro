'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { JsonView, defaultStyles } from 'react-json-view-lite';
import 'react-json-view-lite/dist/index.css';
import TokenDisplay from './token-display';

// Simple UI components
const Button = ({ 
  children, 
  onClick, 
  disabled, 
  variant = 'default' 
}: { 
  children: React.ReactNode; 
  onClick: () => void; 
  disabled?: boolean; 
  variant?: 'default' | 'outline' | 'destructive'; 
}) => {
  let className = "px-4 py-2 rounded font-medium";
  
  if (variant === 'default') {
    className += " bg-blue-600 text-white hover:bg-blue-700";
  } else if (variant === 'outline') {
    className += " border border-gray-300 bg-transparent hover:bg-gray-50";
  } else if (variant === 'destructive') {
    className += " bg-red-600 text-white hover:bg-red-700";
  }
  
  if (disabled) {
    className += " opacity-50 cursor-not-allowed";
  }
  
  return (
    <button 
      className={className} 
      onClick={onClick} 
      disabled={disabled}
    >
      {children}
    </button>
  );
};

const Card = ({ children }: { children: React.ReactNode }) => (
  <div className="border rounded-lg shadow-sm overflow-hidden bg-white">
    {children}
  </div>
);

const CardHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="px-6 py-4 border-b">{children}</div>
);

const CardContent = ({ children }: { children: React.ReactNode }) => (
  <div className="px-6 py-4">{children}</div>
);

const CardTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-xl font-semibold">{children}</h3>
);

const CardDescription = ({ children }: { children: React.ReactNode }) => (
  <p className="text-sm text-gray-500 mt-1">{children}</p>
);

export default function AuthTestPage() {
  const { user, session, refreshUser, signOut } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('client');
  
  useEffect(() => {
    // Set initial debug info
    setDebugInfo({
      clientSide: {
        user: user,
        session: session,
        authenticated: !!user,
        hasSession: !!session,
        tokenExpiry: session?.expires_at 
          ? new Date(session.expires_at * 1000).toISOString() 
          : 'No expiry',
        tokenExpiresIn: session?.expires_at
          ? `${((new Date(session.expires_at * 1000).getTime() - Date.now()) / (1000 * 60)).toFixed(2)} minutes`
          : 'Unknown',
      }
    });
  }, [user, session]);
  
  const fetchServerDebugInfo = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth-debug');
      const data = await response.json();
      
      setDebugInfo((prevInfo: any) => ({
        ...prevInfo,
        serverSide: data
      }));
    } catch (error) {
      console.error('Error fetching server debug info:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleRefreshUser = async () => {
    try {
      setLoading(true);
      await refreshUser();
      
      // Update debug info after refresh
      setDebugInfo((prevInfo: any) => ({
        ...prevInfo,
        clientSide: {
          user: user,
          session: session,
          authenticated: !!user,
          hasSession: !!session,
          tokenExpiry: session?.expires_at 
            ? new Date(session.expires_at * 1000).toISOString() 
            : 'No expiry',
          tokenExpiresIn: session?.expires_at
            ? `${((new Date(session.expires_at * 1000).getTime() - Date.now()) / (1000 * 60)).toFixed(2)} minutes`
            : 'Unknown',
        }
      }));
    } catch (error) {
      console.error('Error refreshing user:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleManualRefreshSession = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/refresh-session');
      const data = await response.json();
      
      // Refresh the user data after session refresh
      await refreshUser();
      
      // Update debug info
      setDebugInfo((prevInfo: any) => ({
        ...prevInfo,
        refreshResult: data
      }));
    } catch (error) {
      console.error('Error refreshing session:', error);
      setDebugInfo((prevInfo: any) => ({
        ...prevInfo,
        refreshError: {
          message: (error as Error).message,
          stack: (error as Error).stack
        }
      }));
    } finally {
      setLoading(false);
    }
  };
  
  // Render the content for the active tab
  const renderTabContent = () => {
    if (activeTab === 'client') {
      return (
        <div className="border rounded-md p-4 bg-gray-50 dark:bg-gray-900 overflow-auto max-h-[500px]">
          <JsonView 
            data={debugInfo?.clientSide || {}} 
            style={defaultStyles}
          />
        </div>
      );
    } else if (activeTab === 'server') {
      return (
        <div className="border rounded-md p-4 bg-gray-50 dark:bg-gray-900 overflow-auto max-h-[500px]">
          {debugInfo?.serverSide ? (
            <JsonView 
              data={debugInfo.serverSide} 
              style={defaultStyles}
            />
          ) : (
            <p className="text-center py-4">
              Click "Check Server Auth Status" to fetch server-side information
            </p>
          )}
        </div>
      );
    } else if (activeTab === 'refresh') {
      return (
        <div className="border rounded-md p-4 bg-gray-50 dark:bg-gray-900 overflow-auto max-h-[500px]">
          {debugInfo?.refreshResult || debugInfo?.refreshError ? (
            <JsonView 
              data={debugInfo.refreshResult || debugInfo.refreshError || {}} 
              style={defaultStyles}
            />
          ) : (
            <p className="text-center py-4">
              Click "Force Refresh Session" to try refreshing your session
            </p>
          )}
        </div>
      );
    }
    
    return null;
  };
  
  return (
    <main className="container py-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Authentication Test Page</h1>
        <p className="text-gray-500">Use this page to debug authentication and session issues</p>
      </div>
      
      <TokenDisplay />
      
      <div className="flex flex-wrap gap-4 mb-8">
        <Button 
          variant="default" 
          onClick={handleRefreshUser}
          disabled={loading}
        >
          Refresh User Data
        </Button>
        
        <Button 
          variant="outline" 
          onClick={fetchServerDebugInfo}
          disabled={loading}
        >
          Check Server Auth Status
        </Button>
        
        <Button 
          variant="outline" 
          onClick={handleManualRefreshSession}
          disabled={loading}
        >
          Force Refresh Session
        </Button>
        
        <Button 
          variant="destructive" 
          onClick={signOut}
          disabled={loading}
        >
          Sign Out
        </Button>
      </div>
      
      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Status</CardTitle>
            <CardDescription>
              {user ? `Logged in as ${user.email}` : 'Not authenticated'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-semibold">User Status:</p>
                <p className={user ? "text-green-500" : "text-red-500"}>
                  {user ? "Authenticated" : "Not Authenticated"}
                </p>
              </div>
              <div>
                <p className="font-semibold">Session Status:</p>
                <p className={session ? "text-green-500" : "text-red-500"}>
                  {session ? "Active Session" : "No Session"}
                </p>
              </div>
              {session && (
                <>
                  <div>
                    <p className="font-semibold">Token Expires:</p>
                    <p>{session.expires_at 
                      ? new Date(session.expires_at * 1000).toLocaleString() 
                      : 'Unknown'}
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold">Expires In:</p>
                    <p>{session.expires_at
                      ? `${((new Date(session.expires_at * 1000).getTime() - Date.now()) / (1000 * 60)).toFixed(2)} minutes`
                      : 'Unknown'}
                    </p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
        
        {debugInfo && (
          <Card>
            <CardHeader>
              <CardTitle>Debug Information</CardTitle>
              <CardDescription>
                Detailed session and authentication data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2 border-b mb-4">
                <button
                  className={`px-4 py-2 font-medium text-sm ${
                    activeTab === 'client' 
                      ? "border-b-2 border-blue-500 text-blue-600" 
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                  onClick={() => setActiveTab('client')}
                >
                  Client Side
                </button>
                <button
                  className={`px-4 py-2 font-medium text-sm ${
                    activeTab === 'server' 
                      ? "border-b-2 border-blue-500 text-blue-600" 
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                  onClick={() => setActiveTab('server')}
                >
                  Server Side
                </button>
                <button
                  className={`px-4 py-2 font-medium text-sm ${
                    activeTab === 'refresh' 
                      ? "border-b-2 border-blue-500 text-blue-600" 
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                  onClick={() => setActiveTab('refresh')}
                >
                  Refresh Results
                </button>
              </div>
              
              {renderTabContent()}
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
} 