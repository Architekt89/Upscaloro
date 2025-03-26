-- Create security logs table for tracking security-related events
CREATE TABLE IF NOT EXISTS public.security_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    activity_type TEXT NOT NULL,
    data JSONB NOT NULL,
    reviewed BOOLEAN DEFAULT FALSE,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;

-- Create policy to allow service role to manage security logs
CREATE POLICY "Service role can manage security logs" 
    ON public.security_logs 
    USING (auth.role() = 'service_role');

-- Grant all permissions to service role
GRANT ALL ON public.security_logs TO service_role;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_security_logs_timestamp ON public.security_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_security_logs_activity_type ON public.security_logs(activity_type);

-- Comment on the table and columns
COMMENT ON TABLE public.security_logs IS 'Security-related events and suspicious activities';
COMMENT ON COLUMN public.security_logs.activity_type IS 'Type of security event (e.g., sensitive_endpoint_access, unauthorized_downgrade)';
COMMENT ON COLUMN public.security_logs.data IS 'JSON data containing details about the security event';
COMMENT ON COLUMN public.security_logs.reviewed IS 'Whether this security event has been reviewed by an admin'; 