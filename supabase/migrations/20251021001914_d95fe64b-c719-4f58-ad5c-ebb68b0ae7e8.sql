-- Adicionar campos de latitude e longitude para geolocalização
ALTER TABLE public.properties 
ADD COLUMN latitude NUMERIC(10, 8),
ADD COLUMN longitude NUMERIC(11, 8);

-- Criar índice para melhorar performance de buscas por localização
CREATE INDEX idx_properties_location_coords ON public.properties(latitude, longitude);

-- Comentários para documentação
COMMENT ON COLUMN public.properties.latitude IS 'Latitude do imóvel (formato decimal)';
COMMENT ON COLUMN public.properties.longitude IS 'Longitude do imóvel (formato decimal)';