-- Adicionar campo para suspensão de usuários
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS suspension_reason TEXT;

-- Criar índice para melhorar performance
CREATE INDEX IF NOT EXISTS idx_profiles_is_suspended ON public.profiles(is_suspended);

-- Adicionar configuração de senha extra para admin
INSERT INTO public.platform_settings (setting_key, setting_value, description)
VALUES ('admin_extra_password', '', 'Senha extra para acessar o painel administrativo')
ON CONFLICT (setting_key) DO NOTHING;

-- Comentários nas colunas
COMMENT ON COLUMN public.profiles.is_suspended IS 'Indica se o usuário está suspenso';
COMMENT ON COLUMN public.profiles.suspended_at IS 'Data e hora da suspensão';
COMMENT ON COLUMN public.profiles.suspension_reason IS 'Motivo da suspensão do usuário';