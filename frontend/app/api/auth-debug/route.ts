import { NextRequest, NextResponse } from 'next/server';
import { getSession, getCurrentUser, supabase } from '@/utils/supabase';

export async function GET(request: NextRequest) {
  try {
    console.log("Auth debug API called");
    
    // Get headers from the request for debugging
    const authHeader = request.headers.get('authorization');
    const cookieHeader = request.headers.get('cookie');
    
    // Get all cookies from the request
    const requestCookies = Object.fromEntries(
      request.cookies.getAll().map(c => [c.name, c.value])
    );
    
    // List all supabase-related cookies
    const supabaseCookies = Object.keys(requestCookies).filter(name => 
      name.includes('supabase') || 
      name.includes('sb-')
    );
    
    // Get Supabase session directly
    const directSessionResult = await supabase.auth.getSession();
    const directUserResult = await supabase.auth.getUser();
    
    // Get session through our helper
    const session = await getSession();
    const user = await getCurrentUser();
    
    // Try to refresh the session
    let refreshResult = null;
    try {
      const { data, error } = await supabase.auth.refreshSession();
      refreshResult = {
        success: !error,
        hasSession: !!data.session,
        hasUser: !!data.user,
        error: error ? error.message : null
      };
      
      if (!error && data.session) {
        console.log("Session refreshed successfully");
      } else if (error) {
        console.error("Session refresh error:", error);
      }
    } catch (refreshError) {
      console.error("Error refreshing session:", refreshError);
      refreshResult = { 
        success: false, 
        error: (refreshError as Error).message 
      };
    }
    
    // Return detailed authentication information
    return NextResponse.json({
      authenticated: !!user,
      sessionExists: !!session,
      directSessionExists: !!directSessionResult.data.session,
      directUserExists: !!directUserResult.data.user,
      
      // Include safe versions of the session and user objects
      session: session ? {
        expiresAt: session.expires_at,
        hasAccessToken: !!session.access_token,
        accessTokenLength: session.access_token?.length || 0
      } : null,
      
      user: user ? {
        id: user.id,
        email: user.email,
        emailConfirmed: !!user.email_confirmed_at
      } : null,
      
      // Cookie information
      authHeader: authHeader ? 'Present' : 'Missing',
      cookieHeader: cookieHeader ? `Present (${cookieHeader.length} chars)` : 'Missing',
      supabaseCookies,
      hasSbAuthCookie: !!requestCookies['sb-auth-token'],
      hasSupabaseAuthCookie: !!requestCookies['supabase-auth-token'],
      
      // Request cookie counts
      requestCookieCount: Object.keys(requestCookies).length,
      
      // Refresh result
      refreshResult
    });
  } catch (error) {
    console.error('Auth debug error:', error);
    return NextResponse.json({
      success: false,
      error: 'Error debugging authentication',
      details: (error as Error).message
    }, { status: 500 });
  }
} 