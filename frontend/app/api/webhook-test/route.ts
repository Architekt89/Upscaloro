import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: NextRequest) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  
  try {
    // Make a simple GET request to the backend to check if it's reachable
    const response = await axios.get(`${apiUrl}/health`);
    
    // Return backend health status
    return NextResponse.json({
      status: 'ok',
      message: 'Backend connection successful',
      backendUrl: apiUrl,
      backendResponse: response.data
    });
  } catch (error: any) {
    console.error('Error connecting to backend:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Failed to connect to backend',
      backendUrl: apiUrl,
      error: error.message,
      details: error.response?.data
    }, { status: 500 });
  }
} 