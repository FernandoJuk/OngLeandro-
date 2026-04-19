-- Add new columns to properties table for enhanced filtering
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS double_beds INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS single_beds INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS zip_code TEXT,
ADD COLUMN IF NOT EXISTS street_number TEXT,
ADD COLUMN IF NOT EXISTS instant_booking BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS self_checkin BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS amenities JSONB DEFAULT '[]'::jsonb;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_properties_amenities ON public.properties USING GIN(amenities);
CREATE INDEX IF NOT EXISTS idx_properties_instant_booking ON public.properties(instant_booking);
CREATE INDEX IF NOT EXISTS idx_properties_self_checkin ON public.properties(self_checkin);