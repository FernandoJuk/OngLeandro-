
-- Drop functions with CASCADE to handle trigger dependencies
DROP FUNCTION IF EXISTS public.update_guest_price() CASCADE;
DROP FUNCTION IF EXISTS public.update_property_rating() CASCADE;
DROP FUNCTION IF EXISTS public.calculate_booking_fees() CASCADE;
DROP FUNCTION IF EXISTS public.lock_booking_fees() CASCADE;
DROP FUNCTION IF EXISTS public.calculate_owner_net_amount() CASCADE;
DROP FUNCTION IF EXISTS public.calculate_guest_price(numeric, numeric) CASCADE;
DROP FUNCTION IF EXISTS public.get_host_bookings(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.send_review_reminder_if_needed() CASCADE;
DROP FUNCTION IF EXISTS public.available_properties(date, date) CASCADE;

-- Remove unnecessary columns from properties table
ALTER TABLE public.properties DROP COLUMN IF EXISTS price_per_night;
ALTER TABLE public.properties DROP COLUMN IF EXISTS bedrooms;
ALTER TABLE public.properties DROP COLUMN IF EXISTS bathrooms;
ALTER TABLE public.properties DROP COLUMN IF EXISTS single_beds;
ALTER TABLE public.properties DROP COLUMN IF EXISTS double_beds;
ALTER TABLE public.properties DROP COLUMN IF EXISTS max_guests;
ALTER TABLE public.properties DROP COLUMN IF EXISTS minimum_nights;
ALTER TABLE public.properties DROP COLUMN IF EXISTS self_checkin;
ALTER TABLE public.properties DROP COLUMN IF EXISTS instant_booking;
ALTER TABLE public.properties DROP COLUMN IF EXISTS cancellation_policy_level;
ALTER TABLE public.properties DROP COLUMN IF EXISTS house_rules;
ALTER TABLE public.properties DROP COLUMN IF EXISTS rating;
ALTER TABLE public.properties DROP COLUMN IF EXISTS reviews;
ALTER TABLE public.properties DROP COLUMN IF EXISTS net_amount;
ALTER TABLE public.properties DROP COLUMN IF EXISTS host_fee_percentage;
ALTER TABLE public.properties DROP COLUMN IF EXISTS calculated_guest_price;
ALTER TABLE public.properties DROP COLUMN IF EXISTS guests;
ALTER TABLE public.properties DROP COLUMN IF EXISTS user_type;
ALTER TABLE public.properties DROP COLUMN IF EXISTS property_type;
ALTER TABLE public.properties DROP COLUMN IF EXISTS amenities;
