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
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
  refreshUser: async () => null,
  forceSignOut: async () => ({ success: false }),
  recoverSession: async () => false,
  session: null
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Function to check and refresh the session if needed
  const checkAndRefreshSession = async () => {
    const currentSession = await getSession();
    
    // Check if session is about to expire (within 5 minutes)
    if (currentSession?.expires_at) {
      const expiresAt = new Date(currentSession.expires_at * 1000);
      const now = new Date();
      const minutesUntilExpiry = (expiresAt.getTime() - now.getTime()) / (1000 * 60);
      
      console.log(`Session expires in ${minutesUntilExpiry.toFixed(2)} minutes`);
      
      // If session expires soon (< 5 minutes), refresh it
      if (minutesUntilExpiry < 5) {
        console.log('Session expiring soon, refreshing...');
        const { data, error } = await supabase.auth.refreshSession();
        
        if (error) {
          console.error('Error refreshing session:', error);
        } else {
          console.log('Session refreshed successfully');
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
      console.log('Refreshing user data...');
      
      // First try to refresh the session if needed
      const refreshedSession = await checkAndRefreshSession();
      
      // Get current user
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setSession(refreshedSession || session);
      
      return currentUser;
    } catch (error) {
      console.error('Error refreshing user:', error);
      return null;
    }
  };
  
  // Function to attempt to recover a broken session
  const recoverSession = async (): Promise<boolean> => {
    try {
      console.log('Attempting to recover session...');
      
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
          console.log('Recovered session from cookie');
          setSession(sessionData.session);
          setUser(sessionData.session.user);
          return true;
        }
        
        console.log('Session recovery failed');
        return false;
      }
      
      if (data?.session) {
        console.log('Session recovered via refresh');
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
      console.log('Forcing sign out...');
      
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
      
      console.log('Force sign out completed');
      
      return { success: true };
    } catch (error) {
      console.error('Error during force sign out:', error);
      return { success: false, error };
    }
  };

  // Handle sign out
  const handleSignOut = async () => {
    try {
      console.log('Signing out...');
      await supabaseSignOut();
      setUser(null);
      setSession(null);
      console.log('Sign out successful');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Effect to initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        setLoading(true);
        console.log('Initializing auth state...');
        
        // Get current user
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        
        // Get current session
        const currentSession = await getSession();
        setSession(currentSession);
        
        if (currentUser) {
          console.log('User authenticated:', currentUser.email);
          console.log('Session info:', {
            hasSession: !!currentSession,
            tokenExpiry: currentSession?.expires_at 
              ? new Date(currentSession.expires_at * 1000).toISOString() 
              : 'No expiry date',
            hasToken: !!currentSession?.access_token,
            tokenLength: currentSession?.access_token?.length
          });
          
          // If session expires soon (< 5 minutes), refresh it
          await checkAndRefreshSession();
        } else {
          console.log('No authenticated user found');
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        
        if (session?.user) {
          setUser(session.user);
          setSession(session);
          console.log('Session updated from auth state change');
        } else {
          setUser(null);
          setSession(null);
        }
        setLoading(false);
      }
    );
    
    // Set up a periodic session refresh check (every 5 minutes)
    const refreshInterval = setInterval(() => {
      if (user) {
        console.log('Periodic session refresh check');
        checkAndRefreshSession();
      }
    }, 5 * 60 * 1000);

    return () => {
      subscription.unsubscribe();
      clearInterval(refreshInterval);
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signOut: handleSignOut,
        refreshUser,
        forceSignOut,
        recoverSession,
        session
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 