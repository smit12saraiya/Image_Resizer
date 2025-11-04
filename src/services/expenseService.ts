import { supabase } from '../lib/supabase';

const N8N_WEBHOOK_URL = 'https://smit12saraiya.app.n8n.cloud/webhook-test/3f1bc798-8510-4dbb-8240-2666baa570e5';

export async function uploadExpenseDocument(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 120000);

  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error('Failed to process document');
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timed out after 2 minutes. Please try again or check if your workflow is taking too long to process.');
    }
    throw error;
  }
}

export async function saveExpenseToDatabase(expenseData: any, userId: string) {
  const expense = Array.isArray(expenseData) ? expenseData[0] : expenseData;
  const totalAmount = expense.total_amount || expense.total ||
    (expense.subtotal || 0) + (expense.tax_amount || expense.tax || 0);

  const vendorName = expense.vendor_name || expense.store_name || expense.restaurant_name;
  const date = expense.date || expense.receipt_date;
  const taxAmount = expense.tax_amount || expense.tax;
  const currency = expense.currency || expense.Currency || '$';

  const { data, error } = await supabase
    .from('receipts')
    .insert({
      user_id: userId,
      category: expense.category,
      source: expense.source || 'Webhook/Form',
      status: expense.status || 'PROCESSED',
      vendor_name: vendorName,
      date: date,
      due_date: expense.due_date,
      image_url: expense.image_url,
      items: expense.items,
      subtotal: expense.subtotal,
      tax_amount: taxAmount,
      total_amount: totalAmount,
      currency: currency,
      payment_terms: expense.payment_terms,
      tags: expense.tags,
      raw_data: expense,
    })
    .select()
    .single();

  if (error) {
    console.error('Database error:', error);
    throw new Error('Failed to save expense to database');
  }

  return data;
}

export async function getAllExpenses() {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Database error:', error);
    throw new Error('Failed to fetch expenses');
  }

  return data || [];
}
