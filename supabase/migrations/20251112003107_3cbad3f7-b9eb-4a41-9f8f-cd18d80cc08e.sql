-- Adicionar política RLS para permitir que todos vejam datas bloqueadas
-- Isso é necessário para que o calendário de reservas mostre corretamente as datas indisponíveis

CREATE POLICY "Anyone can view blocked dates"
ON public.blocked_dates
FOR SELECT
USING (true);