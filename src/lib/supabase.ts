import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

export interface Expense {
  id?: string;
  created_at?: string;
  source: string;
  category: string;
  status?: string;
  vendor_name?: string;
  receipt_date?: string;
  receipt_time?: string;
  subtotal?: number;
  tax_amount?: number;
  tip_amount?: number;
  total_amount: number;
  currency?: string;
  payment_method?: string;
  items?: any[];
  order_number?: string;
  server_name?: string;
  table_number?: string;
  notes?: string;
  image_quality?: string;
  invoice_number?: string;
  invoice_date?: string;
  due_date?: string;
  payment_terms?: string;
  loyalty_number?: string;
  cashier?: string;
  register_number?: string;
  items_count?: string;
  image_url: string;
  file_id?: string;
  user_id?: string;
}
