import axios from 'axios';
import { getSession } from '@/utils/supabase';

// Create an axios instance with default config
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const session = await getSession();
      if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
        console.log('Added auth token to request');
      } else {
        console.warn('No access token available for request');
      }
    } catch (error) {
      console.error('Error getting session for API request:', error);
    }
    
    // Log the request for debugging
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Log detailed error information
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('API Error Response:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
        url: error.config.url,
      });
    } else if (error.request) {
      // The request was made but no response was received
      console.error('API No Response Error:', {
        request: error.request,
        url: error.config.url,
      });
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('API Setup Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Function for file uploads with authentication
export const uploadFile = async (endpoint: string, formData: FormData) => {
  try {
    const session = await getSession();
    
    if (!session) {
      console.error('No session available for file upload');
      throw new Error('Authentication required for file upload');
    }
    
    if (!session.access_token) {
      console.error('No access token in session for file upload');
      throw new Error('No access token available');
    }
    
    console.log('Session for file upload:', {
      user: session.user?.email,
      tokenExpiry: new Date(session.expires_at || 0 * 1000).toISOString(),
      hasToken: !!session.access_token,
      tokenLength: session.access_token?.length
    });
    
    const headers: Record<string, string> = {
      'Content-Type': 'multipart/form-data',
      'Authorization': `Bearer ${session.access_token}`
    };
    
    console.log(`Uploading file to: ${process.env.NEXT_PUBLIC_API_URL}${endpoint}`);
    console.log('Headers:', Object.keys(headers).map(key => `${key}: ${key === 'Authorization' ? 'Bearer [token]' : headers[key]}`));
    
    return axios.post(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, formData, {
      headers,
      responseType: 'blob',
      withCredentials: true
    });
  } catch (error) {
    console.error('Error in uploadFile:', error);
    throw error;
  }
};

export default api; 