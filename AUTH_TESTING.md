# Instructions for Testing Authentication

## Prerequisites

1. Make sure you have set up your environment variables correctly:
   - `SUPABASE_JWT_SECRET` in your backend/.env file
   - `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in your frontend/.env file

2. Run the environment synchronization script to ensure all variables are properly set:
   ```bash
   ./setup_env.sh
   ```

## Testing Steps

1. Start the backend server:
   ```bash
   cd backend
   source venv/bin/activate
   uvicorn main:app --reload --log-level=info
   ```

2. Start the frontend development server:
   ```bash
   cd frontend
   npm run dev
   ```

3. Open your browser and navigate to http://localhost:3000

4. Sign up or log in using the authentication forms

5. Try to access the dashboard or upload an image - these actions require authentication

6. Check the backend logs for authentication success messages like:
   ```
   Successfully decoded Supabase token for user: [user-id]
   ```

## Troubleshooting

If you encounter authentication issues:

1. Verify that the `SUPABASE_JWT_SECRET` in your backend/.env matches the JWT secret from your Supabase project settings

2. Check that the frontend is correctly sending the authorization header with requests:
   - The `api.ts` utility should automatically include the token
   - You can verify this using browser developer tools in the Network tab

3. Ensure your Supabase project has the correct security settings:
   - Row-level security (RLS) policies are properly configured
   - Authentication is enabled for your project

4. If you're still having issues, try clearing your browser's local storage and cookies, then log in again
