-- Adicionar colunas financeiras detalhadas à tabela bookings
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS valor_liquido_proprietario NUMERIC,
ADD COLUMN IF NOT EXISTS taxa_proprietario_valor NUMERIC,
ADD COLUMN IF NOT EXISTS taxa_hospede_valor NUMERIC;

-- Adicionar comentários para documentação
COMMENT ON COLUMN public.bookings.valor_liquido_proprietario IS 'Valor final que o proprietário recebe após descontar sua parte da taxa';
COMMENT ON COLUMN public.bookings.taxa_proprietario_valor IS 'Valor absoluto da taxa paga pelo proprietário';
COMMENT ON COLUMN public.bookings.taxa_hospede_valor IS 'Valor absoluto da taxa paga pelo hóspede';

-- Nota: Os percentuais já existem nas colunas:
-- - service_fee_percentage (taxa total da plataforma/admin na época)
-- - host_fee_percentage (percentual do proprietário)
-- - guest_fee_percentage (percentual do hóspede)