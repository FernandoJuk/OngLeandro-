-- 1. Inserir o perfil faltante para o segundo usuário
INSERT INTO public.profiles (id, first_name, last_name, user_type)
VALUES (
  'e9a12968-92f7-4a45-8e1d-2d4008e65001'::uuid,
  'Nado',
  'Cunha',
  'host'
)
ON CONFLICT (id) DO NOTHING;

-- 2. Criar bucket de storage para imagens de propriedades
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-images', 'property-images', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Criar políticas RLS para o bucket property-images
-- Permitir que qualquer pessoa veja as imagens (bucket público)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'property-images');

-- Permitir que usuários autenticados façam upload
CREATE POLICY "Authenticated users can upload property images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'property-images');

-- Permitir que usuários autenticados atualizem suas próprias imagens
CREATE POLICY "Users can update own property images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'property-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Permitir que usuários autenticados deletem suas próprias imagens
CREATE POLICY "Users can delete own property images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'property-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 4. Criar view para reservas de hosts com informações de hóspedes
CREATE OR REPLACE VIEW public.host_bookings_with_guests AS
SELECT 
  b.id,
  b.property_id,
  b.user_id as guest_id,
  b.check_in_date,
  b.check_out_date,
  b.guests as total_guests,
  b.total_price,
  b.payment_id,
  b.status,
  b.created_at,
  b.updated_at,
  p.title,
  p.city,
  p.state,
  p.images,
  p.user_id as host_id,
  pr.first_name,
  pr.last_name
FROM public.bookings b
JOIN public.properties p ON b.property_id = p.id
LEFT JOIN public.profiles pr ON b.user_id = pr.id;