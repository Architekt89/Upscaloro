import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { getSession, getCurrentUser, supabase } from '@/utils/supabase';

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    const { planId, priceId, billingCycle, redirectTo, skipAuth = false } = body;

    // Get the token from the Authorization header if present
    const authHeader = request.headers.get('Authorization');
    let headerToken = null;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      headerToken = authHeader.substring(7);
      console.log(`Using token from Authorization header (length: ${headerToken.length})`);
    }

    // Get token from direct request or session
    const session = await getSession();
    const directToken = body.token;
    
    // Determine which token to use (priority: header > direct > session)
    let token = headerToken || directToken || session?.access_token;
    let tokenSource = headerToken ? 'header' : (directToken ? 'direct' : 'session');
    
    // If skipAuth is true and no token is available, use a placeholder
    if (skipAuth && !token) {
      console.log('Skipping authentication for checkout');
      token = 'unauthenticated-checkout';
      tokenSource = 'skipped';
    } else if (!token) {
      console.log('No authentication token available');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    console.log(`Using ${tokenSource} token for checkout (length: ${token.length})`);

    // Prepare the request payload in snake_case format as expected by the backend
    const payload = {
      plan_id: planId,
      price_id: priceId,
      billing_cycle: billingCycle,
      success_url: redirectTo,
      cancel_url: redirectTo?.replace('success=true', 'success=false') || `${request.nextUrl.origin}/pricing?success=false`
    };

    // Prepare headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Add Authorization header if token is available
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('Adding Authorization header to backend request');
    } else {
      console.log('No token available for Authorization header');
    }

    // Log the full checkout request details (redacting the actual token)
    console.log('Checkout request:', {
      endpoint: `${process.env.NEXT_PUBLIC_API_URL}/billing/create-checkout-session`,
      headers: { ...headers, Authorization: headers.Authorization ? 'Bearer [REDACTED]' : undefined },
      payload
    });

    // Make the request to the backend API
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/billing/create-checkout-session`,
      payload,
      { headers }
    );

    // Return the checkout URL
    return NextResponse.json({ url: response.data.url });
  } catch (error: unknown) {
    // Cast error to a type with response and message properties
    const axiosError = error as { 
      response?: { status?: number; data?: any }; 
      message?: string 
    };
    
    console.error('Checkout error:', axiosError);
    
    // If the primary endpoint fails with a 401, try the alternative endpoint
    if (axiosError.response?.status === 401) {
      try {
        console.log('Primary endpoint returned 401, trying alternative endpoint');
        
        // Parse the request body again
        const body = await request.json();
        const { planId, priceId, redirectTo } = body;
        
        // Make the request to the alternative endpoint
        const altResponse = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/billing/create-checkout-session-alt`,
          {
            plan_id: planId,
            price_id: priceId,
            success_url: redirectTo,
            cancel_url: redirectTo?.replace('success=true', 'success=false') || `${request.nextUrl.origin}/pricing?success=false`
          }
        );
        
        // Return the checkout URL from the alternative endpoint
        return NextResponse.json({ url: altResponse.data.url });
      } catch (altError: unknown) {
        // Cast alternative error to a type with response and message properties
        const altAxiosError = altError as { 
          response?: { status?: number; data?: any }; 
          message?: string 
        };
        
        console.error('Alternative endpoint error:', altAxiosError);
        
        // Return the error from the alternative endpoint
        return NextResponse.json(
          { error: altAxiosError.response?.data?.error || 'Failed to create checkout session' },
          { status: altAxiosError.response?.status || 500 }
        );
      }
    }
    
    // Return the error from the primary endpoint
    return NextResponse.json(
      { error: axiosError.response?.data?.error || 'Failed to create checkout session' },
      { status: axiosError.response?.status || 500 }
    );
  }
} 