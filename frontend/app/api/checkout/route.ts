import { NextRequest, NextResponse } from 'next/server';
import { getSession, getCurrentUser, supabase } from '@/utils/supabase';
import axios from 'axios';

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const { planId, priceId, billingCycle, redirectTo, directToken, customBackendUrl } = json;

    if (!planId) {
      console.error('Missing plan ID in checkout request');
      return NextResponse.json(
        { error: 'Missing plan ID' },
        { status: 400 }
      );
    }

    let session = await getSession();
    const user = await getCurrentUser();

    // Try to use direct token if provided (for debugging)
    let token = directToken;
    let authSource = 'direct';

    // If no direct token, check session
    if (!token) {
      if (!session && user) {
        console.log('No session found but user exists, trying to refresh session');
        // Try to refresh the session
        const { data } = await supabase.auth.refreshSession();
        session = data.session;
        console.log('Session refresh result:', !!session);
      }

      if (!session) {
        console.error('No session found for checkout');
        return NextResponse.json(
          { 
            error: 'You need to be logged in. Please refresh the page and try again.',
            hasSession: !!session,
            hasUser: !!user,
          },
          { status: 401 }
        );
      }

      token = session.access_token;
      authSource = 'session';
    }

    // Determine the backend URL to use
    let backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://upscaloro.onrender.com';
    
    // Override with custom URL if provided
    if (customBackendUrl && customBackendUrl.trim()) {
      backendUrl = customBackendUrl.trim();
      console.log('Using custom backend URL:', backendUrl);
    }

    // Normalize backend URL
    if (backendUrl.endsWith('/')) {
      backendUrl = backendUrl.slice(0, -1);
    }

    // List of endpoints to try (primary and alternatives)
    const endpoints = [
      // The correct endpoint based on user feedback
      `${backendUrl}/api/create-checkout-session`,
      // Fallback endpoints
      `${backendUrl}/checkout`,
      `${backendUrl}/api/checkout`,
      `${backendUrl}/v1/checkout`,
      `${backendUrl}/users/checkout`
    ];

    let checkoutResponse = null;
    let successEndpoint = null;

    // Try each endpoint until one works
    for (const endpoint of endpoints) {
      try {
        console.log(`Attempting checkout with endpoint: ${endpoint}, auth source: ${authSource}`);
        
        checkoutResponse = await axios.post(
          endpoint,
          {
            plan_id: planId,
            price_id: priceId,
            billing_cycle: billingCycle,
            redirect_to: redirectTo || `${process.env.NEXT_PUBLIC_URL || ''}/pricing?success=true`
          },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        // If we got here, the endpoint worked
        successEndpoint = endpoint;
        console.log(`Checkout successful with endpoint: ${endpoint}`);
        break;
      } catch (error: unknown) {
        const axiosError = error as { 
          response?: { status?: number, data?: any },
          message?: string 
        };
        
        // If we get a 401, stop trying endpoints - we have an auth problem
        if (axiosError.response?.status === 401) {
          console.error('Authentication failed for checkout');
          return NextResponse.json(
            {
              error: 'Authentication failed for checkout. Please log out and log in again.',
              details: axiosError.response?.data || axiosError.message,
              endpoint
            },
            { status: 401 }
          );
        }
        
        // If it's not a 404, it's a real error, not just "endpoint not found"
        if (axiosError.response?.status !== 404) {
          console.error(`Error with endpoint ${endpoint}:`, axiosError.response?.data || axiosError.message);
        } else {
          console.log(`Endpoint ${endpoint} not found, trying next...`);
        }
      }
    }

    // If we couldn't find a working endpoint
    if (!checkoutResponse) {
      console.error('All checkout endpoints failed');
      return NextResponse.json(
        { 
          error: 'Failed to create checkout session. No valid endpoint found.',
          endpoints,
          authSource 
        },
        { status: 500 }
      );
    }

    console.log('Checkout successful, returning URL');
    return NextResponse.json(checkoutResponse.data);
  } catch (error: unknown) {
    const axiosError = error as { 
      response?: { status?: number, data?: any },
      message?: string 
    };
    
    console.error('Unhandled error in checkout API:', axiosError.response?.data || axiosError.message);
    
    return NextResponse.json(
      { 
        error: 'Failed to create checkout session',
        details: axiosError.response?.data || axiosError.message
      },
      { status: 500 }
    );
  }
} 