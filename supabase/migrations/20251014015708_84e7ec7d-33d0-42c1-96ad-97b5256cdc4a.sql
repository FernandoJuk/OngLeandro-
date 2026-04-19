-- Atualizar função para buscar porcentagem dinamicamente das configurações
CREATE OR REPLACE FUNCTION calculate_booking_fees()
RETURNS TRIGGER AS $$
DECLARE
  v_service_fee_percentage NUMERIC;
BEGIN
  -- Buscar taxa de serviço configurada pelo admin
  SELECT setting_value::NUMERIC INTO v_service_fee_percentage
  FROM public.platform_settings
  WHERE setting_key = 'service_fee_percentage';
  
  -- Se não encontrar, usar 10% como fallback
  IF v_service_fee_percentage IS NULL THEN
    v_service_fee_percentage := 10;
  END IF;
  
  -- Calcular taxa da plataforma e valor líquido do proprietário
  NEW.platform_fee_amount := NEW.total_price * (v_service_fee_percentage / 100);
  NEW.owner_net_amount := NEW.total_price * (1 - (v_service_fee_percentage / 100));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Recalcular valores existentes com a taxa configurada
UPDATE bookings 
SET 
  platform_fee_amount = total_price * ((SELECT setting_value::NUMERIC FROM platform_settings WHERE setting_key = 'service_fee_percentage') / 100),
  owner_net_amount = total_price * (1 - ((SELECT setting_value::NUMERIC FROM platform_settings WHERE setting_key = 'service_fee_percentage') / 100))
WHERE status = 'confirmed';