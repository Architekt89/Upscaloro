'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { signIn, isUserLoggedIn } from '@/utils/supabase';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import Logo from '@/components/Logo';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { redirectIfAuthenticated, user, loading: authLoading } = useAuth();
  
  // Get redirect URL from query parameter
  const redirectPath = searchParams.get('redirect') || '/dashboard';

  // Check if the user is already logged in on mount
  useEffect(() => {
    const checkLoggedInStatus = async () => {
      try {
        // Skip if still loading auth
        if (authLoading) return;
        
        // Redirect if already authenticated
        if (user) {
          toast.success('You are already logged in');
          await redirectIfAuthenticated(redirectPath);
          return;
        }
        
        // Fallback check using isUserLoggedIn
        const loggedIn = await isUserLoggedIn();
        if (loggedIn) {
          toast.success('You are already logged in');
          window.location.href = redirectPath;
        }
      } catch (error) {
        console.error('Error checking login status:', error);
      } finally {
        setInitialCheckDone(true);
      }
    };

    checkLoggedInStatus();
  }, [user, authLoading, redirectPath, redirectIfAuthenticated]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Login attempt for:', email);
      const { data, error } = await signIn(email, password);

      if (error) {
        console.error('Login API error:', error);
        toast.error(error.message);
        return;
      }

      if (data.user) {
        console.log('Login successful, user ID:', data.user.id);
        console.log('Target redirect path:', redirectPath);
        toast.success('Logged in successfully!');
        
        // Try multiple redirect approaches to ensure it works
        try {
          // Wait a small delay to ensure auth state is updated
          console.log('Attempting to redirect after brief delay...');
          setTimeout(async () => {
            // First try the auth context helper
            console.log('Trying redirectIfAuthenticated method...');
            const redirected = await redirectIfAuthenticated(redirectPath);
            
            // If redirectIfAuthenticated didn't redirect, use fallbacks
            if (!redirected) {
              console.log('redirectIfAuthenticated failed, trying router.push...');
              try {
                // Try Next.js router
                router.push(redirectPath);
                
                // Set a small timeout and then use window.location for a hard redirect if necessary
                setTimeout(() => {
                  // If we're still on the login page after 300ms, try a hard redirect
                  if (window.location.pathname.includes('/auth/login')) {
                    console.log('Still on login page, trying window.location.href...');
                    window.location.href = redirectPath;
                  }
                }, 300);
              } catch (redirectError) {
                console.error('Router redirect failed, using window.location:', redirectError);
                window.location.href = redirectPath;
              }
            }
          }, 200);
        } catch (redirectError) {
          // Last resort fallback
          console.error('All redirect methods failed, using hardcoded redirect:', redirectError);
          window.location.href = redirectPath;
        }
      } else {
        console.warn('Login API returned success but no user data');
        toast.error('Login successful but user data not found');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Don't render the form until we've checked if the user is already logged in
  if (authLoading || !initialCheckDone) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-5">
          <Logo width={80} height={80} />
        </div>
        
        <h1 className="text-3xl font-bold text-center text-white mb-8">
          Sign in to your account
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors text-black"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors text-black"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-500" aria-hidden="true" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-500" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
          
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                'Sign in'
              )}
            </button>
          </div>
        </form>
        
        <div className="mt-8 relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-black text-gray-400">
              New to our platform?
            </span>
          </div>
        </div>
        
        <div className="mt-6">
          <Link
            href="/auth/signup"
            className="w-full flex justify-center py-3 px-4 border border-gray-700 rounded-lg shadow-sm text-base font-medium text-gray-300 bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
          >
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
} 