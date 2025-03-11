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
    
    let testEndpoint = '';
    
    if (backendUrl) {
      testEndpoint = `${backendUrl}/user/me`;
    } else if (apiUrl) {
      testEndpoint = `${apiUrl}/api/user`;
    } else {
      return NextResponse.json({ 
        error: "No backend URL configured",
        envVars: Object.keys(process.env).filter(key => key.startsWith('NEXT_PUBLIC_'))
      }, { status: 500 });
    }
    
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
      testEndpoint
    };
    
    // If we have a token, test calling the backend API
    if (tokenToUse) {
      try {
        const response = await axios.get(testEndpoint, {
          headers: {
            "Authorization": `Bearer ${tokenToUse}`,
            "Content-Type": "application/json"
          }
        });
        
        return NextResponse.json({
          success: true,
          message: "Successfully authenticated with backend",
          backendResponse: response.data,
          debug: debugState
        });
      } catch (apiError: any) {
        console.error("Error calling backend:", apiError);
        
        return NextResponse.json({
          success: false,
          error: "Backend API call failed",
          status: apiError.response?.status,
          data: apiError.response?.data,
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