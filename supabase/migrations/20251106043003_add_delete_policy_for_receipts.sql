/*
  # Add DELETE policy for receipts
  
  1. Security
    - Add RLS policy to allow authenticated users to delete their own receipts
    - Users can only delete receipts where user_id matches their auth.uid()
  
  2. Note
    - This is a restrictive policy that ensures users can only delete their own data
*/

CREATE POLICY "Users can delete own receipts"
  ON receipts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
