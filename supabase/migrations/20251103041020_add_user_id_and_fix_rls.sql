/*
  # Add user_id and fix RLS policies for authenticated users

  1. Changes
    - Add `user_id` column to expenses table
    - Add foreign key constraint to auth.users
    - Update RLS policies to allow authenticated users to manage their own expenses
    
  2. Security
    - Remove public policies (anon access)
    - Add authenticated user policies:
      - Users can read their own expenses
      - Users can insert their own expenses
      - Users can update their own expenses
      - Users can delete their own expenses
*/

-- Add user_id column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'expenses' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE expenses ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Drop old policies
DROP POLICY IF EXISTS "Allow public read access to expenses" ON expenses;
DROP POLICY IF EXISTS "Allow public insert access to expenses" ON expenses;

-- Create new policies for authenticated users
CREATE POLICY "Users can read own expenses"
  ON expenses
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own expenses"
  ON expenses
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own expenses"
  ON expenses
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own expenses"
  ON expenses
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create index on user_id for better query performance
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
