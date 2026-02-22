
-- Create rate_limits table for tracking request rates
CREATE TABLE public.rate_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create unique index on key for upsert operations
CREATE UNIQUE INDEX idx_rate_limits_key ON public.rate_limits (key);

-- Create index on window_start for cleanup queries
CREATE INDEX idx_rate_limits_window ON public.rate_limits (window_start);

-- Enable RLS
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- No public access policies - only service role can access this table
