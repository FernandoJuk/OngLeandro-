-- Remover a função antiga e recriar com booking_number
DROP FUNCTION IF EXISTS public.get_host_bookings(uuid);

CREATE OR REPLACE FUNCTION public.get_host_bookings(host_user_id uuid)
RETURNS TABLE(
  id uuid, 
  property_id uuid, 
  guest_id uuid, 
  check_in_date date, 
  check_out_date date, 
  total_guests integer, 
  total_price numeric, 
  payment_id text, 
  status text, 
  special_requests text, 
  created_at timestamp with time zone, 
  updated_at timestamp with time zone, 
  title text, 
  city text, 
  state text, 
  images text[], 
  host_id uuid, 
  first_name text, 
  last_name text,
  booking_number bigint
)
LANGUAGE sql
STABLE
SET search_path = 'public'
AS $function$
  SELECT 
    b.id,
    b.property_id,
    b.user_id as guest_id,
    b.check_in_date,
    b.check_out_date,
    b.guests as total_guests,
    b.total_price,
    b.payment_id,
    b.status,
    NULL::text as special_requests,
    b.created_at,
    b.updated_at,
    p.title,
    p.city,
    p.state,
    p.images,
    p.user_id as host_id,
    pr.first_name,
    pr.last_name,
    b.booking_number
  FROM public.bookings b
  JOIN public.properties p ON b.property_id = p.id
  LEFT JOIN public.profiles pr ON b.user_id = pr.id
  WHERE p.user_id = host_user_id;
$function$;