-- Corrigir search_path da função para segurança
CREATE OR REPLACE FUNCTION public.calculate_owner_net_amount()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.total_price IS NOT NULL AND NEW.platform_fee_amount IS NOT NULL THEN
    NEW.owner_net_amount := NEW.total_price - NEW.platform_fee_amount;
  END IF;
  RETURN NEW;
END;
$$;