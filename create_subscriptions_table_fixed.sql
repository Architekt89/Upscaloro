-- Create subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    plan TEXT NOT NULL,
    status TEXT NOT NULL,
    current_period_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    email TEXT,
    billing_cycle TEXT DEFAULT 'monthly',
    FOREIGN KEY (user_id) REFERENCES public.users(id)
);

-- Add RLS policies
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read their own subscriptions
CREATE POLICY "Users can read their own subscriptions" 
    ON public.subscriptions 
    FOR SELECT 
    USING (auth.uid() = user_id);

-- Create policy to allow service role to manage all subscriptions
CREATE POLICY "Service role can manage all subscriptions" 
    ON public.subscriptions 
    USING (auth.role() = 'service_role');

-- Grant permissions to authenticated users
GRANT SELECT ON public.subscriptions TO authenticated;

-- Grant all permissions to service role
GRANT ALL ON public.subscriptions TO service_role;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON public.subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON public.subscriptions(stripe_subscription_id); 