import { Receipt, Calendar, Tag } from 'lucide-react';
import { Expense } from '../lib/supabase';

interface GenericExpenseCardProps {
  expense: Expense;
}

export function GenericExpenseCard({ expense }: GenericExpenseCardProps) {
  const totalAmount = expense.total_amount ||
    (expense.subtotal || 0) + (expense.tax_amount || 0);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="bg-gradient-to-r from-slate-500 to-slate-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Receipt className="w-6 h-6 text-white" />
            <h3 className="text-xl font-semibold text-white">{expense.category}</h3>
          </div>
          <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium text-white">
            {expense.status}
          </span>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            {expense.vendor_name && (
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                {expense.vendor_name}
              </h4>
            )}
            {expense.date && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>{expense.date}</span>
              </div>
            )}
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

        {expense.items && (
          <div className="mb-6">
            <h5 className="text-sm font-semibold text-gray-700 mb-3">Details:</h5>
            <div className="bg-gray-50 rounded-lg p-4">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                {expense.items}
              </pre>
            </div>
          </div>
        )}

        {(expense.subtotal || expense.tax_amount || totalAmount) && (
          <div className="border-t border-gray-200 pt-4 space-y-2">
            {expense.subtotal && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium text-gray-900">
                  {expense.currency}{expense.subtotal.toFixed(2)}
                </span>
              </div>
            )}
            {expense.tax_amount && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax:</span>
                <span className="font-medium text-gray-900">
                  {expense.currency}{expense.tax_amount.toFixed(2)}
                </span>
              </div>
            )}
            <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-200">
              <span className="text-gray-900">Total:</span>
              <span className="text-slate-600">
                {expense.currency}{totalAmount.toFixed(2)}
              </span>
            </div>
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
