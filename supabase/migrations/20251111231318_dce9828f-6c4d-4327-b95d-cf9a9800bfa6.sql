-- Remove a política perigosa que expõe todos os dados publicamente
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Permite que anfitriões vejam perfis de hóspedes que fizeram reservas em suas propriedades
CREATE POLICY "Hosts can view guest profiles from their bookings"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.bookings b
    JOIN public.properties p ON b.property_id = p.id
    WHERE p.user_id = auth.uid()
      AND b.user_id = profiles.id
  )
);

-- Permite que hóspedes vejam perfis de anfitriões de propriedades que reservaram
CREATE POLICY "Guests can view host profiles from their bookings"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.bookings b
    JOIN public.properties p ON b.property_id = p.id
    WHERE b.user_id = auth.uid()
      AND p.user_id = profiles.id
  )
);

-- Permite que usuários vejam informações básicas de anfitriões de propriedades ativas
-- (necessário para mostrar info do host nas páginas de propriedades)
CREATE POLICY "Anyone can view host profiles of active properties"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.properties p
    WHERE p.user_id = profiles.id
      AND p.is_active = true
  )
);