-- Atualizar valores existentes de platform_fee_amount e owner_net_amount
UPDATE bookings 
SET 
  platform_fee_amount = total_price * 0.10,
  owner_net_amount = total_price * 0.90
WHERE status = 'confirmed' AND (
  platform_fee_amount != total_price * 0.10 OR 
  owner_net_amount != total_price * 0.90
);

-- Criar função para calcular automaticamente as taxas
CREATE OR REPLACE FUNCTION calculate_booking_fees()
RETURNS TRIGGER AS $$
BEGIN
  -- Calcular taxa da plataforma (10%) e valor líquido do proprietário (90%)
  NEW.platform_fee_amount := NEW.total_price * 0.10;
  NEW.owner_net_amount := NEW.total_price * 0.90;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para calcular taxas automaticamente
DROP TRIGGER IF EXISTS calculate_fees_on_booking ON bookings;
CREATE TRIGGER calculate_fees_on_booking
  BEFORE INSERT OR UPDATE OF total_price ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION calculate_booking_fees();