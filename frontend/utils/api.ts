import axios from 'axios';
import { getSession } from '@/utils/supabase';

// Create an axios instance with default config
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // Add 60 second timeout
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
export const uploadFile = async (endpoint: string, formData: FormData, retries = 2) => {
  let lastError;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      console.log(`Upload attempt ${attempt + 1}/${retries + 1}`);
      
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
      
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`;
      console.log(`Uploading file to: ${apiUrl}`);
      console.log('Headers:', Object.keys(headers).map(key => `${key}: ${key === 'Authorization' ? 'Bearer [token]' : headers[key]}`));
      
      // Create a specific instance for large file uploads with longer timeout
      return await axios.post(apiUrl, formData, {
        headers,
        responseType: 'blob',
        withCredentials: true,
        timeout: 120000, // 2 minutes timeout for image processing
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 100));
          console.log(`Upload progress: ${percentCompleted}%`);
        }
      });
    } catch (error) {
      lastError = error;
      console.error(`Error in uploadFile (attempt ${attempt + 1}/${retries + 1}):`, error);
      
      // Don't retry if it's an authentication error
      if (axios.isAxiosError(error) && error.response && (error.response.status === 401 || error.response.status === 403)) {
        console.log("Authentication error, not retrying");
        throw error;
      }
      
      // Don't retry if it's a client error (4xx) except for 429 (rate limiting)
      if (axios.isAxiosError(error) && error.response && error.response.status >= 400 && error.response.status < 500 && error.response.status !== 429) {
        console.log(`Client error ${error.response.status}, not retrying`);
        throw error;
      }
      
      // If we have retries left, wait before trying again
      if (attempt < retries) {
        const retryDelay = Math.pow(2, attempt) * 1000 + Math.random() * 1000; // Exponential backoff with jitter
        console.log(`Retrying in ${retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      } else {
        throw error; // Rethrow the last error if we've exhausted our retries
      }
    }
  }
  
  // This should never be reached because we either return or throw within the loop
  throw lastError || new Error('Maximum retries exceeded');
};

export default api; 