import { NextResponse, NextRequest } from 'next/server';
import { getSession, getCurrentUser, supabase } from '@/utils/supabase';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    console.log("Checkout debug API called");
    
    // Get client-provided token from body if available
    const body = await request.json();
    const { clientToken } = body;
    
    // Get the session through our helper
    const session = await getSession();
    const user = await getCurrentUser();
    
    // Get session directly from Supabase
    const { data: { session: directSession } } = await supabase.auth.getSession();
    
    // Determine which token to use for the backend call
    let tokenToUse = null;
    let tokenSource = "none";
    
    if (clientToken) {
      tokenToUse = clientToken;
      tokenSource = "client-provided";
    } else if (session?.access_token) {
      tokenToUse = session.access_token;
      tokenSource = "helper-session";
    } else if (directSession?.access_token) {
      tokenToUse = directSession.access_token;
      tokenSource = "direct-session";
    }
    
    // Get the backend URL from environment variables
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    
    // Try different endpoint paths that might exist on the backend
    let testEndpoint = '';
    let endpointPaths = [];
    
    if (backendUrl) {
      // Try various potential endpoints in order of likelihood
      endpointPaths = [
        `${backendUrl}/checkout/session-auth-test`,
        `${backendUrl}/user/me`,
        `${backendUrl}/api/auth/user`,
        // Add the actual checkout endpoint as a fallback
        `${backendUrl}/checkout/create-checkout-session`
      ];
      console.log(`Using NEXT_PUBLIC_BACKEND_URL: ${backendUrl}`);
    } else if (apiUrl) {
      // Try various potential endpoints for legacy backend
      endpointPaths = [
        `${apiUrl}/auth/user`,
        `${apiUrl}/api/auth/verify`,
        `${apiUrl}/api/user/me`,
        // Add the actual checkout endpoint as a fallback
        `${apiUrl}/api/checkout`
      ];
      console.log(`Using NEXT_PUBLIC_API_URL: ${apiUrl}`);
    } else {
      return NextResponse.json({ 
        error: "No backend URL configured",
        envVars: Object.keys(process.env).filter(key => key.startsWith('NEXT_PUBLIC_'))
      }, { status: 500 });
    }
    
    // Choose the first endpoint to try
    testEndpoint = endpointPaths[0];
    
    // Debug information about current state
    const debugState = {
      authenticated: !!user,
      sessionExists: !!session,
      directSessionExists: !!directSession,
      hasToken: !!tokenToUse,
      tokenSource,
      tokenLength: tokenToUse?.length || 0,
      backendUrl,
      apiUrl,
      testEndpoint,
      allEndpointsToTry: endpointPaths
    };
    
    // If we have a token, test calling the backend API
    if (tokenToUse) {
      // Try each endpoint until we find one that doesn't 404
      let successfulResponse = null;
      let lastError = null;
      
      for (const endpoint of endpointPaths) {
        try {
          console.log(`Testing endpoint: ${endpoint}`);
          
          const response = await axios.get(endpoint, {
            headers: {
              "Authorization": `Bearer ${tokenToUse}`,
              "Content-Type": "application/json"
            }
          });
          
          // If we get a successful response, use this endpoint
          successfulResponse = {
            status: response.status,
            data: response.data,
            endpoint
          };
          break;
        } catch (apiError: any) {
          console.error(`Error calling ${endpoint}:`, apiError.message);
          
          // If it's not a 404, we've found an endpoint that exists but has other issues
          if (apiError.response?.status !== 404) {
            lastError = {
              status: apiError.response?.status,
              data: apiError.response?.data,
              endpoint
            };
            break;
          }
          
          // Store the last error to return if all endpoints fail
          lastError = {
            status: apiError.response?.status,
            data: apiError.response?.data,
            endpoint
          };
        }
      }
      
      if (successfulResponse) {
        // We found a working endpoint
        return NextResponse.json({
          success: true,
          message: "Successfully authenticated with backend",
          backendResponse: successfulResponse.data,
          endpoint: successfulResponse.endpoint,
          debug: debugState
        });
      } else {
        // All endpoints failed
        return NextResponse.json({
          success: false,
          error: "Backend API call failed",
          status: lastError?.status,
          data: lastError?.data,
          endpoint: lastError?.endpoint,
          debug: debugState
        }, { status: 500 });
      }
    } else {
      return NextResponse.json({
        success: false,
        error: "No authentication token available",
        debug: debugState
      }, { status: 401 });
    }
  } catch (error: any) {
    console.error("Checkout debug error:", error);
    
    return NextResponse.json({
      success: false,
      error: "Internal server error",
      message: error.message
    }, { status: 500 });
  }
} 