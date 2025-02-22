/*
  # Initial Schema Setup for Civic Complaint System

  1. New Tables
    - users (managed by Supabase Auth)
    - complaints
      - id (uuid, primary key)
      - user_id (uuid, references auth.users)
      - description (text)
      - category (text)
      - urgency_score (float)
      - status (text)
      - officer_id (uuid, references auth.users)
      - worker_id (uuid, references auth.users)
      - created_at (timestamp)
      - updated_at (timestamp)
    - officers
      - id (uuid, references auth.users)
      - department (text)
    - workers
      - id (uuid, references auth.users)
      - department (text)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create custom types
CREATE TYPE user_role AS ENUM ('citizen', 'officer', 'worker');
CREATE TYPE complaint_status AS ENUM ('pending', 'endorsed', 'ongoing', 'closed');
CREATE TYPE department_type AS ENUM ('water', 'electricity', 'roads', 'sanitation', 'other');

-- Create complaints table
CREATE TABLE IF NOT EXISTS complaints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  description text NOT NULL,
  category department_type NOT NULL,
  urgency_score float DEFAULT 0,
  status complaint_status DEFAULT 'pending',
  officer_id uuid REFERENCES auth.users,
  worker_id uuid REFERENCES auth.users,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create officers table
CREATE TABLE IF NOT EXISTS officers (
  id uuid PRIMARY KEY REFERENCES auth.users,
  department department_type NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create workers table
CREATE TABLE IF NOT EXISTS workers (
  id uuid PRIMARY KEY REFERENCES auth.users,
  department department_type NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE officers ENABLE ROW LEVEL SECURITY;
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;

-- Policies for complaints
CREATE POLICY "Users can view their own complaints"
  ON complaints
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Officers can view all complaints"
  ON complaints
  FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM officers WHERE officers.id = auth.uid()));

CREATE POLICY "Users can create complaints"
  ON complaints
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Officers can update complaints"
  ON complaints
  FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM officers WHERE officers.id = auth.uid()));

-- Policies for officers
CREATE POLICY "Officers can view officer data"
  ON officers
  FOR SELECT
  TO authenticated
  USING (true);

-- Policies for workers
CREATE POLICY "Workers can view worker data"
  ON workers
  FOR SELECT
  TO authenticated
  USING (true);

-- Function to update complaint status
CREATE OR REPLACE FUNCTION update_complaint_status(
  complaint_id uuid,
  new_status complaint_status,
  officer uuid DEFAULT NULL,
  worker uuid DEFAULT NULL
)
RETURNS complaints
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE complaints
  SET 
    status = new_status,
    officer_id = COALESCE(officer, officer_id),
    worker_id = COALESCE(worker, worker_id),
    updated_at = now()
  WHERE id = complaint_id
  RETURNING *;
  
  RETURN NULL;
END;
$$;