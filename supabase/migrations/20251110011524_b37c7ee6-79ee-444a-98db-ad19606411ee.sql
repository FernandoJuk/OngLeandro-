-- Adicionar coluna para controlar se o lembrete de avaliação foi enviado
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS review_reminder_sent BOOLEAN DEFAULT FALSE;

-- Criar função para enviar lembrete de avaliação
CREATE OR REPLACE FUNCTION public.send_review_reminder_if_needed()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  booking_record RECORD;
BEGIN
  -- Buscar reservas confirmadas com checkout passado, sem avaliação e sem lembrete enviado
  FOR booking_record IN
    SELECT b.id, b.check_out_date
    FROM public.bookings b
    WHERE b.status = 'confirmed'
      AND b.check_out_date < CURRENT_DATE
      AND b.review_reminder_sent = FALSE
      AND NOT EXISTS (
        SELECT 1 FROM public.reviews r 
        WHERE r.booking_id = b.id
      )
  LOOP
    -- Chamar edge function para enviar e-mail (isso seria feito via HTTP, aqui apenas marcamos como enviado)
    -- A chamada real será feita pelo backend
    RAISE NOTICE 'Lembrete necessário para booking: %', booking_record.id;
  END LOOP;
END;
$$;

-- Criar índice para melhorar performance da busca de lembretes
CREATE INDEX IF NOT EXISTS idx_bookings_review_reminder 
ON public.bookings(status, check_out_date, review_reminder_sent)
WHERE status = 'confirmed' AND review_reminder_sent = FALSE;