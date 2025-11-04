/*
  # Rename expenses table to receipts
  
  1. Changes
    - Rename the `expenses` table to `receipts`
    - All existing data, columns, RLS policies, and relationships are preserved
  
  2. Note
    - This is a simple table rename operation
    - All existing policies and foreign keys will be automatically updated
*/

ALTER TABLE expenses RENAME TO receipts;
