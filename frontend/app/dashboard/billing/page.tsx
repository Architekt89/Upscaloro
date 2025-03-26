'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { CreditCard, Package, BarChart, Receipt, AlertCircle, CheckCircle, ChevronRight, PlusCircle, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { 
  getBillingInfo, 
  updateSubscription, 
  cancelSubscription, 
  addPaymentMethod, 
  deletePaymentMethod, 
  setDefaultPaymentMethod,
  mockBillingData,
  getBillingHistory
} from '@/utils/billing';
import BackendDebug from './debug';
import axios from 'axios';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

// Mock data for demonstration
const mockSubscriptionData = {
  plan: 'Pro',
  status: 'active',
  renewalDate: '2023-12-01',
  price: '$9.99',
  billingCycle: 'monthly',
  features: [
    'Unlimited images',
    'Up to 16x upscaling',
    'All upscaling modes',
    'API access',
    'Priority support',
  ]
};

const mockPaymentMethods = [
  {
    id: 'pm_1',
    type: 'card',
    brand: 'visa',
    last4: '4242',
    expMonth: 12,
    expYear: 2024,
    isDefault: true,
  }
];

const mockBillingHistory = [
  {
    id: 'in_1',
    date: '2023-11-01',
    amount: '$9.99',
    status: 'paid',
    description: 'Pro Plan - Monthly',
    downloadUrl: '#',
  },
  {
    id: 'in_2',
    date: '2023-10-01',
    amount: '$9.99',
    status: 'paid',
    description: 'Pro Plan - Monthly',
    downloadUrl: '#',
  },
  {
    id: 'in_3',
    date: '2023-09-01',
    amount: '$9.99',
    status: 'paid',
    description: 'Pro Plan - Monthly',
    downloadUrl: '#',
  },
];

