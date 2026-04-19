-- Corrigir a função get_host_bookings para garantir que o total_price seja retornado
-- A função já existe e retorna o total_price, mas vamos garantir que as RLS policies 
-- permitam que o anfitrião veja o valor

-- Verificar se há política de SELECT para bookings que permita anfitriões verem suas reservas
DO $$ 
BEGIN
  -- Remover política antiga se existir
  DROP POLICY IF EXISTS "Hosts can view bookings for their properties" ON public.bookings;
  
  -- Criar nova política que permite anfitriões verem todos os dados das reservas de suas propriedades
  CREATE POLICY "Hosts can view bookings for their properties"
  ON public.bookings
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.properties p
      WHERE p.id = bookings.property_id
        AND p.user_id = auth.uid()
    )
  );
END $$;