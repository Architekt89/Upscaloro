import { NextResponse } from 'next/server';
import { signOut } from '@/utils/supabase';

export async function POST() {
  try {
    await signOut();
    
    return NextResponse.json({
      success: true,
      message: 'Successfully logged out',
    });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to logout',
      },
      { status: 500 }
    );
  }
} 