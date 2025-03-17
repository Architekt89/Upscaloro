-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY,
    email TEXT,
    username TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    subscription_tier TEXT DEFAULT 'free',
    subscription_status TEXT DEFAULT 'active',
    subscription_current_period_end TIMESTAMP WITH TIME ZONE,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    images_processed_this_month INTEGER DEFAULT 0,
    total_images_processed INTEGER DEFAULT 0,
    last_login TIMESTAMP WITH TIME ZONE
);

-- Add RLS policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read their own data
CREATE POLICY "Users can read their own data" 
    ON public.users 
    FOR SELECT 
    USING (auth.uid() = id);

-- Create policy to allow users to update their own data
CREATE POLICY "Users can update their own data" 
    ON public.users 
    FOR UPDATE 
    USING (auth.uid() = id);

-- Create policy to allow service role to manage all users
CREATE POLICY "Service role can manage all users" 
    ON public.users 
    USING (auth.role() = 'service_role');

-- Grant permissions to authenticated users
GRANT SELECT, UPDATE ON public.users TO authenticated;

-- Grant all permissions to service role
GRANT ALL ON public.users TO service_role; 