'use client';

import { useState, useEffect, useCallback } from 'react';
import { Check } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import { Switch } from '@/components/ui/switch';

interface PricingFeature {
  text: string;
  included: boolean;
}

interface PricingPlan {
  id: string;
  name: string;
  monthlyPrice: string;
  annualPrice?: string;
  description: string;
  buttonText: string;
  highlighted: boolean;
  features: PricingFeature[];
  monthlyPriceId?: string;  // Stripe price ID for monthly billing
  annualPriceId?: string;   // Stripe price ID for annual billing
}

const pricingPlans: PricingPlan[] = [
  {
    id: "free",
    name: "Free",
    monthlyPrice: "$0",
    annualPrice: "$0",
    description: "Great for getting started with basic image upscaling",
    buttonText: "Get Started",
    highlighted: false,
    features: [
      { text: "5 images per month", included: true },
      { text: "Basic upscaling", included: true },
      { text: "Maximum 2K output resolution", included: true },
      { text: "Community support", included: true },
      { text: "Standard processing speed", included: false },
      { text: "Advanced AI models", included: false },
      { text: "Batch processing", included: false },
      { text: "Priority support", included: false },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    monthlyPrice: "$15",
    annualPrice: "$144",
    description: "Perfect for professionals with advanced needs",
    buttonText: "Upgrade Now",
    highlighted: true,
    features: [
      { text: "400 images per month", included: true },
      { text: "Premium upscaling quality", included: true },
      { text: "Maximum 4K output resolution", included: true },
      { text: "Email support", included: true },
      { text: "Fast processing speed", included: true },
      { text: "All AI models", included: true },
      { text: "Batch processing (up to 10 images)", included: true },
      { text: "Priority support", included: false },
    ],
    monthlyPriceId: "price_1R1UVUBQ1z6vW0DwWfGtyIW0",
    annualPriceId: "price_1R1UWMBQ1z6vW0DwRkcoXWT7"
  },
  {
    id: "enterprise",
    name: "Enterprise",
    monthlyPrice: "$30",
    annualPrice: "$288",
    description: "For businesses with high-volume requirements",
    buttonText: "Upgrade to Enterprise",
    highlighted: false,
    features: [
      { text: "800 images per month", included: true },
      { text: "Highest upscaling quality", included: true },
      { text: "Maximum 16K output resolution", included: true },
      { text: "Email support", included: true },
      { text: "Ultra-fast processing speed", included: true },
      { text: "All AI models plus beta access", included: true },
      { text: "Batch processing", included: true },
      { text: "API access", included: true },
    ],
    monthlyPriceId: "price_1R1UWzBQ1z6vW0DwRDLKndlG",
    annualPriceId: "price_1R1UXlBQ1z6vW0DwMaBDmKaZ"
  },
];

export default function PricingSection() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  
  // Get auth context with refreshUser
  const { user, loading: authLoading, refreshUser, session } = useAuth();
  const [sessionChecked, setSessionChecked] = useState(false);
  const [userPlan, setUserPlan] = useState<string>("free"); // Default to free plan
  const [allowUnauthCheckout, setAllowUnauthCheckout] = useState(false);

  // Check session status on component mount
  useEffect(() => {
    if (!authLoading) {
      setSessionChecked(true);
      fetchUserPlan();
    }
  }, [authLoading, user]);
  
  // This function will be called when the component mounts and whenever user changes
  const fetchUserPlan = useCallback(async () => {
    if (!user) {
      setUserPlan("free");
      setLoadingPlan(null);
      return;
    }

    try {
      setLoadingPlan("fetching");
      
      // Method 1: Check user metadata first (fastest if available)
      if (user.user_metadata && user.user_metadata.subscription_tier) {
        console.log('Found subscription tier in user metadata:', user.user_metadata.subscription_tier);
        setUserPlan(user.user_metadata.subscription_tier.toLowerCase());
        setLoadingPlan(null);
        return;
      }
      
      // Method 2: Directly query Supabase users table
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      );
      
      console.log('Fetching subscription data from users table for user ID:', user.id);
      
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('subscription_tier')
        .eq('id', user.id)
        .single();
      
      if (userError) {
        console.error('Error fetching user data from Supabase:', userError);
        throw new Error('Failed to fetch user subscription data');
      }
      
      if (userData && userData.subscription_tier) {
        console.log('Found subscription data in users table:', userData);
        setUserPlan(userData.subscription_tier.toLowerCase());
        return;
      }
      
      // Method 3: Try backend API as fallback (legacy method)
      const backendUrl = "https://upscaloro.onrender.com";
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }
      
      const response = await fetch(`${backendUrl}/subscription/${user.id}`, {
        method: "GET",
        headers
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success' && data.data && data.data.subscription_tier) {
          setUserPlan(data.data.subscription_tier.toLowerCase());
          return;
        }
      }
      
      // Default to free if all methods fail
      console.log('No subscription data found, defaulting to free plan');
      setUserPlan("free");
    } catch (error) {
      console.error("Error fetching user plan:", error);
      // Default to free if there's an error
      setUserPlan("free");
      toast.error("Failed to load your current plan");
    } finally {
      setLoadingPlan(null);
    }
  }, [user, session]);

  // Check for success parameter in URL
  useEffect(() => {
    const success = searchParams.get('success');
    const plan = searchParams.get('plan');
    
    if (success === 'true' && plan) {
      toast.success(`Successfully upgraded to ${plan.charAt(0).toUpperCase() + plan.slice(1)} plan!`);
      
      // Clear the URL parameters
      router.replace('/pricing');
      
      // Refresh the user's plan
      fetchUserPlan();
    }
  }, [searchParams, router, fetchUserPlan]);

  const handleBillingToggle = (cycle: 'monthly' | 'annual') => {
    setBillingCycle(cycle);
  };

  const handlePlanSelect = async (plan: PricingPlan) => {
    // If user is not logged in and unauthenticated checkout is not allowed, redirect to sign up
    if (!user && !allowUnauthCheckout) {
      router.push('/auth/signin');
      return;
    }

    // Special handling for switching current plan to annual billing
    if (user && plan.id === userPlan && billingCycle === 'annual' && getButtonText(plan) === "Switch to annual billing") {
      try {
        setLoadingPlan(plan.id);
        
        // Use the annual price ID
        const priceId = plan.annualPriceId;
        
        // Prepare headers with Authorization token
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        
        if (user && session?.access_token) {
          headers["Authorization"] = `Bearer ${session.access_token}`;
        }
        
        // Call the backend to update the subscription to annual billing
        const backendUrl = "https://upscaloro.onrender.com";
        let response = await fetch(`${backendUrl}/billing/change-billing-cycle`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            price_id: priceId,
            billing_cycle: 'yearly',
            success_url: `${window.location.origin}/dashboard/billing?checkout_success=true&billing_changed=true`,
            cancel_url: `${window.location.origin}/pricing?checkout_canceled=true`
          })
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to change billing cycle");
        }

        const { url } = await response.json();
        
        // Redirect to Stripe Checkout or billing portal
        if (url) {
          window.location.href = url;
        } else {
          throw new Error("No URL returned for billing change");
        }
        return;
      } catch (error) {
        console.error("Error switching to annual billing:", error);
        toast.error(`Error: ${error instanceof Error ? error.message : "Failed to process your request"}`);
        setLoadingPlan(null);
        return;
      }
    }

    // If the user already has this plan, show a message
    if (user && plan.id === userPlan) {
      toast.success("You're already on this plan!");
      return;
    }

    // Handle downgrade scenarios
    if (user && (
      (userPlan === "enterprise" && (plan.id === "pro" || plan.id === "free")) ||
      (userPlan === "pro" && plan.id === "free")
    )) {
      toast.success("Please contact our support team to downgrade your plan");
      return;
    }

    // Handle cancellation (current plan is not free, and selected plan is free)
    if (user && plan.id === "free" && userPlan !== "free") {
      toast.success("Please contact our support team to cancel your subscription");
      return;
    }

    // Regular checkout process for new or upgraded plans
    try {
      setLoadingPlan(plan.id);
      
      // Determine billing cycle and price ID based on period
      const cycleType = billingCycle === 'annual' ? 'yearly' : 'monthly';
      // Use the appropriate property based on billing cycle
      const priceId = cycleType === 'yearly' ? plan.annualPriceId : plan.monthlyPriceId;
      
      // Prepare headers with Authorization token if user is logged in
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      
      // Add Authorization header with Bearer token if user is logged in
      if (user && session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
        console.log("Adding auth token to checkout request");
      } else {
        console.log("No auth token available for checkout request");
      }
      
      // Fix the URL construction
      const backendUrl = "https://upscaloro.onrender.com";
      let response = await fetch(`${backendUrl}/billing/create-checkout-session`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          plan_id: plan.id,
          price_id: priceId,
          billing_cycle: cycleType,
          success_url: `${window.location.origin}/dashboard/billing?checkout_success=true`,
          cancel_url: `${window.location.origin}/pricing?checkout_canceled=true`,
          skip_auth: !user && allowUnauthCheckout
        })
      });

      if (!response.ok) {
        const data = await response.json();
        console.error("Checkout error:", data);
        
        // If not authorized, prompt user to log in again
        if (response.status === 401) {
          toast.error(data.error || "Authentication failed. Please log in again.");
          setTimeout(() => {
            refreshUser();
          }, 2000);
          return;
        }
        
        throw new Error(data.error || "Failed to create checkout session");
      }

      const { url } = await response.json();
      
      // Redirect to Stripe Checkout
      if (url) {
        window.location.href = url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      console.error("Error handling plan selection:", error);
      toast.error(`Error: ${error instanceof Error ? error.message : "Failed to process your request"}`);
    } finally {
      setLoadingPlan(null);
    }
  };

  const getButtonText = (plan: PricingPlan) => {
    // If user is not logged in, show "Get Started" variants
    if (!user) {
      if (plan.id === "free") {
        return "Get Started for Free";
      } else {
        return "Get Started";
      }
    }
    
    // If this plan is the user's current plan
    if (plan.id === userPlan) {
      // If showing the current plan in a different billing cycle than what user has
      if (billingCycle === 'annual' && userPlan === plan.id) {
        return "Switch to annual billing";
      }
      return "Current Plan";
    }
    
    // If user is on a higher tier and trying to go to a lower tier
    if (
      (userPlan === "enterprise" && (plan.id === "pro" || plan.id === "free")) ||
      (userPlan === "pro" && plan.id === "free")
    ) {
      return "Downgrade";
    }
    
    // If user is on a lower tier and trying to go to a higher tier
    if (
      (userPlan === "free" && (plan.id === "pro" || plan.id === "enterprise")) ||
      (userPlan === "pro" && plan.id === "enterprise")
    ) {
      return "Upgrade";
    }
    
    // Default fallback
    return "Select Plan";
  };

  // Add login prompt component
  const LoginPrompt = () => (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
        <h3 className="text-xl font-bold mb-2">Session Expired</h3>
        <p className="text-gray-600 mb-4">
          Your session has expired or is invalid. Please sign in again to continue.
        </p>
        <div className="flex space-x-2">
          <button
            onClick={() => {
              router.push('/auth/login');
            }}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
          >
            Sign In
          </button>
          <button
            onClick={() => setShowLoginPrompt(false)}
            className="px-4 py-2 border border-gray-300 rounded"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  // Add a toggle for unauthenticated checkout in development mode
  const DevControls = () => {
    // Only show in development mode
    if (process.env.NODE_ENV !== 'development') return null;
    
    return (
      <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h2 className="text-lg font-semibold text-yellow-700 mb-2">Development Controls</h2>
        <div className="flex items-center mb-2">
          <input
            type="checkbox"
            id="allowUnauthCheckout"
            checked={allowUnauthCheckout}
            onChange={(e) => setAllowUnauthCheckout(e.target.checked)}
            className="mr-2 h-4 w-4"
          />
          <label htmlFor="allowUnauthCheckout" className="text-sm text-yellow-700">
            Allow checkout without authentication (Testing only)
          </label>
        </div>
        <div className="mt-3 flex flex-col space-y-2">
          <Link 
            href="/checkout-test" 
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            Go to Checkout Test Page →
          </Link>
          <Link 
            href="/token-test" 
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            Go to Token Test Page →
          </Link>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Show dev controls at the top if in development mode */}
      {process.env.NODE_ENV === 'development' && (
        <div className="container mx-auto px-4 pt-4">
          <DevControls />
        </div>
      )}
      
      {/* Show login prompt when needed */}
      {showLoginPrompt && <LoginPrompt />}
      
      <section className="relative bg-[#000000] overflow-hidden py-16 md:py-24">
        {/* Content container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
              <span className="bg-gradient-to-r from-orange-500 via-orange-400 to-white bg-clip-text text-transparent">
                Choose Your Plan
              </span>
            </h2>
            <p className="max-w-2xl mx-auto text-gray-300 text-lg md:text-xl mb-8">
              Select the perfect plan for your image upscaling needs
            </p>
            
            {/* Billing toggle */}
            <div className="flex justify-center mb-8">
              <div className="bg-gray-800/60 backdrop-blur-sm p-1 rounded-full inline-flex">
                <button
                  onClick={() => handleBillingToggle('monthly')}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    billingCycle === 'monthly'
                      ? 'bg-gray-700 text-white shadow-md'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Monthly billing
                </button>
                <button
                  onClick={() => handleBillingToggle('annual')}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    billingCycle === 'annual'
                      ? 'bg-gray-700 text-white shadow-md'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Yearly billing
                  <span className="ml-2 bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                    Save 20%
                  </span>
                </button>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <div 
                key={index}
                className={`
                  relative rounded-2xl p-6 md:p-8 bg-gray-900/60 backdrop-blur-sm border border-gray-800 
                  shadow-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl
                  ${plan.highlighted ? 'md:scale-105 md:-translate-y-2 z-10' : 'z-0'}
                  ${user && plan.id === userPlan ? 'ring-2 ring-orange-500' : ''}
                `}
              >
                {/* Current plan badge */}
                {user && plan.id === userPlan && (
                  <div className="absolute top-0 right-0 -mt-2 -mr-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                    Current Plan
                  </div>
                )}
                
                {/* Highlight border for Professional plan */}
                {plan.highlighted && (
                  <div className="absolute inset-0 rounded-2xl border-2 border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.5)] -z-10"></div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <div className="text-3xl md:text-4xl font-extrabold text-orange-500 mb-2">
                    {billingCycle === 'monthly' ? plan.monthlyPrice : plan.annualPrice}
                    <span className="text-lg font-normal text-gray-400">
                      {billingCycle === 'monthly' ? '/month' : '/year'}
                    </span>
                  </div>
                  {billingCycle === 'annual' && plan.monthlyPrice !== "$0" && (
                    <div className="text-sm text-gray-400 mb-2">
                      ${Math.round(parseInt(plan.annualPrice!.replace('$', '')) / 12)} per month, billed annually
                    </div>
                  )}
                  <p className="text-gray-400">{plan.description}</p>
                </div>
                
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <span className={`flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center ${feature.included ? 'text-orange-500' : 'text-gray-600'}`}>
                        <Check className="h-4 w-4" />
                      </span>
                      <span className={`ml-3 text-sm ${feature.included ? 'text-gray-300' : 'text-gray-500 line-through'}`}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
                
                <div className="mt-auto">
                  <button
                    onClick={() => handlePlanSelect(plan)}
                    disabled={loadingPlan === plan.id || !sessionChecked || 
                      (!!user && plan.id === userPlan && !(billingCycle === 'annual' && getButtonText(plan) === "Switch to annual billing"))}
                    className={`
                      block w-full py-3 px-4 rounded-full text-center text-sm font-semibold transition-all duration-300
                      ${plan.highlighted 
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-[0_0_15px_rgba(249,115,22,0.3)] hover:shadow-[0_0_20px_rgba(249,115,22,0.5)] hover:from-orange-400 hover:to-orange-600 hover:scale-[1.03]' 
                        : 'border border-gray-400 text-white hover:bg-orange-500 hover:border-orange-500 hover:text-white hover:scale-[1.03]'
                      }
                      ${(loadingPlan === plan.id || !sessionChecked || (!!user && plan.id === userPlan && !(billingCycle === 'annual' && getButtonText(plan) === "Switch to annual billing"))) ? 'opacity-75 cursor-not-allowed' : ''}
                    `}
                  >
                    {loadingPlan === plan.id ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </span>
                    ) : !sessionChecked ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Loading...
                      </span>
                    ) : (
                      getButtonText(plan)
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
} 