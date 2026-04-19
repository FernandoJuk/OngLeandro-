-- Fix security warnings by setting search_path on functions that don't have it

-- Fix update_guest_price function
CREATE OR REPLACE FUNCTION public.update_guest_price()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.net_amount IS NOT NULL AND NEW.host_fee_percentage IS NOT NULL THEN
    NEW.calculated_guest_price := public.calculate_guest_price(NEW.net_amount, NEW.host_fee_percentage);
  END IF;
  RETURN NEW;
END;
$function$;

-- Fix lock_booking_fees function
CREATE OR REPLACE FUNCTION public.lock_booking_fees()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_property RECORD;
  v_service_fee NUMERIC;
BEGIN
  -- Quando status mudar para 'confirmed', bloquear as taxas
  IF NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status != 'confirmed') THEN
    -- Buscar dados da propriedade
    SELECT net_amount, host_fee_percentage, calculated_guest_price
    INTO v_property
    FROM public.properties
    WHERE id = NEW.property_id;
    
    -- Buscar taxa de serviço da plataforma
    SELECT setting_value::NUMERIC INTO v_service_fee
    FROM public.platform_settings
    WHERE setting_key = 'service_fee_percentage';
    
    -- Bloquear as taxas no booking
    NEW.fee_locked := true;
    NEW.service_fee_percentage := v_service_fee;
    NEW.host_fee_percentage := v_property.host_fee_percentage;
    NEW.guest_fee_percentage := v_service_fee - v_property.host_fee_percentage;
    NEW.platform_fee_amount := v_property.net_amount * (v_service_fee / 100);
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Fix handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, user_type)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'guest')
  );
  RETURN NEW;
END;
$function$;