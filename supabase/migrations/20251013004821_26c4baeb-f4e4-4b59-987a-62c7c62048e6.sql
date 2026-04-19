-- Adicionar coluna para valor líquido do proprietário
ALTER TABLE public.bookings 
ADD COLUMN owner_net_amount NUMERIC;

-- Atualizar valores existentes
UPDATE public.bookings 
SET owner_net_amount = total_price - COALESCE(platform_fee_amount, 0)
WHERE owner_net_amount IS NULL;

-- Criar trigger para calcular automaticamente o valor líquido do proprietário
CREATE OR REPLACE FUNCTION public.calculate_owner_net_amount()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.total_price IS NOT NULL AND NEW.platform_fee_amount IS NOT NULL THEN
    NEW.owner_net_amount := NEW.total_price - NEW.platform_fee_amount;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_owner_net_amount
BEFORE INSERT OR UPDATE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.calculate_owner_net_amount();