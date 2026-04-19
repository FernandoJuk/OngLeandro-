-- Add cancellation policy level to properties table
ALTER TABLE public.properties 
ADD COLUMN cancellation_policy_level INTEGER DEFAULT 2 CHECK (cancellation_policy_level >= 0 AND cancellation_policy_level <= 3);

COMMENT ON COLUMN public.properties.cancellation_policy_level IS 'Cancellation policy level: 0=No flexibility, 1=Low flexibility, 2=Moderate flexibility, 3=Maximum flexibility';