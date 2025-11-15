import { supabase } from '../lib/supabase';

const N8N_WEBHOOK_URL = 'https://smit12saraiya.app.n8n.cloud/webhook/3f1bc798-8510-4dbb-8240-2666baa570e5';

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
  const date = expense.date || expense.receipt_date || expense.invoice_date;
  const taxAmount = expense.tax_amount || expense.tax;
  const currency = expense.currency || expense.Currency || '$';
  const due_date = expense.due_date || '';
  const server_name = expense.server_name || '';
  const order_number = expense.order_number || '';
  const confidence_score = expense.confidence_score || '';

  const { data, error } = await supabase
    .from('receipts')
    .insert({
      user_id: userId,
      category: expense.category,
      source: expense.source || 'Webhook/Form',
      status: expense.status || 'PROCESSED',
      vendor_name: vendorName,
      receipt_date: date,
      due_date: expense.due_date,
      image_url: expense.image_url,
      server_name: server_name,
      items: expense.items,
      order_number: order_number,
      confidence_score: confidence_score,
      invoice_date: date,
      subtotal: expense.subtotal,
      tax_amount: taxAmount,
      total_amount: totalAmount,
      currency: currency,
      payment_terms: expense.payment_terms,
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
    .from('receipts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Database error:', error);
    throw new Error('Failed to fetch expenses');
  }

  return data || [];
}

export async function deleteExpense(expenseId: string) {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('receipts')
    .delete()
    .eq('id', expenseId)
    .eq('user_id', user.id);

  if (error) {
    console.error('Database error:', error);
    throw new Error('Failed to delete receipt');
  }
}

export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Database error:', error);
    throw new Error('Failed to fetch user profile');
  }

  // If profile doesn't exist, create it
  if (!data) {
    const { data: newProfile, error: insertError } = await supabase
      .from('user_profiles')
      .insert({
        user_id: userId,
        upload_count: 0,
        has_paid: false
      })
      .select()
      .single();

    if (insertError) {
      console.error('Database error:', insertError);
      throw new Error('Failed to create user profile');
    }

    return newProfile;
  }

  return data;
}

export async function checkUploadLimit(userId: string): Promise<{ canUpload: boolean; uploadCount: number; hasReachedLimit: boolean }> {
  const profile = await getUserProfile(userId);
  const FREE_UPLOAD_LIMIT = 4;

  const canUpload = profile.has_paid || profile.upload_count < FREE_UPLOAD_LIMIT;
  const hasReachedLimit = !profile.has_paid && profile.upload_count >= FREE_UPLOAD_LIMIT;

  return {
    canUpload,
    uploadCount: profile.upload_count,
    hasReachedLimit
  };
}

export async function incrementUploadCount(userId: string) {
  const profile = await getUserProfile(userId);

  const { error } = await supabase
    .from('user_profiles')
    .update({ upload_count: profile.upload_count + 1 })
    .eq('user_id', userId);

  if (error) {
    console.error('Database error:', error);
    throw new Error('Failed to update upload count');
  }
}
