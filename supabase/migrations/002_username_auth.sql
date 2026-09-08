-- ==============================================================================
-- STUDY TRACKER & PERSONAL GROWTH DASHBOARD (ASCEND // STUDY OS)
-- SUPABASE POSTGRESQL SCHEMA MIGRATION 002: USERNAME AUTHENTICATION
-- ==============================================================================

-- 1. Add username and email columns to public.profiles if not existing
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- 2. Create case-insensitive unique index on username
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_username_lower ON public.profiles(LOWER(username));

-- 3. Policy to allow public lookup of username to email during login
DO $
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Allow public username lookup for login'
  ) THEN
    CREATE POLICY "Allow public username lookup for login" ON public.profiles FOR SELECT USING (true);
  END IF;
END $;

-- 4. Secure RPC function to lookup email by username directly from auth.users metadata or profiles
CREATE OR REPLACE FUNCTION public.get_email_by_username(username_input text)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT email FROM auth.users 
  WHERE LOWER(raw_user_meta_data->>'username') = LOWER(TRIM(username_input)) 
     OR LOWER(email) = LOWER(TRIM(username_input))
  LIMIT 1;
$$;

-- Grant execution to anon (unauthenticated users trying to sign in) and authenticated
GRANT EXECUTE ON FUNCTION public.get_email_by_username(text) TO anon, authenticated, service_role;
