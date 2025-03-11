import { NextResponse } from 'next/server';
import { getSession } from '@/utils/supabase';

export async function GET() {
  try {
    // Get environment variables
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    
    // Check for session
    const session = await getSession();
    
    // Return configuration data
    return NextResponse.json({
      success: true,
      config: {
        backendUrl,
        apiUrl,
        supabaseUrl,
        hasBackendUrl: !!backendUrl,
        hasApiUrl: !!apiUrl,
        hasSupabaseUrl: !!supabaseUrl,
        allEnvVars: Object.keys(process.env).filter(key => 
          key.startsWith('NEXT_PUBLIC_')
        ),
        hostInfo: {
          headers: Object.fromEntries(
            Object.entries({
              host: process.env.VERCEL_URL || 'localhost',
              protocol: process.env.VERCEL_URL ? 'https' : 'http'
            })
          )
        },
        auth: {
          hasSession: !!session,
          sessionExpiry: session?.expires_at 
            ? new Date(session.expires_at * 1000).toISOString()
            : null
        }
      }
    });
  } catch (error) {
    console.error('Config debug error:', error);
    return NextResponse.json({
      success: false,
      error: 'Error getting configuration',
      details: (error as Error).message
    }, { status: 500 });
  }
} 