'use client';

import { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

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
}

const pricingPlans: PricingPlan[] = [
  {
    id: "basic",
    name: "Basic Plan",
    monthlyPrice: "$0",
    annualPrice: "$0",
    description: "Perfect for individuals and small projects",
    buttonText: "Get Started",
    highlighted: false,
    features: [
      { text: "10 images per month", included: true },
      { text: "Up to 2x upscaling", included: true },
      { text: "Basic image enhancement", included: true },
      { text: "Email support", included: true },
      { text: "Advanced AI models", included: false },
      { text: "Batch processing", included: false },
      { text: "API access", included: false },
    ]
  },
  {
    id: "pro",
    name: "Professional Plan",
    monthlyPrice: "$15",
    annualPrice: "$144", // $15 * 12 months * 0.8 (20% discount) = $144
    description: "Ideal for professionals and businesses",
    buttonText: "Get Started",
    highlighted: true,
    features: [
      { text: "Unlimited images", included: true },
      { text: "Up to 16x upscaling", included: true },
      { text: "Advanced image enhancement", included: true },
      { text: "Priority email support", included: true },
      { text: "All AI models", included: true },
      { text: "Batch processing", included: true },
      { text: "API access", included: false },
    ]
  },
  {
    id: "enterprise",
    name: "Enterprise Plan",
    monthlyPrice: "$30",
    annualPrice: "$288", // $30 * 12 months * 0.8 (20% discount) = $288
    description: "For teams and large-scale projects",
    buttonText: "Contact Sales",
    highlighted: false,
    features: [
      { text: "Unlimited images", included: true },
      { text: "Up to 16x upscaling", included: true },
      { text: "Advanced image enhancement", included: true },
      { text: "24/7 priority support", included: true },
      { text: "All AI models", included: true },
      { text: "Batch processing", included: true },
      { text: "API access", included: true },
    ]
  }
];

export default function PricingSection() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
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

  // Fetch the user's current plan
  const fetchUserPlan = async () => {
    try {
      // You can replace this with an actual API call to get the user's plan
      // For now, we'll assume they're on the free plan if logged in
      setUserPlan("free");
      
      // Example of how you might fetch the actual plan:
      // const response = await axios.get('/api/user/plan');
      // setUserPlan(response.data.plan);
    } catch (error) {
      console.error("Error fetching user plan:", error);
      // Default to free plan if there's an error
      setUserPlan("free");
    }
  };

  const handleBillingToggle = (cycle: 'monthly' | 'annual') => {
    setBillingCycle(cycle);
  };

  // Get the appropriate button text based on the plan and user's current plan
  const getButtonText = (plan: PricingPlan) => {
    if (!user) return plan.buttonText;
    
    if (plan.id === userPlan) {
      return "Current Plan";
    } else if (plan.id === "basic" && userPlan !== "basic") {
      return "Downgrade"; // If they're on a higher plan
    } else if (plan.id === "enterprise") {
      return "Contact Sales";
    } else {
      return "Upgrade"; // For higher plans than current
    }
  };

  const handlePlanSelect = async (plan: PricingPlan) => {
    // If this is the user's current plan, do nothing
    if (user && plan.id === userPlan) {
      toast.success("You are already on this plan");
      return;
    }

    if (plan.id === "basic") {
      // Basic plan doesn't require payment
      if (!user) {
        router.push("/auth/signup");
      } else {
        // If user is logged in and wants to downgrade to basic
        toast.success("Please contact support to downgrade your plan");
      }
      return;
    }

    if (plan.id === "enterprise") {
      // Enterprise plan redirects to contact page
      router.push("/contact");
      return;
    }

    // If user is not logged in, redirect to signup
    if (!user) {
      router.push(`/auth/signup?plan=${plan.id}&billing=${billingCycle}`);
      return;
    }

    // For paid plans, create a checkout session
    try {
      setLoadingPlan(plan.id);
      
      console.log('Creating checkout session for plan:', plan.id);
      
      // First check auth status to ensure we have a valid session
      const authCheckResponse = await fetch('/api/auth-debug');
      const authData = await authCheckResponse.json();
      console.log('Auth status:', authData);
      
      if (!authData.authenticated || !authData.sessionExists) {
        toast.error("Your session has expired. Please log in again.");
        setTimeout(() => {
          router.push('/auth/login');
        }, 2000);
        return;
      }
      
      // Check configuration
      try {
        const configResponse = await fetch('/api/config-debug');
        const configData = await configResponse.json();
        console.log('Config status:', configData);
        
        if (!configData.config.hasBackendUrl && !configData.config.hasApiUrl) {
          toast.error("The backend service is not properly configured. Please contact support.");
          return;
        }
      } catch (configError) {
        console.error('Error checking configuration:', configError);
      }
      
      // Call the checkout API endpoint
      const response = await axios.post('/api/checkout', {
        planId: plan.id,
      });
      
      console.log('Checkout response:', response.data);
      
      // Redirect to Stripe checkout
      if (response.data && response.data.url) {
        console.log('Redirecting to:', response.data.url);
        window.location.href = response.data.url;
      } else {
        console.error('Invalid checkout response:', response.data);
        toast.error('Failed to create checkout session');
      }
    } catch (error: any) {
      console.error('Error creating checkout session:', error);
      
      let errorMessage = 'An error occurred while processing your request';
      let needsReauth = false;
      let isBackendIssue = false;
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        
        if (error.response.status === 401) {
          errorMessage = 'Your session has expired. Please sign in again.';
          needsReauth = true;
        } else if (error.response.status === 500 && error.response.data?.details === "No backend URL configured") {
          errorMessage = 'The backend service is not properly configured. Please contact support.';
          isBackendIssue = true;
        } else if (error.response.data?.details) {
          errorMessage = `Error: ${error.response.data.details}`;
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received from server');
        errorMessage = 'Could not connect to the backend service. Please try again later or contact support.';
        isBackendIssue = true;
      }
      
      toast.error(errorMessage);
      
      // If authentication error, prompt user to log in again
      if (needsReauth) {
        toast.error('Redirecting to login page...');
        setTimeout(() => {
          // Force a sign out to clear any invalid tokens
          try {
            fetch('/api/logout', { method: 'POST' });
          } catch (e) {
            console.error('Error during logout:', e);
          }
          router.push('/auth/login');
        }, 2000);
      } else if (isBackendIssue) {
        // Create an issue report if it's a backend issue
        toast.error('This appears to be a backend connectivity issue. Our team has been notified.');
      }
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
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
  );
} 