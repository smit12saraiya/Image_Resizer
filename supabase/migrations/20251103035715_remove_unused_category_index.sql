/*
  # Remove unused category index

  1. Changes
    - Drop the unused `idx_expenses_category` index on expenses table
    - This index is not being used by any queries and can be safely removed
  
  2. Notes
    - The `idx_expenses_created_at` index remains as it's used for fetching recent expenses
*/

DROP INDEX IF EXISTS idx_expenses_category;
