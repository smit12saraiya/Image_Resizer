import { Calendar, Clock, UtensilsCrossed, Tag, Trash2 } from 'lucide-react';
import { Expense } from '../lib/supabase';
import { useState } from 'react';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { deleteExpense } from '../services/expenseService';

interface RestaurantReceiptCardProps {
  expense: Expense;
  onDelete?: () => void;
  showDelete?: boolean;
}

export function RestaurantReceiptCard({ expense, onDelete, showDelete = false }: RestaurantReceiptCardProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteExpense(expense.id);
      setShowDeleteModal(false);
      if (onDelete) {
        onDelete();
      }
    } catch (error) {
      console.error('Failed to delete receipt:', error);
      alert('Failed to delete receipt. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };
  const rawData = expense.raw_data;
  const totalAmount = expense.total_amount || rawData?.total_amount ||
    (expense.subtotal || 0) + (expense.tax_amount || 0);

  const restaurantName = expense.vendor_name || rawData?.restaurant_name;
  const receiptTime = expense.receipt_time || rawData?.time;
  const receipt_date = expense.receipt_date || '';
  const orderNumber = expense.order_number || '';
  const serverName = expense.server_name || '';
  const tipAmount = expense.tip_amount || '';

  const formatItems = (itemsString: string) => {
    if (!itemsString) return itemsString;
    return itemsString.replace(/\(undefinedx\)/g, '(1x)');
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UtensilsCrossed className="w-6 h-6 text-white" />
            <h3 className="text-xl font-semibold text-white">Restaurant Receipt</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium text-white">
              {expense.status}
            </span>
            {showDelete && (
              <button
                onClick={() => setShowDeleteModal(true)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                title="Delete receipt"
              >
                <Trash2 className="w-5 h-5 text-white" />
              </button>
            )}
          </div>
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
                <span>{expense.receipt_date || rawData?.receipt_date}</span>
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
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 text-gray-600 font-medium">Item</th>
                    <th className="text-right py-2 px-3 text-gray-600 font-medium">Qty</th>
                    <th className="text-right py-2 px-3 text-gray-600 font-medium">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    try {
                      let items: any[] = [];
                      if (typeof expense.items === 'string') {
                        items = JSON.parse(expense.items || '[]');
                      } else if (Array.isArray(expense.items)) {
                        items = expense.items;
                      }
                      return items.map((item: any, index: number) => (
                        <tr key={index} className="border-b border-gray-100">
                          <td className="py-2 px-3 text-gray-900">{item.name}</td>
                          <td className="text-right py-2 px-3 text-gray-700">{item.quantity ?? 1}</td>
                          <td className="text-right py-2 px-3 text-gray-900 font-medium">
                            {expense.currency}{(Number(item.price) || 0).toFixed(2)}
                          </td>
                        </tr>
                      ));
                    } catch {
                      return null;
                    }
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="border-t border-gray-200 pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-medium text-gray-900">
              {expense.currency} {(expense.subtotal || rawData?.subtotal || 0).toFixed(2)}
            </span>
          </div>
          {tipAmount && tipAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tip:</span>
              <span className="font-medium text-gray-900">
                {expense.currency} {tipAmount.toFixed(2)}
              </span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tax:</span>
            <span className="font-medium text-gray-900">
              {expense.currency} {(expense.tax_amount || rawData?.tax_amount || 0).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-200">
            <span className="text-gray-900">Total:</span>
            <span className="text-amber-600">
              {expense.currency} {totalAmount.toFixed(2)}
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

        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-end text-xs text-gray-500">
          <span>{new Date(expense.created_at).toLocaleDateString()}</span>
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
