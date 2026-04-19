-- Fix search_path security warning
DROP FUNCTION IF EXISTS public.available_properties(DATE, DATE);

CREATE OR REPLACE FUNCTION public.available_properties(
  check_in DATE,
  check_out DATE
)
RETURNS TABLE (id UUID) 
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;