-- Adicionar políticas para admins visualizarem todos os dados

-- Bookings: Admins podem ver todas as reservas
CREATE POLICY "Admins can view all bookings" 
ON public.bookings 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Properties: Já tem política pública, mas vamos garantir acesso admin completo
CREATE POLICY "Admins can view all properties" 
ON public.properties 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Profiles: Admins podem ver todos os perfis
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Favorites: Admins podem ver todos os favoritos
CREATE POLICY "Admins can view all favorites" 
ON public.favorites 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Reviews: Já tem política pública, mas garantindo acesso admin
CREATE POLICY "Admins can view all reviews" 
ON public.reviews 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Payout methods: Admins podem ver todos os métodos de pagamento
CREATE POLICY "Admins can view all payout methods" 
ON public.payout_methods 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));