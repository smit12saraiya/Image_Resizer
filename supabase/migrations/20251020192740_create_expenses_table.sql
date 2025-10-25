/*
  # Create expenses table for multi-channel expense tracker

  1. New Tables
    - `expenses`
      - `id` (uuid, primary key)
      - `category` (text) - Document type (INVOICE, RESTAURANT_RECEIPT, etc.)
      - `source` (text) - Where the document came from (Webhook/Form, Telegram, etc.)
      - `status` (text) - Processing status
      - `vendor_name` (text) - Vendor or restaurant name
      - `date` (text) - Transaction date
      - `due_date` (text) - Due date for invoices
      - `image_url` (text) - Google Drive public URL
      - `items` (text) - Line items details
      - `subtotal` (numeric) - Subtotal amount
      - `tax_amount` (numeric) - Tax amount
      - `total_amount` (numeric) - Total amount
      - `currency` (text) - Currency symbol
      - `payment_terms` (text) - Payment terms
      - `tags` (text) - Tags for categorization
      - `raw_data` (jsonb) - Store complete response from n8n
      - `created_at` (timestamptz) - When record was created
      
  2. Security
    - Enable RLS on `expenses` table
    - Add policy for public read access (auth will be added later)
    - Add policy for public insert access (auth will be added later)
*/

CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  source text DEFAULT 'Webhook/Form',
  status text DEFAULT 'PROCESSED',
  vendor_name text,
  date text,
  due_date text,
  image_url text,
  items text,
  subtotal numeric,
  tax_amount numeric,
  total_amount numeric,
  currency text DEFAULT '$',
  payment_terms text,
  tags text,
  raw_data jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to expenses"
  ON expenses
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow public insert access to expenses"
  ON expenses
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_created_at ON expenses(created_at DESC);