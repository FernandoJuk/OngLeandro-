-- Adicionar configurações de taxas de cartão
INSERT INTO public.platform_settings (setting_key, setting_value, description)
VALUES 
  ('credit_card_fee_percentage', '3', 'Taxa percentual de cartão de crédito'),
  ('debit_card_fee_percentage', '2', 'Taxa percentual de cartão de débito')
ON CONFLICT (setting_key) DO NOTHING;

-- Adicionar campos de controle de pagamento ao anfitrião na tabela bookings
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS host_payout_status TEXT DEFAULT 'pending_release' CHECK (host_payout_status IN ('pending_release', 'pending', 'paid')),
ADD COLUMN IF NOT EXISTS host_payout_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS host_payout_proof_url TEXT,
ADD COLUMN IF NOT EXISTS payment_method_fee_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS platform_net_fee_amount NUMERIC DEFAULT 0;

COMMENT ON COLUMN public.bookings.host_payout_status IS 'Status do pagamento ao anfitrião: pending_release (antes de 24h do check-in), pending (liberado para pagamento), paid (pago)';
COMMENT ON COLUMN public.bookings.host_payout_date IS 'Data em que o pagamento foi feito ao anfitrião';
COMMENT ON COLUMN public.bookings.host_payout_proof_url IS 'URL do comprovante de pagamento ao anfitrião';
COMMENT ON COLUMN public.bookings.payment_method_fee_amount IS 'Taxa cobrada pelo método de pagamento (cartão crédito/débito)';
COMMENT ON COLUMN public.bookings.platform_net_fee_amount IS 'Taxa líquida que a plataforma recebe (taxa bruta - taxa do método de pagamento)';

-- Criar storage bucket para comprovantes de pagamento
INSERT INTO storage.buckets (id, name, public)
VALUES ('payout-proofs', 'payout-proofs', false)
ON CONFLICT (id) DO NOTHING;

-- RLS para bucket de comprovantes (apenas admins)
CREATE POLICY "Admins can upload payout proofs"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'payout-proofs' AND
  (SELECT has_role(auth.uid(), 'admin'::app_role))
);

CREATE POLICY "Admins can view payout proofs"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'payout-proofs' AND
  (SELECT has_role(auth.uid(), 'admin'::app_role))
);