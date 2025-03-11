import { NextRequest, NextResponse } from 'next/server';
import { getSession, getCurrentUser, supabase } from '@/utils/supabase';
import axios from 'axios';

export async function POST(req: Request) {
  try {
    console.log("Checkout API called");
    
    // Get the request body
    const body = await req.json();
    const { planId } = body;
    
    if (!planId) {
      console.error("No plan ID provided");
      return NextResponse.json({ error: "Plan ID is required" }, { status: 400 });
    }
    
    // Get the session and user
    let session = await getSession();
    const user = await getCurrentUser();
    
    console.log("Session check:", { 
      session: session ? "exists" : "null", 
      user: user ? "exists" : "null"
    });
    
    // If we have a user but no session, try to refresh the session
    if (user && !session) {
      console.log("User exists but no session, attempting to refresh");
      try {
        const { data, error } = await supabase.auth.refreshSession();
        if (error) {
          console.error("Session refresh error:", error);
        } else {
          session = data.session;
          console.log("Session refreshed successfully");
        }
      } catch (refreshError) {
        console.error("Error refreshing session:", refreshError);
      }
    }
    
    // If there is still no session or user, return an unauthorized response
    if (!session || !user) {
      console.error("No session or user found after refresh attempt");
      return NextResponse.json({ 
        error: "Unauthorized", 
        details: "You need to be logged in",
        sessionExists: !!session,
        userExists: !!user
      }, { status: 401 });
    }
    
    // Extracting the access token for the API call
    const accessToken = session.access_token;
    if (!accessToken) {
      console.error("No access token found in session");
      return NextResponse.json({ 
        error: "Unauthorized", 
        details: "No access token found" 
      }, { status: 401 });
    }
    
    // Making the request to the backend API
    console.log(`Creating checkout session for plan: ${planId}`);
    
    // Get the backend URL from environment variables, checking multiple possible configurations
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    
    let checkoutEndpoint = '';
    
    if (backendUrl) {
      checkoutEndpoint = `${backendUrl}/checkout/create-checkout-session`;
      console.log(`Using NEXT_PUBLIC_BACKEND_URL: ${backendUrl}`);
    } else if (apiUrl) {
      checkoutEndpoint = `${apiUrl}/api/checkout`;
      console.log(`Using NEXT_PUBLIC_API_URL: ${apiUrl}`);
    } else {
      console.error("No backend URL configured (missing NEXT_PUBLIC_BACKEND_URL or NEXT_PUBLIC_API_URL)");
      return NextResponse.json({ 
        error: "Server configuration error", 
        details: "No backend URL configured",
        envVars: Object.keys(process.env).filter(key => key.startsWith('NEXT_PUBLIC_'))
      }, { status: 500 });
    }
    
    console.log(`Making request to: ${checkoutEndpoint}`);
    
    const response = await axios.post(
      checkoutEndpoint,
      backendUrl ? { planId } : { plan_id: planId }, // Different payload formats based on backend
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    
    console.log("Checkout response status:", response.status);
    console.log("Checkout response data:", response.data);
    
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Error in checkout API:", error);
    
    // Enhanced error logging for debugging
    let errorDetails: any = {
      message: error.message || "Unknown error"
    };
    
    if (error.response) {
      errorDetails = {
        ...errorDetails,
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      };
      console.error("Response error details:", errorDetails);
    } else if (error.request) {
      // The request was made but no response was received
      errorDetails = {
        ...errorDetails,
        request: "Request was made but no response received"
      };
      console.error("Request error (no response):", error.request);
    }
    
    return NextResponse.json(
      { error: "Failed to create checkout session", details: errorDetails },
      { status: 500 }
    );
  }
} 