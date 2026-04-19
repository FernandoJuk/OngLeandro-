-- Add RLS policy to allow property hosts to view bookings for their properties
CREATE POLICY "Property hosts can view bookings for their properties"
ON public.bookings
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM public.properties 
    WHERE properties.id = bookings.property_id 
    AND properties.user_id = auth.uid()
  )
);