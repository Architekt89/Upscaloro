import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/utils/supabase';
import axios from 'axios';

export async function POST(request: NextRequest) {
  // Check authentication using Supabase
  const session = await getSession();
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get the plan ID from the request body
    const { planId } = await request.json();
    if (!planId) {
      return NextResponse.json({ error: 'Missing plan ID' }, { status: 400 });
    }

    // Get the backend API URL from environment variables
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    
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

    // Return the checkout session details
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    
    // Return an error response
    return NextResponse.json(
      { 
        error: 'Failed to create checkout session',
        details: error.response?.data || error.message 
      }, 
      { status: error.response?.status || 500 }
    );
  }
} 