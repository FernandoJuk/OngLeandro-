-- Limpa todos os dados de usuários e conteúdo relacionado para reiniciar testes
DELETE FROM public.messages;
DELETE FROM public.conversations;
DELETE FROM public.favorites;
DELETE FROM public.properties;
DELETE FROM public.verification_codes;
DELETE FROM public.user_roles;
DELETE FROM public.profiles;
DELETE FROM auth.users;