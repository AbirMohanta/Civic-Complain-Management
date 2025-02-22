/*
  # Add user profiles and enhance complaints

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `full_name` (text)
      - `avatar_url` (text)
      - `role` (user_role)
      - `department` (department_type, for officers and workers)
      - `last_seen` (timestamptz)
      - `created_at` (timestamptz)

  2. Changes
    - Add RLS policies for profiles table
    - Add function to update last_seen timestamp
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  full_name text,
  avatar_url text,
  role user_role DEFAULT 'citizen',
  department department_type,
  last_seen timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles
  FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Function to update last_seen
CREATE OR REPLACE FUNCTION update_last_seen()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE profiles
  SET last_seen = now()
  WHERE user_id = auth.uid();
  RETURN NEW;
END;
$$;

-- Trigger to update last_seen on auth.users
CREATE OR REPLACE TRIGGER update_user_last_seen
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION update_last_seen();

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO profiles (user_id, full_name, role)
  VALUES (
    NEW.id,
    SPLIT_PART(NEW.email, '@', 1),
    'citizen'
  );
  RETURN NEW;
END;
$$;

-- Trigger for new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();