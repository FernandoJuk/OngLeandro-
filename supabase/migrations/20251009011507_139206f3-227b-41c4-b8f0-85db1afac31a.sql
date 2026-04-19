-- Ensure profiles auto-create on user signup and set user as host
-- 1) Create trigger for handle_new_user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2) Upsert profile for the specified user and set as host
INSERT INTO public.profiles (id, first_name, last_name, user_type)
SELECT id, raw_user_meta_data->>'first_name', raw_user_meta_data->>'last_name', 'host'
FROM auth.users WHERE email = 'fernando.mu@hotmail.com'
ON CONFLICT (id) DO UPDATE SET user_type = 'host';