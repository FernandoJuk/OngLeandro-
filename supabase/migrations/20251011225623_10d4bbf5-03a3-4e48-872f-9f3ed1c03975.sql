-- Adicionar campos para controle de repasse na tabela bookings
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS payout_status TEXT DEFAULT 'pending' CHECK (payout_status IN ('pending', 'ready', 'processing', 'completed', 'failed')),
ADD COLUMN IF NOT EXISTS payout_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS payout_amount NUMERIC,
ADD COLUMN IF NOT EXISTS payout_notes TEXT;