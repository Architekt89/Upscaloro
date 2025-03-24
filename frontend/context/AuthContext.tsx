'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, getCurrentUser, signOut as supabaseSignOut, getSession } from '@/utils/supabase';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<User | null>;
  forceSignOut: () => Promise<{ success: boolean; error?: unknown }>;
  recoverSession: () => Promise<boolean>;
  session: any | null;
  redirectToLogin: () => void;
  redirectIfAuthenticated: (targetPath: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
  refreshUser: async () => null,
  forceSignOut: async () => ({ success: false }),
  recoverSession: async () => false,
  session: null,
  redirectToLogin: () => {},
  redirectIfAuthenticated: async () => false
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [initAttempted, setInitAttempted] = useState(false);
  const router = useRouter();

  // Function to check and refresh the session if needed
  const checkAndRefreshSession = async () => {
    const currentSession = await getSession();
    
    // Check if session is about to expire (within 5 minutes)
    if (currentSession?.expires_at) {
      const expiresAt = new Date(currentSession.expires_at * 1000);
      const now = new Date();
      const minutesUntilExpiry = (expiresAt.getTime() - now.getTime()) / (1000 * 60);
      
      // More efficient logging
      if (process.env.NODE_ENV === 'development') {
        console.log(`Session expires in ${minutesUntilExpiry.toFixed(2)} minutes`);
      }
      
      // If session expires soon (< 5 minutes), refresh it
      if (minutesUntilExpiry < 5) {
        if (process.env.NODE_ENV === 'development') {
          console.log('Session expiring soon, refreshing...');
        }
        
        const { data, error } = await supabase.auth.refreshSession();
        
        if (error) {
          console.error('Error refreshing session:', error);
        } else {
          if (process.env.NODE_ENV === 'development') {
            console.log('Session refreshed successfully');
          }
          
          setSession(data.session);
          return data.session;
        }
      }
    }
    
    return currentSession;
  };
  
  // Function to refresh the user data
  const refreshUser = async () => {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('Refreshing user data...');
      }
      
      // First try to refresh the session if needed
      const refreshedSession = await checkAndRefreshSession();
      
      // Get current user
      const currentUser = await getCurrentUser();
      
      // Only update state if component is still mounted (checked via ref)
      setUser(currentUser);
      setSession(refreshedSession || session);
      
      // Update session storage
      if (typeof window !== 'undefined' && currentUser) {
        try {
          sessionStorage.setItem('upscaloro_user', JSON.stringify(currentUser));
          if (refreshedSession) {
            sessionStorage.setItem('upscaloro_session', JSON.stringify(refreshedSession));
          }
        } catch (storageError) {
          console.error('Error saving to session storage during refresh:', storageError);
        }
      } else if (typeof window !== 'undefined' && !currentUser) {
        try {
          sessionStorage.removeItem('upscaloro_user');
          sessionStorage.removeItem('upscaloro_session');
        } catch (storageError) {
          console.error('Error clearing session storage during refresh:', storageError);
        }
      }
      
      return currentUser;
    } catch (error) {
      console.error('Error refreshing user:', error);
      return null;
    }
  };
  
  // Function to attempt to recover a broken session
  const recoverSession = async (): Promise<boolean> => {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('Attempting to recover session...');
      }
      
      // 1. First try a simple refresh
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Standard refresh failed:', error);
        
        // 2. Try to force the auth stateChange event 
        await supabase.auth.signOut({ scope: 'local' });
        
        // Wait a moment for state to clear
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 3. Try to get session from cookie
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (sessionData.session) {
          if (process.env.NODE_ENV === 'development') {
            console.log('Recovered session from cookie');
          }
          
          setSession(sessionData.session);
          setUser(sessionData.session.user);
          return true;
        }
        
        if (process.env.NODE_ENV === 'development') {
          console.log('Session recovery failed');
        }
        
        return false;
      }
      
      if (data?.session) {
        if (process.env.NODE_ENV === 'development') {
          console.log('Session recovered via refresh');
        }
        
        setSession(data.session);
        setUser(data.session.user);
        return true;
      }
      
      return false;
    } catch (recoveryError) {
      console.error('Error during session recovery:', recoveryError);
      return false;
    }
  };

  // Force sign out (for debugging and recovering from broken sessions)
  const forceSignOut = async () => {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('Forcing sign out...');
      }
      
      // Clear all auth data
      await supabase.auth.signOut({ scope: 'global' });
      
      // Clear from our state
      setUser(null);
      setSession(null);
      
      // Clear any cookies manually
      if (typeof document !== 'undefined') {
        document.cookie = `sb-auth-token=;path=/;max-age=0;SameSite=Lax`;
        document.cookie = `supabase-auth-token=;path=/;max-age=0;SameSite=Lax`;
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Force sign out completed');
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error during force sign out:', error);
      return { success: false, error };
    }
  };

  // Handle sign out
  const handleSignOut = async () => {
    try {
      setLoading(true);
      if (process.env.NODE_ENV === 'development') {
        console.log('Signing out...');
      }
      
      await supabaseSignOut();
      setUser(null);
      setSession(null);
      
      // Clear session storage
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.removeItem('upscaloro_user');
          sessionStorage.removeItem('upscaloro_session');
        } catch (storageError) {
          console.error('Error clearing session storage during sign out:', storageError);
        }
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Sign out successful');
      }
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
    }
  };

  // Function to redirect to login page
  const redirectToLogin = () => {
    if (typeof window !== 'undefined') {
      // Get the current URL to redirect back after login
      const currentPath = window.location.pathname;
      const redirectPath = currentPath !== '/auth/login' && currentPath !== '/auth/signup' 
        ? `?redirect=${encodeURIComponent(currentPath)}`
        : '';
      
      // Use hard navigation for more reliable redirection
      window.location.href = `/auth/login${redirectPath}`;
    }
  };
  
  // Function to redirect if user is authenticated
  const redirectIfAuthenticated = async (targetPath: string): Promise<boolean> => {
    if (loading) {
      // Still loading, don't redirect yet
      return false;
    }
    
    try {
      // Check if we have a user
      if (user) {
        if (typeof window !== 'undefined') {
          if (process.env.NODE_ENV === 'development') {
            console.log(`User is authenticated, redirecting to ${targetPath}`);
          }
          
          // Use hard navigation for more reliable redirection
          window.location.href = targetPath;
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error during redirect check:', error);
      return false;
    }
  };

  // Effect to initialize auth state
  useEffect(() => {
    // Skip if we've already attempted initialization
    if (initAttempted) return;
    
    const initAuth = async () => {
      try {
        setLoading(true);
        setInitAttempted(true);
        
        if (process.env.NODE_ENV === 'development') {
          console.log('Initializing auth state...');
        }

        // Try to get user from sessionStorage first as a quick initial state
        if (typeof window !== 'undefined') {
          try {
            const storedUser = sessionStorage.getItem('upscaloro_user');
            const storedSession = sessionStorage.getItem('upscaloro_session');
            
            if (storedUser && storedSession) {
              const parsedUser = JSON.parse(storedUser);
              const parsedSession = JSON.parse(storedSession);
              
              // Quick set to avoid UI flicker
              setUser(parsedUser);
              setSession(parsedSession);
              
              if (process.env.NODE_ENV === 'development') {
                console.log('Initialized from session storage');
              }
            }
          } catch (storageError) {
            console.error('Error accessing session storage:', storageError);
          }
        }
        
        // Get current user
        const currentUser = await getCurrentUser();
        
        // Get current session
        const currentSession = await getSession();
        
        if (currentUser) {
          setUser(currentUser);
          setSession(currentSession);
          
          // Store in sessionStorage for faster loading on navigation
          if (typeof window !== 'undefined') {
            try {
              sessionStorage.setItem('upscaloro_user', JSON.stringify(currentUser));
              if (currentSession) {
                sessionStorage.setItem('upscaloro_session', JSON.stringify(currentSession));
              }
            } catch (storageError) {
              console.error('Error saving to session storage:', storageError);
            }
          }
          
          if (process.env.NODE_ENV === 'development') {
            console.log('User authenticated:', currentUser.email);
            console.log('Session info:', {
              hasSession: !!currentSession,
              tokenExpiry: currentSession?.expires_at 
                ? new Date(currentSession.expires_at * 1000).toISOString() 
                : 'No expiry date',
              hasToken: !!currentSession?.access_token,
              tokenLength: currentSession?.access_token?.length
            });
          }
          
          // If session expires soon (< 5 minutes), refresh it
          await checkAndRefreshSession();
        } else {
          setUser(null);
          setSession(null);
          
          // Clear session storage
          if (typeof window !== 'undefined') {
            try {
              sessionStorage.removeItem('upscaloro_user');
              sessionStorage.removeItem('upscaloro_session');
            } catch (storageError) {
              console.error('Error clearing session storage:', storageError);
            }
          }
          
          if (process.env.NODE_ENV === 'development') {
            console.log('No authenticated user found');
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        // Short delay to ensure UI doesn't flash
        setTimeout(() => {
          setLoading(false);
        }, 200);
      }
    };

    initAuth();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('Auth state changed:', event);
        }
        
        // Always set loading true when auth state changes
        setLoading(true);
        
        if (session?.user) {
          setUser(session.user);
          setSession(session);
          
          if (process.env.NODE_ENV === 'development') {
            console.log('Session updated from auth state change');
          }
        } else {
          setUser(null);
          setSession(null);
        }
        
        // Short delay to ensure UI doesn't flash
        setTimeout(() => {
          setLoading(false);
        }, 200);
      }
    );
    
    // Set up a periodic session refresh check (every 5 minutes)
    const refreshInterval = setInterval(() => {
      if (user) {
        if (process.env.NODE_ENV === 'development') {
          console.log('Periodic session refresh check');
        }
        
        checkAndRefreshSession();
      }
    }, 5 * 60 * 1000);

    return () => {
      subscription.unsubscribe();
      clearInterval(refreshInterval);
    };
  }, [initAttempted]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signOut: handleSignOut,
        refreshUser,
        forceSignOut,
        recoverSession,
        session,
        redirectToLogin,
        redirectIfAuthenticated
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 