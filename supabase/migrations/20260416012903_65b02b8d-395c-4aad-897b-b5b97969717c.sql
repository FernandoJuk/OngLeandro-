
-- Drop all rental-related tables
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.bookings CASCADE;
DROP TABLE IF EXISTS public.booking_requests CASCADE;
DROP TABLE IF EXISTS public.special_pricing CASCADE;
DROP TABLE IF EXISTS public.blocked_dates CASCADE;
DROP TABLE IF EXISTS public.property_confirmation_dates CASCADE;
DROP TABLE IF EXISTS public.payout_methods CASCADE;

-- Drop booking number sequence
DROP SEQUENCE IF EXISTS public.bookings_booking_number_seq CASCADE;

-- Fix profiles RLS: remove policies that reference bookings
DROP POLICY IF EXISTS "Guests can view host profiles from their bookings" ON public.profiles;
DROP POLICY IF EXISTS "Hosts can view guest profiles from their bookings" ON public.profiles;

-- New policy: donors can see ONG profiles via conversations
CREATE POLICY "Users can view profiles from their conversations"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM conversations c
    WHERE (c.guest_id = auth.uid() AND c.host_id = profiles.id)
       OR (c.host_id = auth.uid() AND c.guest_id = profiles.id)
  )
);
