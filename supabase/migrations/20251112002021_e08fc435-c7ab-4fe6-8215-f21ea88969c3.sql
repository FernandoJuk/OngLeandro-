-- Adicionar número de identificação sequencial nas reservas
ALTER TABLE public.bookings 
ADD COLUMN booking_number BIGSERIAL;

-- Criar índice para facilitar buscas
CREATE INDEX idx_bookings_booking_number ON public.bookings(booking_number);

-- Atualizar reservas existentes com números sequenciais
UPDATE public.bookings 
SET booking_number = nextval('bookings_booking_number_seq')
WHERE booking_number IS NULL;