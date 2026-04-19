-- Add missing columns to properties table
ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS user_type TEXT DEFAULT 'guest',
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS state TEXT,
  ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Brasil',
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS property_type TEXT,
  ADD COLUMN IF NOT EXISTS max_guests INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Add missing columns to profiles table
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS user_type TEXT DEFAULT 'guest',
  ADD COLUMN IF NOT EXISTS district TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Add missing column to messages table
ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ;

-- Update existing location data to city/state if needed
UPDATE public.properties 
SET city = COALESCE(city, SPLIT_PART(location, ',', 1)),
    state = COALESCE(state, TRIM(SPLIT_PART(location, ',', 2)))
WHERE city IS NULL OR state IS NULL;

-- Create function to check property availability (for search with dates)
CREATE OR REPLACE FUNCTION public.available_properties(
  check_in DATE,
  check_out DATE
)
RETURNS TABLE (id UUID) AS $$
BEGIN
  RETURN QUERY
  SELECT p.id
  FROM public.properties p
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.bookings b
    WHERE b.property_id = p.id
      AND b.status IN ('confirmed', 'pending')
      AND (
        (b.check_in_date, b.check_out_date) OVERLAPS (check_in, check_out)
      )
  );
END;
$$ LANGUAGE plpgsql STABLE;
