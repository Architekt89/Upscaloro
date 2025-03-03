'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, getCurrentUser, signOut as supabaseSignOut, getSession } from '@/utils/supabase';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  session: any | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
  refreshUser: async () => {},
  session: null
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Function to refresh the user data
  const refreshUser = async () => {
    try {
      console.log('Refreshing user data...');
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      
      const currentSession = await getSession();
      setSession(currentSession);
      
      if (currentUser) {
        console.log('User refreshed:', currentUser.email);
        console.log('Session info:', {
          hasSession: !!currentSession,
          tokenExpiry: currentSession?.expires_at 
            ? new Date(currentSession.expires_at * 1000).toISOString() 
            : 'No expiry date',
          hasToken: !!currentSession?.access_token,
          tokenLength: currentSession?.access_token?.length
        });
      } else {
        console.log('No user found during refresh');
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
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
        if (session?.user) {
          setUser(session.user);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signOut: handleSignOut,
        refreshUser,
        session
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 