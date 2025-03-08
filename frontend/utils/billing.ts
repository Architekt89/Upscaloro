import axios from 'axios';
import { getSession } from './supabase';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Log the API URL for debugging
console.log('API URL:', API_URL);

// Create axios instance with auth header
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  try {
    const session = await getSession();
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
      console.log('Auth token added to request');
    } else {
      console.log('No auth token available');
    }
    
    // Log the full request URL for debugging
    console.log('Request URL:', `${config.baseURL}${config.url}`);
  } catch (error) {
    console.error('Error getting auth token:', error);
  }
  return config;
});

// Mock data for when the backend doesn't have billing endpoints
export const mockBillingData = {
  subscription: {
    plan: "Pro",
    status: "active",
    renewal_date: new Date().toISOString().split('T')[0],
    price: "$15.00",
    billing_cycle: "monthly",
    features: [
      "Unlimited images",
      "Up to 16x upscaling",
      "All upscaling modes",
      "API access",
      "Priority support",
    ]
  },
  payment_methods: [
    {
      id: "pm_1",
      type: "card",
      brand: "visa",
      last4: "4242",
      exp_month: 12,
      exp_year: 2024,
      is_default: true,
    }
  ],
  invoices: [
    {
      id: "in_1",
      date: new Date().toISOString().split('T')[0],
      amount: "$15.00",
      status: "paid",
      description: "Pro Plan - Monthly",
      download_url: "#",
    }
  ],
  usage: {
    images_processed: 87,
    images_limit: 100,
    api_calls: 230,
    api_calls_limit: 500,
    storage_used: "1.2 GB",
    storage_limit: "5 GB",
  }
};

// Billing API functions
export const getBillingInfo = async () => {
  try {
    // Check if we have a session before making the request
    const session = await getSession();
    if (!session) {
      console.error('No active session found');
      throw new Error('Authentication required');
    }
    
    console.log('Making request to /billing endpoint');
    try {
      const response = await api.get('/billing');
      console.log('Response received:', response.status);
      return response.data;
    } catch (error) {
      // If the endpoint doesn't exist (404), return mock data
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        console.log('Billing endpoint not found, using mock data');
        return mockBillingData;
      }
      throw error;
    }
  } catch (error) {
    console.error('Error fetching billing info:', error);
    
    // Add more detailed error logging
    if (axios.isAxiosError(error)) {
      console.error('Request URL:', error.config?.url);
      console.error('Request baseURL:', error.config?.baseURL);
      console.error('Response status:', error.response?.status);
      console.error('Response data:', error.response?.data);
    }
    
    throw error;
  }
};

export const updateSubscription = async (planId: string) => {
  try {
    try {
      const response = await api.post('/billing/subscription', { plan_id: planId });
      return response.data;
    } catch (error) {
      // If the endpoint doesn't exist (404), return mock success response
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        console.log('Subscription endpoint not found, using mock response');
        return {
          success: true,
          message: `Subscription updated to ${planId === 'pro' ? 'Pro' : planId === 'enterprise' ? 'Enterprise' : 'Free'} plan`,
          plan: {
            id: planId,
            name: planId === 'pro' ? 'Pro' : planId === 'enterprise' ? 'Enterprise' : 'Free',
            price: planId === 'pro' ? 15.00 : planId === 'enterprise' ? 30.00 : 0.00,
            interval: "month",
            features: planId === 'free' ? [
              "Up to 3 images per month",
              "2x and 4x upscaling",
              "Basic upscaling mode",
              "Standard support"
            ] : planId === 'pro' ? [
              "Unlimited images",
              "Up to 16x upscaling",
              "All upscaling modes",
              "API access",
              "Priority support"
            ] : [
              "Unlimited images",
              "Up to 16x upscaling",
              "All upscaling modes",
              "Unlimited API access",
              "Dedicated support",
              "Custom integration"
            ]
          }
        };
      }
      throw error;
    }
  } catch (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }
};

