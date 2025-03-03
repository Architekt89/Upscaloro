# Deployment Instructions for Upscaloro

## Backend Deployment (Render.com)

1. Make sure your backend/.env file has the correct CORS settings:
   ```
   CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,https://upscaloro.vercel.app,https://*.vercel.app
   ```

2. Push your changes to GitHub.

3. In your Render.com dashboard:
   - Verify that the environment variables are correctly set
   - Ensure CORS_ORIGINS includes your Vercel domain
   - Restart the service to apply the changes

## Frontend Deployment (Vercel)

1. Make sure your frontend/.env file has the correct API URL:
   ```
   NEXT_PUBLIC_API_URL=https://upscaloro.onrender.com
   ```

2. In your Vercel dashboard:
   - Go to your project settings
   - Under "Environment Variables", verify that NEXT_PUBLIC_API_URL is set correctly
   - Redeploy the application to apply the changes

## Testing the Deployment

1. Open your browser and navigate to your Vercel domain (https://upscaloro.vercel.app)
2. Open the browser developer tools (F12) and go to the Console tab
3. Try to use the application and check for any CORS or API errors in the console
4. If you see errors, check the Network tab to see the specific requests that are failing

## Troubleshooting

If you continue to experience issues:

1. Verify that your backend is running and accessible:
   ```
   curl https://upscaloro.onrender.com/health
   ```

2. Check for CORS issues by examining the Network tab in developer tools:
   - Look for requests with status 403 or CORS errors
   - Verify that the Origin header is being sent correctly
   - Check that the Access-Control-Allow-Origin header is in the response

3. Check the logs on both Render.com and Vercel for any errors

4. If all else fails, you can temporarily disable CORS protection for testing by adding a browser extension like "CORS Unblock" 