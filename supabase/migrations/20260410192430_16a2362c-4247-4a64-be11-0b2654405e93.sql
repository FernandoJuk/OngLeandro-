-- Add ONG-specific fields to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS cnpj text,
ADD COLUMN IF NOT EXISTS operating_hours text,
ADD COLUMN IF NOT EXISTS cause_description text,
ADD COLUMN IF NOT EXISTS location_photos text[];

-- Add clothing donation fields to properties
ALTER TABLE public.properties
ADD COLUMN IF NOT EXISTS clothing_types text[],
ADD COLUMN IF NOT EXISTS urgency text DEFAULT 'media',
ADD COLUMN IF NOT EXISTS quantity_needed integer,
ADD COLUMN IF NOT EXISTS sizes_needed text[],
ADD COLUMN IF NOT EXISTS is_fulfilled boolean DEFAULT false;