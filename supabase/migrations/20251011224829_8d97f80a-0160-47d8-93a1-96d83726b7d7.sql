-- 1. Criar enum para roles de usuários
CREATE TYPE public.app_role AS ENUM ('admin', 'host', 'guest');

-- 2. Criar tabela de roles de usuários (segurança)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

-- 3. Habilitar RLS na tabela user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Criar função para verificar roles (security definer para evitar recursão)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 5. Políticas RLS para user_roles
CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- 6. Criar tabela de configurações da plataforma
CREATE TABLE public.platform_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- 7. Habilitar RLS em platform_settings
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- 8. Políticas RLS para platform_settings
CREATE POLICY "Anyone can view platform settings"
ON public.platform_settings
FOR SELECT
USING (true);

CREATE POLICY "Only admins can update platform settings"
ON public.platform_settings
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can insert platform settings"
ON public.platform_settings
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 9. Inserir configuração padrão de taxa de serviço (10%)
INSERT INTO public.platform_settings (setting_key, setting_value, description)
VALUES ('service_fee_percentage', '10', 'Porcentagem total da taxa de serviço cobrada pela plataforma');

-- 10. Adicionar campos de taxas na tabela properties
ALTER TABLE public.properties
ADD COLUMN net_amount NUMERIC,
ADD COLUMN host_fee_percentage NUMERIC DEFAULT 0 CHECK (host_fee_percentage >= 0 AND host_fee_percentage <= 100),
ADD COLUMN calculated_guest_price NUMERIC;

-- 11. Criar função para calcular preço final
CREATE OR REPLACE FUNCTION public.calculate_guest_price(
  p_net_amount NUMERIC,
  p_host_fee_percentage NUMERIC
)
RETURNS NUMERIC
LANGUAGE plpgsql
STABLE
AS $$
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
$$;

-- 12. Criar trigger para atualizar preço do hóspede automaticamente
CREATE OR REPLACE FUNCTION public.update_guest_price()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.net_amount IS NOT NULL AND NEW.host_fee_percentage IS NOT NULL THEN
    NEW.calculated_guest_price := public.calculate_guest_price(NEW.net_amount, NEW.host_fee_percentage);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_guest_price
BEFORE INSERT OR UPDATE OF net_amount, host_fee_percentage
ON public.properties
FOR EACH ROW
EXECUTE FUNCTION public.update_guest_price();

-- 13. Adicionar campo para bloquear edição de taxas em bookings confirmados
ALTER TABLE public.bookings
ADD COLUMN fee_locked BOOLEAN DEFAULT false,
ADD COLUMN service_fee_percentage NUMERIC,
ADD COLUMN host_fee_percentage NUMERIC,
ADD COLUMN guest_fee_percentage NUMERIC,
ADD COLUMN platform_fee_amount NUMERIC;

-- 14. Criar função para bloquear taxas quando booking for confirmado
CREATE OR REPLACE FUNCTION public.lock_booking_fees()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
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
$$;

CREATE TRIGGER trigger_lock_booking_fees
BEFORE INSERT OR UPDATE OF status
ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.lock_booking_fees();

-- 15. Criar trigger para atualizar updated_at em platform_settings
CREATE TRIGGER update_platform_settings_updated_at
BEFORE UPDATE ON public.platform_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();