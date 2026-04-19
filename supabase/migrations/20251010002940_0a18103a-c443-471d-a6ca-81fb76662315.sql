-- Add mp_idempotency_key column to bookings table for Mercado Pago webhook tracking
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS mp_idempotency_key text;

-- Add index for faster webhook lookups
CREATE INDEX IF NOT EXISTS idx_bookings_mp_idempotency_key 
ON public.bookings(mp_idempotency_key);