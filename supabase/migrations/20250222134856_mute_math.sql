/*
  # Fix authentication setup

  1. Changes
    - Add email trigger for auth.users
    - Add proper RLS policies for auth
    - Add default role assignments
*/

-- Create trigger to handle email confirmations
CREATE OR REPLACE FUNCTION public.handle_email_confirmation()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE auth.users
  SET email_confirmed_at = now()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add trigger for new users
DROP TRIGGER IF EXISTS on_auth_user_email_confirmed ON auth.users;
CREATE TRIGGER on_auth_user_email_confirmed
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_email_confirmation();

-- Update profiles RLS policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles
  FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Ensure proper role assignments
CREATE OR REPLACE FUNCTION public.assign_user_role()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (user_id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'citizen')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;