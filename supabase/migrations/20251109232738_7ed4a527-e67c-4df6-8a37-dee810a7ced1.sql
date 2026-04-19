-- Atualizar a policy de DELETE para permitir apenas exclusão de reservas não confirmadas
DROP POLICY IF EXISTS "Allow authenticated user to delete their own bookings." ON public.bookings;

CREATE POLICY "Users can delete their own non-confirmed bookings"
ON public.bookings
FOR DELETE
TO authenticated
USING (
  auth.uid() = user_id AND status != 'confirmed'
);