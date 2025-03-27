'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Check } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import { Switch } from '@/components/ui/switch';
// Import Swiper components
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Keyboard, Navigation, EffectCoverflow } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/effect-coverflow';

// Custom styles for Swiper
const swiperStyles = `
  .swiper-pricing {
    padding: 60px 0;
    position: relative;
    overflow: visible;
    perspective: 1200px;
    width: 110%;
    margin-left: -5%;
  }
  
  /* Additional width for mobile */
  @media (max-width: 640px) {
    .swiper-pricing {
      width: 130%;
      margin-left: -15%;
    }
    
    .pricing-container {
      max-width: 130% !important;
      margin-left: -15% !important;
      margin-right: -15% !important;
    }
    
    .swiper-slide {
      transform: scale(0.7) translateZ(-150px) rotateY(15deg);
    }
    
    .swiper-slide-active {
      transform: scale(1) translateZ(0) rotateY(0deg) translateY(-10px);
    }

    .swiper-slide-prev {
      transform: scale(0.8) translateZ(-100px) rotateY(20deg);
    }
    
    .swiper-slide-next {
      transform: scale(0.8) translateZ(-100px) rotateY(-20deg);
    }
  }
  
  .swiper-pagination {
    position: relative;
    margin-top: 2.5rem;
  }
  
  .swiper-pagination-bullet {
    width: 10px;
    height: 10px;
    background: rgba(255, 255, 255, 0.2);
    opacity: 1;
    margin: 0 5px;
    transition: all 0.3s ease;
  }
  
  .swiper-pagination-bullet-active {
    background: #f97316 !important;
    transform: scale(1.3);
    box-shadow: 0 0 8px rgba(249, 115, 22, 0.6);
  }
  
  .swiper-slide {
    height: auto;
    transition: all 0.7s cubic-bezier(0.215, 0.61, 0.355, 1);
    opacity: 0.35;
    transform-origin: center;
    filter: blur(3px) brightness(0.65);
    transform: scale(0.75) translateZ(-120px) rotateY(12deg);
    pointer-events: none;
    touch-action: pan-y;
  }
  
  .swiper-slide-active {
    opacity: 1;
    filter: blur(0) brightness(1);
    transform: scale(1) translateZ(0) rotateY(0deg) translateY(-15px);
    z-index: 10;
    pointer-events: auto;
  }

  .swiper-slide-prev {
    filter: blur(2px) brightness(0.75);
    transform: scale(0.85) translateZ(-80px) rotateY(18deg);
    transform-origin: right center;
    z-index: 5;
    opacity: 0.6;
  }
  
  .swiper-slide-next {
    filter: blur(2px) brightness(0.75);
    transform: scale(0.85) translateZ(-80px) rotateY(-18deg);
    transform-origin: left center;
    z-index: 5;
    opacity: 0.6;
  }
  
  .swiper-slide-active .pricing-card {
    border-color: #f97316;
    box-shadow: 0 25px 50px rgba(249, 115, 22, 0.3), 0 0 20px rgba(249, 115, 22, 0.2);
    transform: translateY(0);
  }
  
  .pricing-card {
    height: 100%;
    display: flex;
    flex-direction: column;
    transition: all 0.6s cubic-bezier(0.215, 0.61, 0.355, 1);
    backface-visibility: hidden;
    transform-style: preserve-3d;
    background: linear-gradient(to bottom, rgba(31, 31, 35, 0.9), rgba(17, 17, 23, 0.9));
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    padding: 1.5rem;
    margin: 0 0.25rem;
  }
  
  /* Hide navigation arrows on mobile */
  @media (max-width: 640px) {
    .swiper-button-next,
    .swiper-button-prev {
      display: none !important;
    }
  }
  
  .swiper-button-next,
  .swiper-button-prev {
    color: #f97316;
    background: rgba(20, 20, 20, 0.7);
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    transform: translateZ(20px);
  }
  
  .swiper-button-next:hover,
  .swiper-button-prev:hover {
    background: rgba(249, 115, 22, 0.9);
    color: white;
    transform: scale(1.1) translateZ(20px);
  }
  
  .swiper-button-next:after,
  .swiper-button-prev:after {
    font-size: 18px;
    font-weight: bold;
  }
  
  .swiper-button-next {
    right: 10px;
  }
  
  .swiper-button-prev {
    left: 10px;
  }

  /* Add visual cue for swipe interaction on mobile */
  @media (max-width: 640px) {
    .swiper-slide-active::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 50px;
      margin-top: -25px;
      background: linear-gradient(90deg, rgba(249, 115, 22, 0.1) 0%, rgba(0, 0, 0, 0) 15%, rgba(0, 0, 0, 0) 85%, rgba(249, 115, 22, 0.1) 100%);
      border-radius: 25px;
      pointer-events: none;
      opacity: 0.5;
      animation: fadeInOut 2s infinite;
      z-index: 100;
    }
    
    @keyframes fadeInOut {
      0%, 100% { opacity: 0; }
      50% { opacity: 0.5; }
    }
  }

  /* Desktop styling to match the reference */
  @media (min-width: 1024px) {
    .pricing-card {
      background: #0F1218;
      border-radius: 1rem;
      border: 1px solid rgba(255, 255, 255, 0.1);
      padding: 2rem;
      height: 100%;
    }
    
    .pricing-card.highlighted {
      border: 2px solid #f97316;
      box-shadow: 0 0 20px rgba(249, 115, 22, 0.3);
      position: relative;
    }
    
    .pricing-card .plan-name {
      font-size: 1.75rem;
      font-weight: 700;
      margin-bottom: 0.75rem;
      text-align: center;
    }
    
    .pricing-card .plan-price {
      font-size: 2.5rem;
      font-weight: 800;
      color: #f97316;
      margin-bottom: 0.75rem;
      text-align: center;
    }
    
    .pricing-card .plan-price .period {
      font-size: 1rem;
      font-weight: normal;
      color: rgba(255, 255, 255, 0.6);
    }
    
    .pricing-card .plan-description {
      text-align: center;
      color: rgba(255, 255, 255, 0.7);
      margin-bottom: 1.5rem;
    }
    
    .pricing-card .feature-list {
      margin-bottom: 2rem;
    }
    
    .pricing-card .feature-item {
      display: flex;
      align-items: flex-start;
      margin-bottom: 1rem;
    }
    
    .pricing-card .feature-icon {
      color: #f97316;
      margin-right: 0.75rem;
      flex-shrink: 0;
    }
    
    .pricing-card .feature-text {
      color: rgba(255, 255, 255, 0.8);
    }
    
    .pricing-card .feature-text.disabled {
      color: rgba(255, 255, 255, 0.3);
      text-decoration: line-through;
    }
    
    .pricing-card .action-button {
      width: 100%;
      padding: 0.75rem;
      border-radius: 2rem;
      font-weight: 600;
      transition: all 0.2s ease;
      text-align: center;
    }
    
    .pricing-card.highlighted .action-button {
      background: linear-gradient(to right, #f97316, #fb923c);
      color: white;
    }
    
    .pricing-card:not(.highlighted) .action-button {
      background: transparent;
      border: 1px solid rgba(255, 255, 255, 0.3);
      color: white;
    }
    
    .pricing-card:not(.highlighted) .action-button:hover {
      background: rgba(249, 115, 22, 0.1);
      border-color: #f97316;
    }
    
    .pricing-container {
      background: #000000; 
    }
  }
`;

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
  // Add state for viewport detection
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(false);
  const swiperRef = useRef<SwiperType | null>(null);
  
  // Get auth context with refreshUser
  const { user, loading: authLoading, refreshUser, session } = useAuth();
  const [sessionChecked, setSessionChecked] = useState(false);
  const [userPlan, setUserPlan] = useState<string>("free");
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
        // Don't throw an error, just log it and continue to the next method
        // For new users, they might not exist in the database yet
        console.log('User might be new or database record not yet created, continuing to next method');
      } else if (userData && userData.subscription_tier) {
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
      
      try {
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
        } else {
          console.log(`Backend API returned status ${response.status}, defaulting to free plan`);
        }
      } catch (apiError) {
        console.error("Error calling backend API:", apiError);
        // Don't throw, just log and continue to default free plan
      }
      
      // Default to free if all methods fail
      console.log('No subscription data found, defaulting to free plan');
      setUserPlan("free");
    } catch (error) {
      console.error("Error fetching user plan:", error);
      // Default to free if there's an error
      setUserPlan("free");
      
      // Only show error toast for serious errors, not just when we can't find the user
      if (error instanceof TypeError && error.message.includes('fetch failed')) {
        // Network error - more serious
        toast.error("Network error: Failed to connect to the server");
      } else if (!(error instanceof Error) || !error.message.includes('fetch user subscription data')) {
        // Other serious errors, but not the expected "failed to fetch user subscription data" error
        toast.error("An unexpected error occurred. Please try again later.");
      } else {
        // Expected errors for new users, don't show toast
        console.log("Expected error for new user, not showing error toast");
      }
    } finally {
      setLoadingPlan(null);
    }
  }, [user, session]);

  // Check for success parameter in URL
  useEffect(() => {
    const success = searchParams.get('success');
    const plan = searchParams.get('plan');
    const checkoutSuccess = searchParams.get('checkout_success');
    const sessionId = searchParams.get('session_id');
    
    if (success === 'true' && plan) {
      toast.success(`Successfully upgraded to ${plan.charAt(0).toUpperCase() + plan.slice(1)} plan!`);
      
      // Clear the URL parameters
      router.replace('/pricing');
      
      // Refresh the user's plan
      fetchUserPlan();
    } else if (checkoutSuccess === 'true' || sessionId) {
      // Additional verification for Stripe checkout success
      if (user) {
        // Show immediate feedback
        toast.success("Processing your upgrade...");
        
        // First check if we have a session ID from the URL
        const verifySessionId = sessionId || searchParams.get('session_id');
        
        const verifyUpgrade = async () => {
          try {
            const backendUrl = "https://upscaloro.onrender.com";
            const headers: Record<string, string> = {
              "Content-Type": "application/json",
            };
            
            if (session?.access_token) {
              headers["Authorization"] = `Bearer ${session.access_token}`;
            }
            
            // Use the new session verification endpoint if we have a session ID
            if (verifySessionId) {
              console.log(`Verifying checkout session: ${verifySessionId}`);
              const sessionResponse = await fetch(`${backendUrl}/api/verify-checkout/${verifySessionId}`, {
                method: "GET",
                headers
              });
              
              if (sessionResponse.ok) {
                const sessionData = await sessionResponse.json();
                console.log("Session verification data:", sessionData);
                
                if (sessionData.payment_status === "paid" && sessionData.status === "complete") {
                  const planId = sessionData.plan_id;
                  
                  if (planId === "enterprise") {
                    toast.success("Successfully upgraded to Enterprise plan!");
                  } else if (planId === "pro") {
                    toast.success("Successfully upgraded to Pro plan!");
                  } else {
                    toast.success("Your subscription was updated successfully!");
                  }
                  
                  // Check if a force upgrade was applied
                  if (sessionData.upgrade_action === "forced_upgrade_to_enterprise") {
                    console.log("Force upgrade was applied:", sessionData.upgrade_result);
                  }
                  
                  // Refresh the user's plan data after confirmation
                  fetchUserPlan();
                  return;
                } else {
                  console.warn("Session verification shows incomplete payment:", sessionData);
                  toast.error("Your payment is being processed. It may take a moment to reflect in your account.");
                }
              } else {
                console.error("Error verifying session:", await sessionResponse.text());
              }
            }
            
            // Fallback to standard subscription check
            console.log("Using fallback subscription check");
            const response = await fetch(`${backendUrl}/api/subscription/check`, {
              method: "GET",
              headers,
            });
            
            if (response.ok) {
              const data = await response.json();
              
              // Check if the user has an Enterprise subscription
              if (data.is_enterprise) {
                toast.success("Successfully upgraded to Enterprise plan!");
              } else if (data.is_pro) {
                toast.success("Successfully upgraded to Pro plan!");
              } else {
                toast.success("Your subscription was updated!");
              }
              
              // Refresh the user's plan data
              fetchUserPlan();
            } else {
              // If verification fails, still try to refresh user data
              console.error("Error checking subscription status:", await response.text());
              fetchUserPlan();
            }
          } catch (error) {
            console.error("Error verifying subscription:", error);
            // If verification fails, still try to refresh user data
            fetchUserPlan();
          }
        };
        
        // Wait a short time for database updates to propagate
        setTimeout(verifyUpgrade, 2000); // Wait 2 seconds before checking
      }
      
      // Clear the URL parameters regardless
      router.replace('/pricing');
    }
  }, [searchParams, router, fetchUserPlan, user, session]);

  // Check viewport size on mount and resize
  useEffect(() => {
    const checkViewport = () => {
      setIsMobileOrTablet(window.innerWidth < 1024);
    };
    
    // Initial check
    checkViewport();
    
    // Add resize listener
    window.addEventListener('resize', checkViewport);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkViewport);
  }, []);

  // Initialize swiper when it's ready
  useEffect(() => {
    if (swiperRef.current) {
      // Ensure Pro plan starts in the center (slide index 0)
      swiperRef.current.slideToLoop(0, 0);
    }
  }, [swiperRef.current]);

  const handleBillingToggle = (cycle: 'monthly' | 'annual') => {
    setBillingCycle(cycle);
  };

  const handlePlanSelect = async (plan: PricingPlan) => {
    // If user is not logged in and we don't allow unauthenticated checkout, show login prompt
    if (!user && !allowUnauthCheckout) {
      setShowLoginPrompt(true);
      return;
    }

    // Special handling for Enterprise plan upgrades
    if (plan.id === "enterprise") {
      // Log extra details for enterprise upgrade tracking
      console.log("🔒 ENTERPRISE UPGRADE REQUEST:");
      console.log(`User ID: ${user?.id || 'anonymous'}`);
      console.log(`Current Plan: ${userPlan || 'none'}`);
      console.log(`Requested Plan: ${plan.id}`);
      console.log(`Billing Cycle: ${billingCycle}`);
      
      // If upgrading from Free or Pro, handle differently based on current plan
      if (userPlan === "free" || userPlan === "pro") {
        try {
          setLoadingPlan(plan.id);
          
          // Determine billing cycle and price ID based on period
          const cycleType = billingCycle === 'annual' ? 'yearly' : 'monthly';
          // Use the appropriate property based on billing cycle
          const priceId = cycleType === 'yearly' ? plan.annualPriceId : plan.monthlyPriceId;
          
          // Log the enterprise upgrade details
          console.log("🔒 ENTERPRISE UPGRADE DETAILS (Direct):");
          console.log(`Plan ID: ${plan.id}`);
          console.log(`Price ID: ${priceId}`);
          console.log(`Billing Cycle: ${cycleType}`);
          
          // For Enterprise upgrades, prefer using Stripe checkout directly
          // Skip the direct API update attempt which is causing issues
          console.log("Using Stripe checkout flow for Enterprise plan upgrade");
          await proceedWithCheckoutSession(plan, cycleType, priceId);
          return;
        } catch (error) {
          console.error("Error upgrading to Enterprise:", error);
          toast.error("Failed to upgrade to Enterprise plan. Please try again.");
          setLoadingPlan("");
        }
        return;
      }
    }

    // For non-Enterprise upgrades or when other conditions aren't met
    // Regular checkout process for new or upgraded plans
    try {
      setLoadingPlan(plan.id);
      
      // Determine billing cycle and price ID based on period
      const cycleType = billingCycle === 'annual' ? 'yearly' : 'monthly';
      // Use the appropriate property based on billing cycle
      const priceId = cycleType === 'yearly' ? plan.annualPriceId : plan.monthlyPriceId;
      
      // Log the upgrade details for debugging
      if (plan.id === "enterprise") {
        console.log("🔒 ENTERPRISE UPGRADE DETAILS:");
        console.log(`Plan ID: ${plan.id}`);
        console.log(`Price ID: ${priceId}`);
        console.log(`Billing Cycle: ${cycleType}`);
      }
      
      await proceedWithCheckoutSession(plan, cycleType, priceId);
    } catch (error) {
      console.error("Error processing plan selection:", error);
      toast.error("Failed to process plan selection. Please try again.");
      setLoadingPlan("");
    }
  };

  // Helper function to proceed with checkout session
  const proceedWithCheckoutSession = async (plan: PricingPlan, cycleType: string, priceId: string | undefined) => {
    if (!priceId) {
      console.error("No valid price ID found");
      toast.error("Error: Could not find a valid price for this plan.");
      setLoadingPlan("");
      return;
    }
    
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
      {/* Add custom swiper styles */}
      <style jsx global>{swiperStyles}</style>
      
      {/* Show dev controls at the top if in development mode */}
      {process.env.NODE_ENV === 'development' && (
        <div className="container mx-auto px-4 pt-4">
          <DevControls />
        </div>
      )}
      
      {/* Show login prompt when needed */}
      {showLoginPrompt && <LoginPrompt />}
      
      <section className="relative bg-[#000000] overflow-hidden py-16 md:py-24">
        {/* Background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[30%] -right-[25%] w-[60%] h-[60%] bg-gradient-to-br from-orange-500/20 to-purple-600/20 rounded-full blur-3xl opacity-30"></div>
          <div className="absolute -bottom-[30%] -left-[25%] w-[60%] h-[60%] bg-gradient-to-tr from-blue-500/20 to-purple-600/20 rounded-full blur-3xl opacity-30"></div>
        </div>
        
        {/* Content container */}
        <div className="pricing-container max-w-[110%] md:max-w-[110%] lg:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 -mx-[5%] md:mx-auto">
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
                  <span className="ml-2 bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full whitespace-nowrap">
                    Save 20%
                  </span>
                </button>
              </div>
            </div>
          </div>
          
          {/* Conditional rendering based on viewport size */}
          {isMobileOrTablet ? (
            // Mobile/Tablet Swiper layout
            <Swiper
              ref={swiperRef}
              modules={[Pagination, Keyboard, Navigation, EffectCoverflow]}
              effect="coverflow"
              coverflowEffect={{
                rotate: 15,
                stretch: 0,
                depth: 200,
                modifier: 2,
                slideShadows: false,
              }}
              spaceBetween={-20}
              slidesPerView={1.7}
              initialSlide={0}
              centeredSlides={true}
              grabCursor={true}
              keyboard={{ enabled: true }}
              navigation={{
                enabled: false,
              }}
              loop={true}
              loopAdditionalSlides={3}
              speed={800}
              touchRatio={1.5}
              shortSwipes={true}
              longSwipesRatio={0.2}
              pagination={{
                clickable: true,
                bulletActiveClass: 'swiper-pagination-bullet-active',
              }}
              breakpoints={{
                // Mobile (< 480px)
                0: {
                  slidesPerView: 1.9,
                  spaceBetween: -20,
                  touchRatio: 1.8,
                  coverflowEffect: {
                    rotate: 15,
                    stretch: 0,
                    depth: 200,
                    modifier: 2.2,
                  }
                },
                // When window width is >= 480px
                480: {
                  slidesPerView: 2.1,
                  spaceBetween: -10,
                  touchRatio: 1.2,
                  coverflowEffect: {
                    rotate: 12,
                    stretch: 0,
                    depth: 200,
                    modifier: 2,
                  }
                },
                // When window width is >= 640px
                640: {
                  slidesPerView: 2.2,
                  spaceBetween: 0,
                  touchRatio: 1,
                  navigation: {
                    enabled: false,
                  },
                  coverflowEffect: {
                    rotate: 10,
                    stretch: 0,
                    depth: 250,
                    modifier: 2.2,
                  }
                },
                // When window width is >= 768px
                768: {
                  slidesPerView: 2.5,
                  spaceBetween: 20,
                  touchRatio: 1,
                  navigation: {
                    enabled: false,
                  },
                  coverflowEffect: {
                    rotate: 8,
                    stretch: 10,
                    depth: 300,
                    modifier: 2.5,
                  }
                }
              }}
              className="mb-8 swiper-pricing"
              onSwiper={(swiper: SwiperType) => {
                // Store swiper instance for later use
                swiperRef.current = swiper;
              }}
            >
              {/* Reorder the plans to ensure Pro is in the middle, with correct order for infinite loop */}
              {[
                // Order: Pro (initially centered), Enterprise (next right), Free (next right/previous left)
                ...pricingPlans.filter(plan => plan.id === "pro"),
                ...pricingPlans.filter(plan => plan.id === "enterprise"),
                ...pricingPlans.filter(plan => plan.id === "free")
              ].map((plan, index) => {
                // Determine if this plan should be highlighted
                const isHighlighted = user 
                  ? plan.id === userPlan  // If user is logged in, highlight their current plan
                  : plan.id === "pro";    // If not logged in, highlight the Pro plan
                
                return (
                  <SwiperSlide key={plan.id}>
                    <div 
                      className={`
                        pricing-card relative rounded-2xl p-6 md:p-8 bg-gray-900/70 backdrop-blur-sm border border-gray-800 
                        shadow-xl transition-all duration-500
                        ${isHighlighted ? 'border-orange-500' : ''}
                        ${user && plan.id === userPlan ? 'ring-2 ring-orange-500' : ''}
                      `}
                    >
                      {/* Current plan badge */}
                      {user && plan.id === userPlan && (
                        <div className="absolute top-0 right-0 -mt-2 -mr-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                          Current Plan
                        </div>
                      )}
                      
                      {/* Recommended badge for Pro plan when not logged in */}
                      {!user && plan.id === "pro" && (
                        <div className="absolute top-0 right-0 -mt-2 -mr-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                          Recommended
                        </div>
                      )}
                      
                      {/* Highlight border for highlighted plan */}
                      {isHighlighted && (
                        <div className="absolute inset-0 rounded-2xl border-2 border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.5)] -z-10"></div>
                      )}
                      
                      <div className="text-center mb-8">
                        <h3 className="plan-name text-xl md:text-2xl font-bold text-white mb-2">{plan.name}</h3>
                        <div className="plan-price text-3xl md:text-4xl font-extrabold text-orange-500 mb-2">
                          {billingCycle === 'monthly' ? plan.monthlyPrice : plan.annualPrice}
                          <span className="period text-lg font-normal text-gray-400">
                            {billingCycle === 'monthly' ? '/month' : '/year'}
                          </span>
                        </div>
                        {billingCycle === 'annual' && plan.monthlyPrice !== "$0" && (
                          <div className="text-sm text-gray-400 mb-2">
                            ${Math.round(parseInt(plan.annualPrice!.replace('$', '')) / 12)} per month, billed annually
                          </div>
                        )}
                        <p className="plan-description text-gray-400">{plan.description}</p>
                      </div>
                      
                      <ul className="feature-list space-y-4 mb-8">
                        {plan.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="feature-item flex items-start">
                            <span className={`feature-icon flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center ${feature.included ? 'text-orange-500' : 'text-gray-600'}`}>
                              <Check className="h-4 w-4" />
                            </span>
                            <span className={`feature-text ml-3 text-sm ${feature.included ? 'text-gray-300' : 'text-gray-500 line-through disabled'}`}>
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
                            action-button block w-full py-3 px-4 rounded-full text-center text-sm font-semibold transition-all duration-300
                            ${isHighlighted 
                              ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-[0_0_15px_rgba(249,115,22,0.3)] hover:shadow-[0_0_20px_rgba(249,115,22,0.5)] hover:from-orange-400 hover:to-orange-600 hover:scale-[1.02]' 
                              : 'border border-gray-400 text-white hover:bg-orange-500 hover:border-orange-500 hover:text-white hover:scale-[1.02]'
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
                  </SwiperSlide>
                );
              })}
            </Swiper>
          ) : (
            // Desktop layout
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mx-auto max-w-6xl">
              {pricingPlans.map((plan, index) => {
                // Determine if this plan should be highlighted
                const isHighlighted = user 
                  ? plan.id === userPlan  // If user is logged in, highlight their current plan
                  : plan.id === "pro";    // If not logged in, highlight the Pro plan
                
                return (
                  <div 
                    key={index}
                    className={`
                      relative transition-all duration-500
                      ${isHighlighted ? 'lg:-translate-y-4 z-10' : 'z-0'}
                    `}
                  >
                    {/* Current plan badge */}
                    {user && plan.id === userPlan && (
                      <div className="absolute top-0 right-0 -mt-2 -mr-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full z-20">
                        Current Plan
                      </div>
                    )}
                    
                    {/* Recommended badge for Pro plan when not logged in */}
                    {!user && plan.id === "pro" && (
                      <div className="absolute top-0 right-0 -mt-2 -mr-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full z-20">
                        Recommended
                      </div>
                    )}
                    
                    {/* Highlight border for highlighted plan */}
                    {isHighlighted && (
                      <div className="absolute inset-0 rounded-2xl border-2 border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.5)] -z-10"></div>
                    )}
                    
                    <div className={`p-6 lg:p-8 bg-gray-900 border ${isHighlighted ? 'border-orange-500' : 'border-gray-800'} rounded-2xl h-full flex flex-col shadow-xl ${isHighlighted ? 'shadow-orange-500/10' : ''}`}>
                      <div className="text-center mb-8">
                        <h3 className="plan-name text-xl lg:text-2xl font-bold text-white mb-2">{plan.name}</h3>
                        <div className="plan-price text-3xl lg:text-4xl font-extrabold text-orange-500 mb-2">
                          {billingCycle === 'monthly' ? plan.monthlyPrice : plan.annualPrice}
                          <span className="period text-lg font-normal text-gray-400">
                            {billingCycle === 'monthly' ? '/month' : '/year'}
                          </span>
                        </div>
                        {billingCycle === 'annual' && plan.monthlyPrice !== "$0" && (
                          <div className="text-sm text-gray-400 mb-2">
                            ${Math.round(parseInt(plan.annualPrice!.replace('$', '')) / 12)} per month, billed annually
                          </div>
                        )}
                        <p className="plan-description text-gray-400">{plan.description}</p>
                      </div>
                      
                      <ul className="feature-list space-y-4 mb-8">
                        {plan.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="feature-item flex items-start">
                            <span className={`feature-icon flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center ${feature.included ? 'text-orange-500' : 'text-gray-600'}`}>
                              <Check className="h-4 w-4" />
                            </span>
                            <span className={`feature-text ml-3 text-sm ${feature.included ? 'text-gray-300' : 'text-gray-500 line-through disabled'}`}>
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
                            action-button block w-full py-3 px-4 rounded-full text-center text-sm font-semibold transition-all duration-300
                            ${isHighlighted 
                              ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-[0_0_15px_rgba(249,115,22,0.3)] hover:shadow-[0_0_20px_rgba(249,115,22,0.5)] hover:from-orange-400 hover:to-orange-600 hover:scale-[1.03]' 
                              : 'border border-gray-700 text-white hover:bg-gray-800 hover:border-gray-600 hover:text-white hover:scale-[1.02]'
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
                  </div>
                );
              })}
            </div>
          )}
          
          <div className="text-center mt-8 text-gray-400 text-sm">
            <p>All plans include 24/7 support. Pricing in USD.</p>
          </div>
        </div>
      </section>

      {/* Custom styles for Swiper pricing carousel */}
      <style jsx global>{`
        .swiper-pricing {
          overflow: visible;
          padding-bottom: 60px;
        }
        
        .swiper-pricing .swiper-pagination {
          bottom: 0;
        }
        
        .swiper-pricing .swiper-pagination-bullet {
          width: 10px;
          height: 10px;
          background: rgba(255, 255, 255, 0.2);
          opacity: 1;
          transition: all 0.3s;
        }
        
        .swiper-pricing .swiper-pagination-bullet-active {
          background: #f97316;
          transform: scale(1.3);
        }
        
        .swiper-pricing .swiper-slide {
          transition: all 0.6s ease;
        }
        
        .swiper-pricing .swiper-slide:not(.swiper-slide-active) {
          opacity: 0.6;
          transform: scale(0.85) translateY(30px) rotateY(-20deg);
        }
        
        /* Mobile-specific styles */
        @media (max-width: 640px) {
          .pricing-container {
            max-width: 130% !important;
            margin-left: -15% !important;
            margin-right: -15% !important;
          }
          
          .swiper-pricing .swiper-slide:not(.swiper-slide-active) {
            transform: scale(0.65) translateY(40px) rotateY(-25deg);
          }
          
          .swiper-pricing .swiper-navigation {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
} 