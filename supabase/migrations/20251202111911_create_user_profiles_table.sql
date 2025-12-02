/*
  # Create User Profiles Table

  1. New Tables
    - `user_profiles`
      - `id` (uuid, primary key) - References auth.users.id
      - `name` (text) - User's full name
      - `address` (text) - User's address
      - `age` (integer) - User's age
      - `phone_number` (text) - User's phone number
      - `created_at` (timestamptz) - Profile creation timestamp
      - `updated_at` (timestamptz) - Profile update timestamp

  2. Security
    - Enable RLS on `user_profiles` table
    - Add policy for users to read their own profile
    - Add policy for users to insert their own profile
    - Add policy for users to update their own profile

  3. Important Notes
    - Email is stored in auth.users table by Supabase
    - This table stores additional profile information
    - Each user can only access and modify their own profile
*/

CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  address text NOT NULL,
  age integer NOT NULL CHECK (age >= 18 AND age <= 120),
  phone_number text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to call the function
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();