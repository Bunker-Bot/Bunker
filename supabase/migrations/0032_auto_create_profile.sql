-- Migration 0032: Auto-create Profile Trigger for New Auth Users
-- Ensures new users signing up via Supabase Auth automatically receive a profile & admin privileges

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1), 'Admin'),
    COALESCE(new.email, 'admin@bunker.internal'),
    'admin'
  )
  ON CONFLICT (id) DO UPDATE
  SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email;

  RETURN new;
END;
$$;

-- Trigger on auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Ensure profiles RLS allows authenticated users to view and edit their own profile
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Backfill missing profiles for existing auth users if any
INSERT INTO public.profiles (id, full_name, email, role)
SELECT
  id,
  COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1), 'Admin'),
  COALESCE(email, 'admin@bunker.internal'),
  'admin'
FROM auth.users
ON CONFLICT (id) DO NOTHING;
