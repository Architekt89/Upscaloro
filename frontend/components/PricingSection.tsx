'use client';

import { useState, useEffect, useCallback } from 'react';
import { Check } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
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
    id: "basic",
    name: "Free",
    monthlyPrice: "$0",
    description: "Great for getting started with basic image upscaling",
    buttonText: "Get Started",
    highlighted: false,
    features: [
      { text: "5 images per day", included: true },
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
      { text: "100 images per day", included: true },
      { text: "Premium upscaling quality", included: true },
      { text: "Maximum 4K output resolution", included: true },
      { text: "Email support", included: true },
      { text: "Fast processing speed", included: true },
      { text: "All AI models", included: true },
      { text: "Batch processing", included: true },
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
      { text: "Unlimited images", included: true },
      { text: "Highest upscaling quality", included: true },
      { text: "Maximum 8K output resolution", included: true },
      { text: "Dedicated support", included: true },
      { text: "Ultra-fast processing speed", included: true },
      { text: "All AI models plus beta access", included: true },
      { text: "Unlimited batch processing", included: true },
      { text: "Priority 24/7 support", included: true },
    ],
    monthlyPriceId: "price_1R1UWzBQ1z6vW0DwRDLKndlG",
    annualPriceId: "price_1R1UXlBQ1z6vW0DwMaBDmKaZ"
  },
];

export default function PricingSection() {
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  
  // Get auth context with refreshUser
  const { user, loading: authLoading, refreshUser, session } = useAuth();
  const [sessionChecked, setSessionChecked] = useState(false);
  const [userPlan, setUserPlan] = useState<string>("free"); // Default to free plan

  // Check session status on component mount
  useEffect(() => {
    if (!authLoading) {
      setSessionChecked(true);
      console.log("Auth state loaded, user:", user ? "authenticated" : "not authenticated");
      
      // If user is logged in, fetch their current plan
      if (user) {
        fetchUserPlan();
      }
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
      // TODO: Replace with actual API call to get user's plan
      // Example: const response = await fetch('/api/user/plan');
      // For now, simulate an API call with a delay
      setLoadingPlan("fetching");
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Hardcoded to "free" for now, but this would be replaced with actual API data
      setUserPlan("free");
    } catch (error) {
      console.error("Error fetching user plan:", error);
      // Default to free if there's an error
      setUserPlan("free");
      toast.error("Failed to load your current plan");
    } finally {
      setLoadingPlan(null);
    }
  }, [user]);

  const handleBillingToggle = (cycle: 'monthly' | 'annual') => {
    setBillingCycle(cycle);
  };

  const handlePlanSelect = async (plan: PricingPlan) => {
    if (!user) {
      // If user is not logged in, redirect to sign up
      router.push('/auth/signup');
      return;
    }

    // If the user already has this plan, show a message
    if (plan.id === userPlan) {
      toast.success("You're already on this plan!");
      return;
    }

    // Special case for enterprise plan
    if (plan.id === "enterprise") {
      // Enterprise plan requires contacting sales
      toast.success("Please contact our sales team to discuss enterprise options");
      // Could open chat, redirect to contact page, etc.
      return;
    }

    // Special case for downgrading to basic - this might require contacting support
    if (plan.id === "basic" && userPlan !== "basic") {
      toast.success("Please contact our support team to downgrade your plan");
      return;
    }

    try {
      setLoadingPlan(plan.id);
      
      // Determine billing cycle and price ID based on period
      const cycleType = billingCycle === 'annual' ? 'yearly' : 'monthly'; // Renamed variable to avoid conflict
      // Use the appropriate property based on billing cycle
      const priceId = cycleType === 'yearly' ? plan.annualPriceId : plan.monthlyPriceId;
      
      // Call the checkout API
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planId: plan.id,
          priceId,
          billingCycle: cycleType, // Use the renamed variable
          // Redirect back to pricing page with success parameter
          redirectTo: `${window.location.origin}/pricing?success=true&plan=${plan.id}`
        }),
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
    // If this plan is the user's current plan
    if (plan.id === userPlan) {
      return "Current Plan";
    }
    
    // Enterprise plan always shows "Contact Sales"
    if (plan.id === "enterprise") {
      return "Contact Sales";
    }
    
    // If user is on a higher tier and trying to go to free
    if (plan.id === "basic" && userPlan !== "basic") {
      return "Contact Support";
    }
    
    // Otherwise, show upgrade text
    return plan.id === "basic" ? "Start Free" : "Upgrade";
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

  return (
    <>
      <section className="relative bg-[#000000] overflow-hidden py-16 md:py-24">
        {/* Content container */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
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
                    disabled={loadingPlan === plan.id || !sessionChecked || (!!user && plan.id === userPlan)}
                    className={`
                      block w-full py-3 px-4 rounded-full text-center text-sm font-semibold transition-all duration-300
                      ${plan.highlighted 
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-[0_0_15px_rgba(249,115,22,0.3)] hover:shadow-[0_0_20px_rgba(249,115,22,0.5)] hover:from-orange-400 hover:to-orange-600 hover:scale-[1.03]' 
                        : 'border border-gray-400 text-white hover:bg-orange-500 hover:border-orange-500 hover:text-white hover:scale-[1.03]'
                      }
                      ${(loadingPlan === plan.id || !sessionChecked || (!!user && plan.id === userPlan)) ? 'opacity-75 cursor-not-allowed' : ''}
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
      
      {/* Add login prompt when needed */}
      {showLoginPrompt && <LoginPrompt />}
    </>
  );
} 