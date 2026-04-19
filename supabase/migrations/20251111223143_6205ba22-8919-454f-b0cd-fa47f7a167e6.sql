-- Permitir que usuários excluam suas próprias solicitações de reserva
CREATE POLICY "Users can delete own booking requests"
ON public.booking_requests
FOR DELETE
USING (auth.uid() = user_id);