-- Fix calculate_guest_price function to add search_path
CREATE OR REPLACE FUNCTION public.calculate_guest_price(p_net_amount numeric, p_host_fee_percentage numeric)
RETURNS numeric
LANGUAGE plpgsql
STABLE
SET search_path TO 'public'
AS $function$
DECLARE
  v_service_fee_percentage NUMERIC;
  v_guest_fee_percentage NUMERIC;
  v_host_fee_amount NUMERIC;
  v_guest_price NUMERIC;
BEGIN
  -- Buscar taxa de serviço da plataforma
  SELECT setting_value::NUMERIC INTO v_service_fee_percentage
  FROM public.platform_settings
  WHERE setting_key = 'service_fee_percentage';
  
  -- Se não encontrar, usar 10% como padrão
  IF v_service_fee_percentage IS NULL THEN
    v_service_fee_percentage := 10;
  END IF;
  
  -- Calcular quanto o anfitrião paga da taxa
  v_host_fee_amount := p_net_amount * (p_host_fee_percentage / 100);
  
  -- O hóspede paga: valor líquido + taxa do anfitrião + restante da taxa de serviço
  v_guest_fee_percentage := v_service_fee_percentage - p_host_fee_percentage;
  v_guest_price := p_net_amount + v_host_fee_amount + (p_net_amount * (v_guest_fee_percentage / 100));
  
  RETURN ROUND(v_guest_price, 2);
END;
$function$;