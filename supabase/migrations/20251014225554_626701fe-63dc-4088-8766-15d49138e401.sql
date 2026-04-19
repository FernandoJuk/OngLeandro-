-- Tabela para armazenar códigos de verificação
CREATE TABLE IF NOT EXISTS public.verification_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  code text NOT NULL,
  action_type text NOT NULL, -- 'password_change', 'payout_method', 'admin_password', 'admin_fee'
  action_data jsonb, -- Dados relacionados à ação (ex: novos dados de pagamento)
  attempts integer DEFAULT 0,
  blocked_until timestamp with time zone,
  used boolean DEFAULT false,
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '15 minutes'),
  created_at timestamp with time zone DEFAULT now()
);

-- Índices para melhor performance
CREATE INDEX idx_verification_codes_user_id ON public.verification_codes(user_id);
CREATE INDEX idx_verification_codes_code ON public.verification_codes(code);
CREATE INDEX idx_verification_codes_expires ON public.verification_codes(expires_at);

-- RLS
ALTER TABLE public.verification_codes ENABLE ROW LEVEL SECURITY;

-- Apenas o próprio usuário pode ver seus códigos
CREATE POLICY "Users can view own verification codes"
  ON public.verification_codes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Apenas o sistema pode inserir códigos (via edge function)
CREATE POLICY "Service role can insert codes"
  ON public.verification_codes
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Apenas o sistema pode atualizar códigos
CREATE POLICY "Service role can update codes"
  ON public.verification_codes
  FOR UPDATE
  TO service_role
  USING (true);

-- Função para limpar códigos expirados
CREATE OR REPLACE FUNCTION cleanup_expired_verification_codes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.verification_codes
  WHERE expires_at < now() OR used = true;
END;
$$;