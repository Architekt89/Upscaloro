import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  
  try {
    // Try to connect to the backend health endpoint
    const response = await axios.get(`${API_URL}/health`);
    
    return NextResponse.json({
      status: 'ok',
      backend: {
        status: response.status,
        data: response.data,
        url: API_URL
      }
    });
  } catch (error) {
    console.error('Backend health check failed:', error);
    
    interface ErrorDetails {
      message: string;
      code?: string;
      status?: number;
      data?: any;
      url?: string;
    }
    
    let errorDetails: ErrorDetails = {
      message: 'Unknown error'
    };
    
    if (axios.isAxiosError(error)) {
      errorDetails = {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        data: error.response?.data,
        url: `${API_URL}/health`
      };
    }
    
    return NextResponse.json({
      status: 'error',
      error: errorDetails
    }, { status: 500 });
  }
} 