export default function BillingPage() {
  const { user, session, refreshUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const checkoutSuccess = searchParams.get('checkout_success');
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState(mockSubscriptionData);
  const [paymentMethods, setPaymentMethods] = useState(mockPaymentMethods);
  const [billingHistory, setBillingHistory] = useState(mockBillingHistory);
  const [loadingBillingHistory, setLoadingBillingHistory] = useState(false);
  const [billingHistoryError, setBillingHistoryError] = useState(false);
  const [showAddPaymentMethod, setShowAddPaymentMethod] = useState(false);
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiry: '',
    cvc: ''
  });
  const [backendError, setBackendError] = useState(false);
  const [usingMockData, setUsingMockData] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [statusMessage, setStatusMessage] = useState({
    type: "success",
    message: ""
  });
  const dataFetchedRef = useRef(false);

  // Define fetchBillingHistory as a callback to avoid lint errors
  const fetchBillingHistory = useCallback(async () => {
    // Only attempt to fetch billing history if user is logged in and the page is loaded
    if (user && !loading && subscription.plan.toLowerCase() !== 'free') {
      try {
        setLoadingBillingHistory(true);
        setBillingHistoryError(false);
        
        // Try to get real billing history
        const historyData = await getBillingHistory();
        if (historyData && Array.isArray(historyData) && historyData.length > 0) {
          console.log('Using real billing history data', historyData);
          setBillingHistory(historyData);
          setBillingHistoryError(false);
        } else {
          console.log('No real billing history data available or empty array was returned');
          // Only keep existing mock data if we have any
          if (billingHistory.length === 0) {
            // If no billing history exists at all, set a simple mock record for UX
            setBillingHistory([
              {
                id: 'current',
                date: new Date().toISOString().split('T')[0],
                amount: subscription.price,
                status: 'paid',
                description: `${subscription.plan} Plan - ${subscription.billingCycle}`,
                downloadUrl: '#',
              }
            ]);
          }
          // Only set error if we have no data at all
          setBillingHistoryError(billingHistory.length === 0);
        }
      } catch (error) {
        console.error('Error fetching billing history:', error);
        setBillingHistoryError(true);
        // Keep using the existing billing history data - don't reset it
      } finally {
        setLoadingBillingHistory(false);
      }
    }
  }, [user, loading, subscription, billingHistory, setBillingHistory, setLoadingBillingHistory, setBillingHistoryError]);

  // Add a function to retry fetching billing history after a delay
  const retryFetchBillingHistory = useCallback(() => {
    if (user && !loading && subscription.plan.toLowerCase() !== 'free' && billingHistoryError) {
      console.log('Retrying billing history fetch after delay');
      setTimeout(() => {
        fetchBillingHistory();
      }, 3000); // 3 second delay
    }
  }, [user, loading, subscription, billingHistoryError, fetchBillingHistory]);

  // Check if user is logged in
  useEffect(() => {
    let successMessageTimer: NodeJS.Timeout | null = null;
    let refreshCompleted = false;
    
    if (!user && !authLoading) {
      router.push('/auth/login');
      return;
    }

    // Only proceed with fetching data if we have a user and haven't fetched data yet
    if (user && !dataFetchedRef.current) {
      dataFetchedRef.current = true;
      // Check for checkout success parameter
      if (checkoutSuccess === 'true' && !refreshCompleted) {
        setShowSuccessMessage(true);
        
        // Force refresh user data after successful checkout
        const refreshAfterPayment = async () => {
          try {
            await refreshUser(); // This will update the user data from Supabase
            toast.success('Subscription data refreshed successfully');
            refreshCompleted = true;
            
            // Clear checkout_success parameter from URL without full page reload
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.delete('checkout_success');
            window.history.replaceState({}, '', newUrl.toString());
            
            // If subscriptions table is empty but payment was successful, try manual upgrade
            const manualUpgrade = async () => {
              console.log("Manual upgrade functionality is disabled");
            };
            
            // If user doesn't have subscription tier in metadata, we no longer try manual upgrade
            // if (!user.user_metadata?.subscription_tier || user.user_metadata?.subscription_tier === 'free') {
            //   manualUpgrade();
            // }
          } catch (error) {
            console.error('Error refreshing user data after payment:', error);
            toast.error('Failed to refresh subscription data');
          }
        };
        
        refreshAfterPayment();
        
        // Hide the success message after 5 seconds
        successMessageTimer = setTimeout(() => {
          setShowSuccessMessage(false);
        }, 5000);
      }

      // Fetch billing data
      const fetchBillingData = async () => {
        try {
          setLoading(true);
          setBackendError(false);
          setUsingMockData(false);
          
          // Check for user metadata first (fastest if available)
          if (user?.user_metadata?.subscription_tier) {
            console.log('Found subscription tier in user metadata:', user.user_metadata);
            
            // Create subscription object from user metadata
            const userMetadata = user.user_metadata;
            const realSubscription = {
              plan: userMetadata.subscription_tier || 'Free',
              status: userMetadata.subscription_status || 'active',
              renewalDate: userMetadata.subscription_current_period_end 
                ? new Date(userMetadata.subscription_current_period_end).toISOString()
                : new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              price: userMetadata.subscription_tier === 'pro' ? '$15.00' : '$0.00',
              billingCycle: userMetadata.subscription_billing_cycle || 'monthly',
              features: userMetadata.subscription_tier === 'pro' 
                ? [
                    "Unlimited images",
                    "Up to 16x upscaling",
                    "All upscaling modes",
                    "Batch image processing",
                    "API access",
                    "Priority support"
                  ]
                : [
                    "Up to 3 images per month",
                    "2x and 4x upscaling",
                    "Basic upscaling mode",
                    "Standard support"
                  ]
            };
            
            setSubscription(realSubscription);
            
            // If we have real subscription data, but no other billing data,
            // we'll still use mock data for the rest
            setPaymentMethods(mockPaymentMethods);
            setBillingHistory(mockBillingHistory);
            
            // Using real subscription data with mock billing info, 
            // so don't show the "Using Demo Data" banner
            setUsingMockData(false);
            setBackendError(false);
            return;
          }
          
          // Fetch user subscription data directly from public.users table
          try {
            const { createClient } = await import('@supabase/supabase-js');
            const supabase = createClient(
              process.env.NEXT_PUBLIC_SUPABASE_URL || '',
              process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
            );
            
            console.log('Fetching subscription data from users table for user ID:', user.id);
            
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('*')
              .eq('id', user.id)
              .single();
            
            if (userError) {
              console.error('Error fetching user data from Supabase:', userError);
              throw new Error('Failed to fetch user subscription data');
            }
            
            if (userData && userData.subscription_tier) {
              console.log('Found subscription data in users table:', userData);
              
              // Create subscription object from database data
              const realSubscription = {
                plan: userData.subscription_tier || 'Free',
                status: userData.subscription_status || 'active',
                renewalDate: userData.subscription_current_period_end 
                  ? new Date(userData.subscription_current_period_end).toISOString()
                  : new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                price: userData.subscription_tier === 'pro' ? '$15.00' : '$0.00',
                billingCycle: 'monthly',
                features: userData.subscription_tier === 'pro' 
                  ? [
                      "Unlimited images",
                      "Up to 16x upscaling",
                      "All upscaling modes",
                      "Batch image processing",
                      "API access",
                      "Priority support"
                    ]
                  : [
                      "Up to 3 images per month",
                      "2x and 4x upscaling",
                      "Basic upscaling mode",
                      "Standard support"
                    ]
              };
              
              setSubscription(realSubscription);
              setPaymentMethods(mockPaymentMethods);
              setBillingHistory(mockBillingHistory);
              
              // Using real subscription data with mock billing info, 
              // so don't show the "Using Demo Data" banner
              setUsingMockData(false);
              setBackendError(false);
              return;
            }
          } catch (dbError) {
            console.error('Error accessing Supabase directly:', dbError);
            // Continue to next fallback method
          }
          
          // Fetch real subscription data from the API with timeout and retry
          try {
            const fetchWithTimeout = async (url: string, options: any, timeout = 10000): Promise<any> => {
              const controller = new AbortController();
              const id = setTimeout(() => controller.abort(), timeout);
              
              try {
                const response = await fetch(url, {
                  ...options,
                  signal: controller.signal
                });
                clearTimeout(id);
                return response;
              } catch (error) {
                clearTimeout(id);
                throw error;
              }
            };
            
            const retryFetch = async (url: string, options: any, retries = 2): Promise<Response> => {
              try {
                return await fetchWithTimeout(url, options);
              } catch (err) {
                if (retries <= 0) throw err;
                
                // Wait before retrying
                await new Promise(resolve => setTimeout(resolve, 1000));
                console.log(`Retrying fetch, ${retries} attempts left`);
                return retryFetch(url, options, retries - 1);
              }
            };
            
            const subscriptionResponse = await retryFetch(`https://upscaloro.onrender.com/subscription/${user.id}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session?.access_token || ''}`
              }
            });
            
            if (subscriptionResponse.ok) {
              const subscriptionData = await subscriptionResponse.json();
              
              if (subscriptionData.status === 'success') {
                // Create subscription object from real data
                const realSubscription = {
                  plan: subscriptionData.data.subscription_tier || 'Free',
                  status: subscriptionData.data.subscription_status || 'active',
                  renewalDate: subscriptionData.data.current_period_end 
                    ? new Date(subscriptionData.data.current_period_end).toISOString()
                    : new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(), // Default to 30 days from now
                  price: subscriptionData.data.subscription_tier === 'pro' ? '$15.00' : '$0.00',
                  billingCycle: 'monthly',
                  features: subscriptionData.data.subscription_tier === 'pro' 
                    ? [
                        "Unlimited images",
                        "Up to 16x upscaling",
                        "All upscaling modes",
                        "Batch image processing",
                        "API access",
                        "Priority support"
                      ]
                    : [
                        "Up to 3 images per month",
                        "2x and 4x upscaling",
                        "Basic upscaling mode",
                        "Standard support"
                      ]
                };
                
                setSubscription(realSubscription);
                
                // If we have real subscription data, but no other billing data,
                // we'll still use mock data for the rest
                setPaymentMethods(mockPaymentMethods);
                setBillingHistory(mockBillingHistory);
                
                // We're using partial real data
                setUsingMockData(true);
              } else {
                throw new Error(subscriptionData.message || 'Failed to fetch subscription data');
              }
            } else {
              throw new Error(`Failed to fetch subscription data: ${subscriptionResponse.statusText}`);
            }
          } catch (subscriptionError) {
            console.error('Error fetching subscription data:', subscriptionError);
            
            // Fall back to fetching billing data from the billing endpoint
            const billingData = await getBillingInfo();
            
            if (billingData) {
              setSubscription(billingData.subscription || mockSubscriptionData);
              setPaymentMethods(billingData.payment_methods || mockPaymentMethods);
              setBillingHistory(billingData.invoices || mockBillingHistory);
              
              // Check if we're using mock data (this happens when the backend doesn't have billing endpoints)
              if (billingData === mockBillingData) {
                setUsingMockData(true);
              }
            }
          }
        } catch (error: any) {
          console.error('Error fetching billing data:', error);
          
          // Set backend error flag
          if (error.message === 'Network Error' || 
              error.message === 'Failed to fetch' ||
              (axios.isAxiosError(error) && error.response?.status === 404)) {
            setBackendError(true);
            
            // Special handling for render.com resource limitations
            if (error.message === 'Failed to fetch' || 
                (error.message && error.message.includes('ERR_INSUFFICIENT_RESOURCES'))) {
              
              toast.error('The server is experiencing resource limitations. Using local data instead.');
              
              // If the user has already completed checkout, use pro plan for display
              if (checkoutSuccess === 'true' && user) {
                const proSubscription = {
                  plan: 'Pro',
                  status: 'active',
                  renewalDate: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                  price: '$15.00',
                  billingCycle: 'monthly',
                  features: [
                    'Unlimited images',
                    'Up to 16x upscaling',
                    'All upscaling modes',
                    'API access',
                    'Priority support',
                  ]
                };
                
                setSubscription(proSubscription);
                setPaymentMethods(mockPaymentMethods);
                setBillingHistory(mockBillingHistory);
                setUsingMockData(true);
                
                // Show a special message about the situation
                toast('Your payment was successful! The updated subscription will be available once the server recovers.', 
                  { icon: '👍', duration: 6000 });
              } else {
                toast.error('Cannot connect to the backend server. Using mock data instead.');
              }
            } else {
              toast.error('Cannot connect to the backend server. Using mock data instead.');
            }
          } else if (error.message === 'Authentication required') {
            toast.error('Your session has expired. Please log in again.');
            router.push('/auth/login');
            return;
          } else if (axios.isAxiosError(error) && error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            if (error.response.status === 401) {
              toast.error('Authentication error. Please log in again.');
              router.push('/auth/login');
              return;
            } else if (error.response.status === 403) {
              toast.error('You do not have permission to access billing information.');
            } else if (error.response.status === 404) {
              toast.error('Billing information not found.');
            } else {
              toast.error(`Server error: ${error.response.data?.detail || 'Failed to load billing data'}`);
            }
          } else if (axios.isAxiosError(error) && error.request) {
            // The request was made but no response was received
            toast.error('No response from server. Please check your connection.');
          } else {
            // Something happened in setting up the request that triggered an Error
            toast.error(`Error: ${error.message || 'Failed to load billing data'}`);
          }
          
          // Fall back to mock data
        } finally {
          setLoading(false);
        }
      };

      if (user) {
        fetchBillingData();
      }
    }
    
    // Cleanup function
    return () => {
      if (successMessageTimer) {
        clearTimeout(successMessageTimer);
      }
      // Clear all toasts when component unmounts to prevent duplicates
      toast.dismiss();
    };
  }, [user, router, session, checkoutSuccess, refreshUser, authLoading]);

  // Add a separate useEffect for billing history to allow it to be refreshed independently
  useEffect(() => {
    const BILLING_HISTORY_COOLDOWN = 60000; // 1 minute cooldown
    const lastFetchTimeRef = useRef(0);
    const now = Date.now();
    
    if (user && !loading && subscription.plan.toLowerCase() !== 'free') {
      // Check if we're within the cooldown period
      if (now - lastFetchTimeRef.current < BILLING_HISTORY_COOLDOWN) {
        console.log('Billing history fetch on cooldown, skipping request');
        return;
      }
      
      lastFetchTimeRef.current = now;
      fetchBillingHistory();
    }
  }, [user, loading, subscription.plan, fetchBillingHistory]);

  // Add an effect to retry fetching billing history if it failed
  useEffect(() => {
    if (billingHistoryError) {
      retryFetchBillingHistory();
    }
  }, [billingHistoryError, retryFetchBillingHistory]);

  // Refresh user data after subscription change is detected
  useEffect(() => {
    // If the URL contains success=true, refresh the user data
    if (typeof window !== "undefined" && window.location.search.includes("success=true")) {
      // Add a message to show that payment was processed
      setStatusMessage({
        type: "success",
        message: "Your payment was processed successfully! Refreshing data..."
      });
      
      // Clear the URL parameters to avoid repeated refreshes
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
      
      // Force a refresh after a short delay
      setTimeout(() => {
        setStatusMessage({
          type: "success",
          message: "Manual upgrade successful. Refreshing data..."
        });
        
        // Simply reload the page to ensure we get fresh data
        window.location.reload();
      }, 3000);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleUpgrade = async () => {
    try {
      const result = await updateSubscription('pro');
      if (result.success) {
        toast.success(result.message || 'Subscription upgraded successfully');
        // Refresh billing data
        const billingData = await getBillingInfo();
        if (billingData) {
          setSubscription(billingData.subscription || mockSubscriptionData);
        }
      }
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      toast.error('Failed to upgrade subscription');
    }
  };

  const handleUpgradeToEnterprise = async () => {
    try {
      const result = await updateSubscription('enterprise');
      if (result.success) {
        toast.success(result.message || 'Subscription upgraded to Enterprise successfully');
        // Refresh billing data
        const billingData = await getBillingInfo();
        if (billingData) {
          setSubscription(billingData.subscription || mockSubscriptionData);
        }
      }
    } catch (error) {
      console.error('Error upgrading to Enterprise subscription:', error);
      toast.error('Failed to upgrade to Enterprise subscription');
    }
  };

  const handleCancel = async () => {
    try {
      const result = await cancelSubscription();
      if (result.success) {
        toast.success(result.message || 'Subscription cancelled successfully');
        // Refresh billing data
        const billingData = await getBillingInfo();
        if (billingData) {
          setSubscription(billingData.subscription || mockSubscriptionData);
        }
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast.error('Failed to cancel subscription');
    }
  };

  const handleAddPaymentMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Parse expiry into month and year
      const [expMonth, expYear] = formData.expiry.split('/').map(part => parseInt(part.trim()));
      
      const paymentDetails = {
        card_number: formData.cardNumber.replace(/\s/g, ''),
        exp_month: expMonth,
        exp_year: expYear > 2000 ? expYear : 2000 + expYear, // Convert 2-digit year to 4-digit
        cvc: formData.cvc
      };
      
      const result = await addPaymentMethod(paymentDetails);
      if (result.success) {
        toast.success(result.message || 'Payment method added successfully');
        setShowAddPaymentMethod(false);
        
        // Reset form
        setFormData({
          cardNumber: '',
          expiry: '',
          cvc: ''
        });
        
        // Refresh payment methods
        const billingData = await getBillingInfo();
        if (billingData) {
          setPaymentMethods(billingData.payment_methods || mockPaymentMethods);
        }
      }
    } catch (error) {
      console.error('Error adding payment method:', error);
      toast.error('Failed to add payment method');
    }
  };

  const handleSetDefaultPaymentMethod = async (id: string) => {
    try {
      const result = await setDefaultPaymentMethod(id);
      if (result.success) {
        toast.success(result.message || 'Default payment method updated');
        
        // Refresh payment methods
        const billingData = await getBillingInfo();
        if (billingData) {
          setPaymentMethods(billingData.payment_methods || mockPaymentMethods);
        }
      }
    } catch (error) {
      console.error('Error setting default payment method:', error);
      toast.error('Failed to update default payment method');
    }
  };

  const handleDeletePaymentMethod = async (id: string) => {
    try {
      const result = await deletePaymentMethod(id);
      if (result.success) {
        toast.success(result.message || 'Payment method deleted');
        
        // Refresh payment methods
        const billingData = await getBillingInfo();
        if (billingData) {
          setPaymentMethods(billingData.payment_methods || mockPaymentMethods);
        }
      }
    } catch (error) {
      console.error('Error deleting payment method:', error);
      toast.error('Failed to delete payment method');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div data-testid="loading-spinner" className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Billing &amp; Subscription</h1>
        <Link 
          href="/dashboard" 
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-orange-500 bg-transparent border border-orange-500 rounded-md hover:bg-orange-500 hover:text-white transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>
      
      {/* Success message after checkout */}
      {showSuccessMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6" role="alert">
          <strong className="font-bold">Success! </strong>
          <span className="block sm:inline">Your payment was processed successfully! Your subscription has been updated.</span>
        </div>
      )}
      
      {/* Resource Limitations Warning */}
      {checkoutSuccess === 'true' && backendError && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded relative mb-6" role="alert">
          <strong className="font-bold">Server Resource Limitation: </strong>
          <span className="block sm:inline">
            Your payment was successful, but our server on Render.com is experiencing resource limitations. 
            Your subscription may not update immediately. Please contact support if your subscription doesn't update within 24 hours.
          </span>
        </div>
      )}
      
      {/* Debug information */}
      {(process.env.NODE_ENV === 'development' || searchParams.get('debug') === 'true') && user && (
        <div className="bg-gray-100 border border-gray-400 text-gray-700 px-4 py-3 rounded relative mb-6 overflow-auto max-h-96">
          <strong className="font-bold">User Metadata (Debug): </strong>
          <pre className="mt-2 text-xs">
            {JSON.stringify(user.user_metadata, null, 2)}
          </pre>
          <hr className="my-2" />
          <strong className="font-bold">Subscription State (Debug): </strong>
          <pre className="mt-2 text-xs">
            {JSON.stringify(subscription, null, 2)}
          </pre>
        </div>
      )}
      
      {backendError && (
        <BackendDebug />
      )}
      
      {backendError && (
        <div className="bg-yellow-900/50 backdrop-blur-sm rounded-xl p-6 border border-yellow-800/50 shadow-xl mb-8">
          <div className="flex items-center mb-4">
            <AlertCircle className="h-6 w-6 text-yellow-500 mr-2" />
            <h2 className="text-xl font-semibold text-white">Backend Connection Issue</h2>
          </div>
          <p className="text-gray-300 mb-4">
            We couldn't connect to the backend server. The information below is mock data for demonstration purposes.
          </p>
          <p className="text-gray-300 mb-4">
            Please check that your backend server is running and properly configured.
          </p>
          <Link href="/backend-check" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500">
            Run Backend Connection Check
          </Link>
        </div>
      )}
      
      {usingMockData && !backendError && (
        <div className="bg-blue-900/50 backdrop-blur-sm rounded-xl p-6 border border-blue-800/50 shadow-xl mb-8">
          <div className="flex items-center mb-4">
            <AlertCircle className="h-6 w-6 text-blue-500 mr-2" />
            <h2 className="text-xl font-semibold text-white">Using Demo Data</h2>
          </div>
          <p className="text-gray-300 mb-4">
            The backend server is running, but it doesn't have the billing endpoints implemented.
            The information below is mock data for demonstration purposes.
          </p>
          <p className="text-gray-300 mb-4">
            To implement the billing endpoints, you need to update your backend server with the billing module and endpoints.
          </p>
          <Link href="/backend-check" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500">
            View Backend Status
          </Link>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Subscription Section */}
        <div className="lg:col-span-2">
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50 shadow-xl mb-8">
            <div className="flex items-center mb-4">
              <Package className="h-6 w-6 text-orange-500 mr-2" />
              <h2 className="text-xl font-semibold text-white">Current Plan</h2>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 pb-6 border-b border-gray-800">
              <div>
                <div className="flex items-center">
                  <h3 className="text-2xl font-bold text-white">{subscription.plan} Plan</h3>
                  <span className="ml-3 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {subscription.status}
                  </span>
                </div>
                <p className="text-gray-400 mt-1">
                  {subscription.price}/{subscription.billingCycle} • Renews on {new Date(subscription.renewalDate).toLocaleDateString()}
                </p>
              </div>
              <div className="mt-4 md:mt-0 space-x-3">
                {subscription?.plan === 'pro' && (
                  <div className="mb-6">
                    <Button 
                      onClick={handleUpgradeToEnterprise} 
                      variant="default" 
                      className="w-full md:w-auto bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                    >
                      Upgrade to Enterprise
                    </Button>
                  </div>
                )}
                {subscription?.plan === 'free' && (
                  <div className="mb-6 flex flex-col md:flex-row gap-4">
                    <Button 
                      onClick={handleUpgrade} 
                      variant="default" 
                      className="w-full md:w-auto bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                    >
                      Upgrade to Pro
                    </Button>
                    <Button 
                      onClick={handleUpgradeToEnterprise} 
                      variant="outline" 
                      className="w-full md:w-auto"
                    >
                      Upgrade to Enterprise
                    </Button>
                  </div>
                )}
                <button 
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                >
                  Cancel
                </button>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-3">Plan Features</h4>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {subscription.plan.toLowerCase() === 'free' ? (
                  // Free plan features
                  <>
                    <li key="free-1" className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">5 images per month</span>
                    </li>
                    <li key="free-2" className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">Basic upscaling</span>
                    </li>
                    <li key="free-3" className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">Maximum 2K output resolution</span>
                    </li>
                    <li key="free-4" className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">Community support</span>
                    </li>
                  </>
                ) : subscription.plan.toLowerCase() === 'pro' ? (
                  // Pro plan features
                  <>
                    <li key="pro-1" className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">400 images per month</span>
                    </li>
                    <li key="pro-2" className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">Premium upscaling quality</span>
                    </li>
                    <li key="pro-3" className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">Maximum 4K output resolution</span>
                    </li>
                    <li key="pro-4" className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">Email support</span>
                    </li>
                    <li key="pro-5" className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">Fast processing speed</span>
                    </li>
                    <li key="pro-6" className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">All AI models</span>
                    </li>
                    <li key="pro-7" className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">Batch processing (up to 10 images)</span>
                    </li>
                  </>
                ) : (
                  // Enterprise plan features
                  <>
                    <li key="ent-1" className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">800 images per month</span>
                    </li>
                    <li key="ent-2" className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">Highest upscaling quality</span>
                    </li>
                    <li key="ent-3" className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">Maximum 16K output resolution</span>
                    </li>
                    <li key="ent-4" className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">Email support</span>
                    </li>
                    <li key="ent-5" className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">Ultra-fast processing speed</span>
                    </li>
                    <li key="ent-6" className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">All AI models plus beta access</span>
                    </li>
                    <li key="ent-7" className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">Batch processing</span>
                    </li>
                    <li key="ent-8" className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">API access</span>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>
          
          {/* Billing History Section */}
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Receipt className="h-6 w-6 text-orange-500 mr-2" />
                <h2 className="text-xl font-semibold text-white">Billing History</h2>
              </div>
              <div className="flex items-center">
                {loadingBillingHistory && (
                  <div className="mr-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-orange-500"></div>
                  </div>
                )}
                {!backendError && !usingMockData && subscription.plan !== 'Free' && billingHistoryError && (
                  <span className="text-xs text-gray-400 mr-2">Using demo data - Could not fetch real history</span>
                )}
                {!backendError && !usingMockData && subscription.plan !== 'Free' && !billingHistoryError && (
                  <button 
                    onClick={() => {
                      toast.promise(
                        fetchBillingHistory(),
                        {
                          loading: 'Refreshing billing history...',
                          success: 'Billing history refreshed',
                          error: 'Failed to refresh billing history'
                        }
                      );
                    }}
                    className="text-xs text-orange-500 hover:text-orange-400 focus:outline-none"
                    title="Refresh billing history"
                  >
                    Refresh
                  </button>
                )}
              </div>
            </div>
            
            <div className="overflow-x-auto">
              {billingHistory.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-800">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {billingHistory.map((invoice) => (
                      <tr key={invoice.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {new Date(invoice.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {invoice.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {invoice.amount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            invoice.status === 'paid' || invoice.status === 'succeeded' 
                              ? 'bg-green-100 text-green-800' 
                              : invoice.status === 'pending' 
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                          }`}>
                            {invoice.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 text-right">
                          {invoice.downloadUrl && invoice.downloadUrl !== '#' ? (
                            <a 
                              href={invoice.downloadUrl} 
                              className="text-orange-500 hover:text-orange-400"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Download
                            </a>
                          ) : (
                            <span className="text-gray-500">N/A</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400">No billing history available.</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Payment Methods Section */}
        <div className="lg:col-span-1">
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800/50 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <CreditCard className="h-6 w-6 text-orange-500 mr-2" />
                <h2 className="text-xl font-semibold text-white">Payment Methods</h2>
              </div>
              <div className="flex items-center">
                {!backendError && !usingMockData && subscription.plan === 'pro' && (
                  <span className="text-xs text-gray-400 mr-2">Demo data - API integration pending</span>
                )}
                <button 
                  onClick={() => setShowAddPaymentMethod(!showAddPaymentMethod)}
                  className="text-orange-500 hover:text-orange-400 focus:outline-none"
                >
                  <PlusCircle className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            {showAddPaymentMethod && (
              <div className="mb-6 p-4 border border-gray-800 rounded-lg">
                <h3 className="text-lg font-medium text-white mb-4">Add Payment Method</h3>
                <form onSubmit={handleAddPaymentMethod}>
                  <div className="mb-4">
                    <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-400 mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                      value={formData.cardNumber}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="expiry" className="block text-sm font-medium text-gray-400 mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        id="expiry"
                        placeholder="MM/YY"
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                        required
                        value={formData.expiry}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <label htmlFor="cvc" className="block text-sm font-medium text-gray-400 mb-1">
                        CVC
                      </label>
                      <input
                        type="text"
                        id="cvc"
                        placeholder="123"
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                        required
                        value={formData.cvc}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowAddPaymentMethod(false)}
                      className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg shadow-sm hover:bg-gray-800 focus:outline-none"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg shadow-sm hover:from-orange-600 hover:to-orange-700 focus:outline-none"
                    >
                      Add Card
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            <div className="space-y-4">
              {paymentMethods.length > 0 ? (
                paymentMethods.map((method) => (
                  <div key={method.id} className="p-4 border border-gray-800 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center">
                          <span className="text-white font-medium capitalize">{method.brand}</span>
                          {method.isDefault && (
                            <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-orange-500/20 text-orange-500">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-gray-400 text-sm mt-1">
                          •••• {method.last4} | Expires {method.expMonth}/{method.expYear}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        {!method.isDefault && (
                          <button 
                            onClick={() => handleSetDefaultPaymentMethod(method.id)}
                            className="text-gray-400 hover:text-white focus:outline-none"
                            title="Set as default"
                          >
                            <CheckCircle className="h-5 w-5" />
                          </button>
                        )}
                        <button 
                          onClick={() => handleDeletePaymentMethod(method.id)}
                          className="text-gray-400 hover:text-red-500 focus:outline-none"
                          title="Delete"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-400">No payment methods added yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 