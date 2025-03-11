import { NextResponse } from 'next/server';
import { supabase, getSession } from '@/utils/supabase';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    // Get the current session
    let session = await getSession();
    
    // Check if there's a valid session
    if (!session) {
      return NextResponse.json({
        success: false,
        error: 'No active session found',
      }, { status: 401 });
    }
    
    // Try to refresh the session
    const { data, error } = await supabase.auth.refreshSession();
    
    if (error) {
      console.error('Session refresh error:', error);
      return NextResponse.json({
        success: false,
        error: error.message,
      }, { status: 401 });
    }
    
    // Return the refreshed session info
    return NextResponse.json({
      success: true,
      message: 'Session refreshed successfully',
      user: data.user,
      sessionExpiresAt: data.session?.expires_at,
    });
  } catch (error) {
    console.error('Session refresh error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to refresh session',
    }, { status: 500 });
  }
} 