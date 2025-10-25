import { Calendar, Building2, DollarSign, FileText, Tag } from 'lucide-react';
import { Expense } from '../lib/supabase';

interface InvoiceCardProps {
  expense: Expense;
}

export function InvoiceCard({ expense }: InvoiceCardProps) {
  const totalAmount = expense.total_amount ||
    (expense.subtotal || 0) + (expense.tax_amount || 0);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-white" />
            <h3 className="text-xl font-semibold text-white">Invoice</h3>
          </div>
          <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium text-white">
            {expense.status}
          </span>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-1">
              {expense.vendor_name}
            </h4>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>{expense.date}</span>
            </div>
          </div>
          {expense.image_url && (
            <a
              href={expense.image_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
            >
              View Document
            </a>
          )}
        </div>

        {expense.due_date && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-amber-800">
              <Calendar className="w-4 h-4" />
              <span className="font-medium">Due Date:</span>
              <span>{expense.due_date}</span>
            </div>
          </div>
        )}

        {expense.items && (
          <div className="mb-6">
            <h5 className="text-sm font-semibold text-gray-700 mb-3">Items:</h5>
            <div className="bg-gray-50 rounded-lg p-4">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                {expense.items}
              </pre>
            </div>
          </div>
        )}

        <div className="border-t border-gray-200 pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-medium text-gray-900">
              {expense.currency}{expense.subtotal?.toFixed(2) || '0.00'}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tax:</span>
            <span className="font-medium text-gray-900">
              {expense.currency}{expense.tax_amount?.toFixed(2) || '0.00'}
            </span>
          </div>
          <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-200">
            <span className="text-gray-900">Total:</span>
            <span className="text-blue-600">
              {expense.currency}{totalAmount.toFixed(2)}
            </span>
          </div>
        </div>

        {expense.payment_terms && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-800">{expense.payment_terms}</p>
          </div>
        )}

        {expense.tags && (
          <div className="mt-4 flex items-center gap-2">
            <Tag className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-600">{expense.tags}</span>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <span>Source: {expense.source}</span>
          <span>{new Date(expense.created_at).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
}
