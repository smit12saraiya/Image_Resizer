import { Calendar, Clock, UtensilsCrossed, Tag } from 'lucide-react';
import { Expense } from '../lib/supabase';

interface RestaurantReceiptCardProps {
  expense: Expense;
}

export function RestaurantReceiptCard({ expense }: RestaurantReceiptCardProps) {
  const rawData = expense.raw_data;
  const totalAmount = expense.total_amount || rawData?.total_amount ||
    (expense.subtotal || 0) + (expense.tax_amount || 0);

  const restaurantName = expense.vendor_name || rawData?.restaurant_name;
  const receiptTime = rawData?.receipt_time || rawData?.time;
  const orderNumber = rawData?.order_number;
  const serverName = rawData?.server_name;
  const tipAmount = rawData?.tip_amount;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UtensilsCrossed className="w-6 h-6 text-white" />
            <h3 className="text-xl font-semibold text-white">Restaurant Receipt</h3>
          </div>
          <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium text-white">
            {expense.status}
          </span>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              {restaurantName}
            </h4>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>{expense.date || rawData?.receipt_date}</span>
                {receiptTime && (
                  <>
                    <Clock className="w-4 h-4 ml-2" />
                    <span>{receiptTime}</span>
                  </>
                )}
              </div>
              {(orderNumber || serverName) && (
                <div className="flex flex-wrap gap-3 text-xs text-gray-600">
                  {orderNumber && (
                    <span className="px-2 py-1 bg-gray-100 rounded">
                      Order #{orderNumber}
                    </span>
                  )}
                  {serverName && (
                    <span className="px-2 py-1 bg-gray-100 rounded">
                      Server: {serverName}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
          {expense.image_url && (
            <a
              href={expense.image_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
            >
              View Receipt
            </a>
          )}
        </div>

        {expense.items && (
          <div className="mb-6">
            <h5 className="text-sm font-semibold text-gray-700 mb-3">Ordered Items:</h5>
            <div className="bg-gray-50 rounded-lg p-4">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                {expense.items}
              </pre>
            </div>
          </div>
        )}

        <div className="border-t border-gray-200 pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-medium text-gray-900">
              {expense.currency}{(expense.subtotal || rawData?.subtotal || 0).toFixed(2)}
            </span>
          </div>
          {tipAmount && tipAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tip:</span>
              <span className="font-medium text-gray-900">
                {expense.currency}{tipAmount.toFixed(2)}
              </span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tax:</span>
            <span className="font-medium text-gray-900">
              {expense.currency}{(expense.tax_amount || rawData?.tax_amount || 0).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-200">
            <span className="text-gray-900">Total:</span>
            <span className="text-amber-600">
              {expense.currency}{totalAmount.toFixed(2)}
            </span>
          </div>
        </div>

        {rawData?.confidence_score && (
          <div className="mt-4 flex items-center gap-2">
            <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded-full font-medium">
              {rawData.confidence_score} Confidence
            </span>
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
