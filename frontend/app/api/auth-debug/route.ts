import { NextRequest, NextResponse } from 'next/server';
import { getSession, getCurrentUser, supabase } from '@/utils/supabase';

export async function GET(request: NextRequest) {
  try {
    // Get Supabase session
    const session = await getSession();
    const user = await getCurrentUser();
    
    // Get detailed session information
    const { data: sessionData } = await supabase.auth.getSession();
    
    // Try to refresh the session to ensure it's valid
    let refreshResult = null;
    if (session) {
      try {
        const { data, error } = await supabase.auth.refreshSession();
        refreshResult = {
          success: !error,
          newSession: data?.session ? true : false,
          error: error ? error.message : null
        };
      } catch (refreshError) {
        refreshResult = {
          success: false,
          error: String(refreshError)
        };
      }
    }
    
    // Return detailed authentication information
    return NextResponse.json({
      authenticated: !!user,
      sessionExists: !!session,
      session: session ? {
        expiresAt: session.expires_at, 
        tokenType: session.token_type,
        refreshable: !!session.refresh_token,
        providerToken: !!session.provider_token,
        providerRefreshToken: !!session.provider_refresh_token,
        accessTokenLength: session.access_token?.length,
        refreshTokenLength: session.refresh_token?.length
      } : null,
      user: user ? {
        id: user.id,
        email: user.email,
        emailConfirmed: user.email_confirmed_at ? true : false,
        lastSignIn: user.last_sign_in_at,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
        appMetadataKeys: user.app_metadata ? Object.keys(user.app_metadata) : [],
        userMetadataKeys: user.user_metadata ? Object.keys(user.user_metadata) : []
      } : null,
      refreshResult,
      rawSessionExists: !!sessionData.session,
      cookiesPresent: Object.keys(request.cookies.getAll())
    });
  } catch (error) {
    console.error('Auth debug error:', error);
    return NextResponse.json({
      error: 'Error debugging authentication',
      details: String(error)
    }, { status: 500 });
  }
} 