-- Permite que todos vejam perfis públicos de anfitriões
CREATE POLICY "Public profiles are viewable by everyone"
ON public.profiles
FOR SELECT
USING (true);