export const cancelSubscription = async () => {
  try {
    try {
      const response = await api.post('/billing/subscription/cancel');
      return response.data;
    } catch (error) {
      // If the endpoint doesn't exist (404), return mock success response
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        console.log('Cancel subscription endpoint not found, using mock response');
        return {
          success: true,
          message: "Subscription cancelled successfully. You will have access until the end of your billing period."
        };
      }
      throw error;
    }
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    throw error;
  }
};

export const addPaymentMethod = async (paymentDetails: any) => {
  try {
    try {
      const response = await api.post('/billing/payment-methods', paymentDetails);
      return response.data;
    } catch (error) {
      // If the endpoint doesn't exist (404), return mock success response
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        console.log('Payment methods endpoint not found, using mock response');
        return {
          success: true,
          message: "Payment method added successfully",
          payment_method: {
            id: "pm_new",
            type: "card",
            brand: "visa",
            last4: paymentDetails.card_number.slice(-4),
            exp_month: paymentDetails.exp_month,
            exp_year: paymentDetails.exp_year,
            is_default: false
          }
        };
      }
      throw error;
    }
  } catch (error) {
    console.error('Error adding payment method:', error);
    throw error;
  }
};

export const deletePaymentMethod = async (paymentMethodId: string) => {
  try {
    try {
      const response = await api.delete(`/billing/payment-methods/${paymentMethodId}`);
      return response.data;
    } catch (error) {
      // If the endpoint doesn't exist (404), return mock success response
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        console.log('Delete payment method endpoint not found, using mock response');
        return {
          success: true,
          message: "Payment method deleted successfully"
        };
      }
      throw error;
    }
  } catch (error) {
    console.error('Error deleting payment method:', error);
    throw error;
  }
};

export const setDefaultPaymentMethod = async (paymentMethodId: string) => {
  try {
    try {
      const response = await api.post(`/billing/payment-methods/${paymentMethodId}/default`);
      return response.data;
    } catch (error) {
      // If the endpoint doesn't exist (404), return mock success response
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        console.log('Set default payment method endpoint not found, using mock response');
        return {
          success: true,
          message: "Default payment method updated successfully"
        };
      }
      throw error;
    }
  } catch (error) {
    console.error('Error setting default payment method:', error);
    throw error;
  }
};

export const getAvailablePlans = async () => {
  try {
    try {
      const response = await api.get('/billing/plans');
      return response.data;
    } catch (error) {
      // If the endpoint doesn't exist (404), return mock plans
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        console.log('Plans endpoint not found, using mock plans');
        return {
          plans: {
            free: {
              id: "free",
              name: "Free",
              price: 0.0,
              interval: "month",
              features: [
                "Up to 3 images per month",
                "2x and 4x upscaling",
                "Basic upscaling mode",
                "Standard support"
              ],
              limits: {
                images_per_month: 3,
                max_scale_factor: 4,
                api_calls_per_month: 0,
                storage_gb: 0.1
              }
            },
            pro: {
              id: "pro",
              name: "Pro",
              price: 15.0,
              interval: "month",
              features: [
                "Unlimited images",
                "Up to 16x upscaling",
                "All upscaling modes",
                "API access",
                "Priority support"
              ],
              limits: {
                images_per_month: 100,
                max_scale_factor: 16,
                api_calls_per_month: 500,
                storage_gb: 5
              }
            },
            enterprise: {
              id: "enterprise",
              name: "Enterprise",
              price: 30.0,
              interval: "month",
              features: [
                "Unlimited images",
                "Up to 16x upscaling",
                "All upscaling modes",
                "Unlimited API access",
                "Dedicated support",
                "Custom integration"
              ],
              limits: {
                images_per_month: 1000,
                max_scale_factor: 16,
                api_calls_per_month: 5000,
                storage_gb: 20
              }
            }
          }
        };
      }
      throw error;
    }
  } catch (error) {
    console.error('Error fetching available plans:', error);
    throw error;
  }
}; 