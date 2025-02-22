/*
  # Fix Authentication and Role Management

  1. Changes
    - Add department selection for officers and workers
    - Update role assignment function
    - Add department assignment function
    - Improve profile management
    - Fix email confirmation handling

  2. Security
    - Update RLS policies for better role management
    - Add validation for role-department combinations
*/

-- Create function to validate role and department
CREATE OR REPLACE FUNCTION public.validate_role_department()
RETURNS TRIGGER AS $$
BEGIN
  -- Only officers and workers need departments
  IF NEW.role IN ('officer', 'worker') AND NEW.department IS NULL THEN
    RAISE EXCEPTION 'Department is required for officers and workers';
  END IF;

  -- Citizens should not have departments
  IF NEW.role = 'citizen' AND NEW.department IS NOT NULL THEN
    NEW.department = NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add trigger for role-department validation
DROP TRIGGER IF EXISTS validate_role_department_trigger ON profiles;
CREATE TRIGGER validate_role_department_trigger
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION validate_role_department();

-- Update profile management function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role user_role;
  user_department department_type;
BEGIN
  -- Extract role and department from metadata
  user_role := COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'citizen'::user_role);
  
  -- Only set department for officers and workers
  IF user_role IN ('officer', 'worker') THEN
    user_department := COALESCE((NEW.raw_user_meta_data->>'department')::department_type, NULL);
    IF user_department IS NULL THEN
      RAISE EXCEPTION 'Department is required for officers and workers';
    END IF;
  END IF;

  -- Create profile
  INSERT INTO profiles (
    user_id,
    full_name,
    role,
    department,
    last_seen
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
    user_role,
    user_department,
    now()
  );

  -- Auto-confirm email for development
  UPDATE auth.users
  SET email_confirmed_at = now()
  WHERE id = NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update RLS policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

CREATE POLICY "Profiles are viewable by authenticated users"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id 
    AND (
      -- Keep existing role
      role = (SELECT role FROM profiles WHERE user_id = auth.uid())
      -- Keep existing department for officers and workers
      AND (
        role NOT IN ('officer', 'worker')
        OR department = (SELECT department FROM profiles WHERE user_id = auth.uid())
      )
    )
  );