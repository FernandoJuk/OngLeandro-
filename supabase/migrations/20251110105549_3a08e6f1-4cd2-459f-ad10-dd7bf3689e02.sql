-- Adicionar policy para permitir que anfitriões criem bookings para suas propriedades
CREATE POLICY "Property hosts can create bookings for their properties"
ON public.bookings
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.properties
    WHERE properties.id = bookings.property_id
    AND properties.user_id = auth.uid()
  )
);

-- Criar tabela de preços especiais por data
CREATE TABLE public.special_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  price_per_night NUMERIC NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.special_pricing ENABLE ROW LEVEL SECURITY;

-- Policies para special_pricing
CREATE POLICY "Anyone can view special pricing"
ON public.special_pricing
FOR SELECT
USING (true);

CREATE POLICY "Property owners can manage special pricing"
ON public.special_pricing
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.properties
    WHERE properties.id = special_pricing.property_id
    AND properties.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.properties
    WHERE properties.id = special_pricing.property_id
    AND properties.user_id = auth.uid()
  )
);

-- Trigger para updated_at
CREATE TRIGGER update_special_pricing_updated_at
BEFORE UPDATE ON public.special_pricing
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();