import { NextRequest, NextResponse } from 'next/server';
import { getSession, getCurrentUser } from '@/utils/supabase';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    // Get Supabase session
    const session = await getSession();
    const user = await getCurrentUser();
    
    // Log authentication details (for debugging)
    console.log('Session status:', !!session);
    console.log('User status:', !!user);
    
    if (!session || !user) {
      console.log('Authentication failed: No session or user found');
      return NextResponse.json({ error: 'Unauthorized: No session found' }, { status: 401 });
    }
    
    if (!session.access_token) {
      console.log('Authentication failed: No access token in session');
      return NextResponse.json({ error: 'Unauthorized: No access token' }, { status: 401 });
    }

    // Get the plan ID from the request body
    const body = await request.json();
    const { planId } = body;
    
    if (!planId) {
      return NextResponse.json({ error: 'Missing plan ID' }, { status: 400 });
    }

    // Get the backend API URL from environment variables
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    
    console.log(`Creating checkout session for plan: ${planId}`);
    console.log(`Using backend URL: ${apiUrl}`);
    
    // Forward the request to the backend to create a checkout session
    const response = await axios.post(
      `${apiUrl}/api/checkout`,
      { plan_id: planId },
      {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Checkout session created successfully');
    
    // Return the checkout session details
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    
    // Log more detailed error information
    if (axios.isAxiosError(error)) {
      console.error('Response status:', error.response?.status);
      console.error('Response data:', error.response?.data);
      console.error('Request URL:', error.config?.url);
      console.error('Request headers:', error.config?.headers);
    }
    
    // Return an error response
    return NextResponse.json(
      { 
        error: 'Failed to create checkout session',
        details: error.response?.data || error.message,
        status: error.response?.status
      }, 
      { status: error.response?.status || 500 }
    );
  }
} 