-- Adicionar campo minimum_nights na tabela properties
ALTER TABLE public.properties
ADD COLUMN IF NOT EXISTS minimum_nights INTEGER DEFAULT 1;

-- Criar tabela para datas que requerem confirmação prévia
CREATE TABLE IF NOT EXISTS public.property_confirmation_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  requires_confirmation BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT valid_date_range CHECK (end_date >= start_date)
);

-- Habilitar RLS na nova tabela
ALTER TABLE public.property_confirmation_dates ENABLE ROW LEVEL SECURITY;

-- Políticas para property_confirmation_dates
CREATE POLICY "Anyone can view confirmation dates"
ON public.property_confirmation_dates
FOR SELECT
TO authenticated, anon
USING (true);

CREATE POLICY "Property owners can manage confirmation dates"
ON public.property_confirmation_dates
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.properties
    WHERE properties.id = property_confirmation_dates.property_id
    AND properties.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.properties
    WHERE properties.id = property_confirmation_dates.property_id
    AND properties.user_id = auth.uid()
  )
);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_property_confirmation_dates_updated_at
BEFORE UPDATE ON public.property_confirmation_dates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();