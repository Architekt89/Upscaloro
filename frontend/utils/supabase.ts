import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env file.');
}

// Determine if we're running on client or server
const isClient = typeof window !== 'undefined';

// Create the Supabase client with appropriate configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true, // Default is true, but let's explicitly set it
    autoRefreshToken: true,
    detectSessionInUrl: isClient, // Only detect session in URL on client side
    // Use cookies instead of localStorage for better security and server compatibility
    storageKey: 'sb-auth-token',
    storage: isClient
      ? {
          // In browser, use localStorage but with safeguards
          getItem: (key) => {
            try {
              return localStorage.getItem(key);
            } catch (error) {
              console.error('Error accessing localStorage:', error);
              return null;
            }
          },
          setItem: (key, value) => {
            try {
              localStorage.setItem(key, value);
              // Also set a cookie to help server-side calls 
              document.cookie = `sb-auth-token=${value};path=/;max-age=604800;SameSite=Lax`;
            } catch (error) {
              console.error('Error writing to localStorage:', error);
            }
          },
          removeItem: (key) => {
            try {
              localStorage.removeItem(key);
              // Also remove the cookie
              document.cookie = `sb-auth-token=;path=/;max-age=0;SameSite=Lax`;
            } catch (error) {
              console.error('Error removing from localStorage:', error);
            }
          }
        }
      : {
          // In server, use empty storage (will rely on cookie-based auth)
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {}
        }
  }
});

// A helper to verify if user is logged in on the client side
export const isUserLoggedIn = async () => {
  if (!isClient) return false;
  
  try {
    // First, check if we have a session in memory
    const { data: { session } } = await supabase.auth.getSession();
    if (session) return true;
    
    // If not, try to refresh the session
    const { error } = await supabase.auth.refreshSession();
    return !error;
  } catch (error) {
    console.error('Error checking user login status:', error);
    return false;
  }
};

// Authentication helper functions
export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (!error && data.session) {
    // On successful sign in, explicitly set the cookie for better server compatibility
    if (isClient) {
      const token = JSON.stringify(data.session);
      document.cookie = `sb-auth-token=${encodeURIComponent(token)};path=/;max-age=604800;SameSite=Lax`;
    }
  }
  
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  
  // Clear all auth cookies when signing out
  if (isClient) {
    document.cookie = `sb-auth-token=;path=/;max-age=0;SameSite=Lax`;
    document.cookie = `supabase-auth-token=;path=/;max-age=0;SameSite=Lax`;
  }
  
  return { error };
};

export const getCurrentUser = async () => {
  try {
    // First try to get the user from the current session
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) return session.user;
    
    // If no user from session, try getting user directly
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

export const getSession = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    // If we have a session, return it
    if (session) return session;
    
    // If not, try to refresh it
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        console.error('Error refreshing session:', error);
        return null;
      }
      return data.session;
    } catch (refreshError) {
      console.error('Exception refreshing session:', refreshError);
      return null;
    }
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}; 