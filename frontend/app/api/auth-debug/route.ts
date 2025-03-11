import { NextRequest, NextResponse } from 'next/server';
import { getSession, getCurrentUser, supabase } from '@/utils/supabase';

export async function GET(request: NextRequest) {
  try {
    console.log("Auth debug API called");
    
    // Get Supabase session
    const session = await getSession();
    const user = await getCurrentUser();
    
    // Get session data directly
    const { data: sessionData } = await supabase.auth.getSession();
    
    // Extract cookie names from the request
    const cookieNames = Object.keys(request.cookies.getAll());
    const supabaseCookieNames = cookieNames.filter(name => 
      name.includes('supabase') || 
      name.includes('sb-')
    );
    
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
      rawSessionExists: !!sessionData?.session,
      session: sessionData?.session ? {
        expiresAt: sessionData.session.expires_at,
        hasAccessToken: !!sessionData.session.access_token,
        accessTokenLength: sessionData.session.access_token?.length || 0
      } : null,
      user: user ? {
        id: user.id,
        email: user.email,
        emailConfirmed: !!user.email_confirmed_at
      } : null,
      supabaseCookies: supabaseCookieNames,
      allCookies: cookieNames,
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