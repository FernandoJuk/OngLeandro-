-- Create table for blocked dates
CREATE TABLE IF NOT EXISTS public.blocked_dates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT NOT NULL CHECK (reason IN ('personal_use', 'maintenance', 'external_booking', 'other')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT valid_date_range CHECK (end_date >= start_date)
);

-- Enable RLS
ALTER TABLE public.blocked_dates ENABLE ROW LEVEL SECURITY;

-- Policy: Property owners can view their own blocked dates
CREATE POLICY "Property owners can view their blocked dates"
ON public.blocked_dates
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.properties
    WHERE properties.id = blocked_dates.property_id
    AND properties.user_id = auth.uid()
  )
);

-- Policy: Property owners can create blocked dates
CREATE POLICY "Property owners can create blocked dates"
ON public.blocked_dates
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.properties
    WHERE properties.id = blocked_dates.property_id
    AND properties.user_id = auth.uid()
  )
);

-- Policy: Property owners can delete their blocked dates
CREATE POLICY "Property owners can delete blocked dates"
ON public.blocked_dates
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.properties
    WHERE properties.id = blocked_dates.property_id
    AND properties.user_id = auth.uid()
  )
);

-- Policy: Admins can view all blocked dates
CREATE POLICY "Admins can view all blocked dates"
ON public.blocked_dates
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for better query performance
CREATE INDEX idx_blocked_dates_property_id ON public.blocked_dates(property_id);
CREATE INDEX idx_blocked_dates_date_range ON public.blocked_dates(start_date, end_date);

-- Trigger to update updated_at
CREATE TRIGGER update_blocked_dates_updated_at
BEFORE UPDATE ON public.blocked_dates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update the available_properties function to consider blocked dates
CREATE OR REPLACE FUNCTION public.available_properties(check_in date, check_out date)
RETURNS TABLE(id uuid)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT p.id
  FROM public.properties p
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.bookings b
    WHERE b.property_id = p.id
      AND b.status IN ('confirmed', 'pending')
      AND (b.check_in_date, b.check_out_date) OVERLAPS (check_in, check_out)
  )
  AND NOT EXISTS (
    SELECT 1
    FROM public.blocked_dates bd
    WHERE bd.property_id = p.id
      AND (bd.start_date, bd.end_date) OVERLAPS (check_in, check_out)
  );
END;
$function$;