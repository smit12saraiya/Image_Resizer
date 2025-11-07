import { Calendar, ShoppingCart, Tag, Package, Trash2 } from 'lucide-react';
import { Expense } from '../lib/supabase';
import { useState } from 'react';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { deleteExpense } from '../services/expenseService';

interface GroceryReceiptCardProps {
  expense: Expense;
  onDelete?: () => void;
  showDelete?: boolean;
}

export function GroceryReceiptCard({ expense, onDelete, showDelete = false }: GroceryReceiptCardProps) {
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
  let items = [];
  try {
    items = expense.items;
    console.log('itemsss' ,items)
  } catch {
    items = rawData?.items || [];
    console.log('itemsss catch' ,items)
  }
  const totalItemsCount = rawData?.total_items_count || items.length;
  

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-6 h-6 text-white" />
            <h3 className="text-xl font-semibold text-white">Grocery Receipt</h3>
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
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              {expense.vendor_name || rawData?.store_name}
            </h4>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>{expense.date}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
              <Package className="w-4 h-4" />
              <span>{totalItemsCount} items</span>
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

        {expense.items && expense.items.length > 0 && (
          <div className="mb-6">
            <h5 className="text-sm font-semibold text-gray-700 mb-3">Items Purchased:</h5>
            <div className="overflow-x-auto max-h-80 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 text-gray-600 font-medium">Item</th>
                    <th className="text-right py-2 px-3 text-gray-600 font-medium">Qty</th>
                    <th className="text-right py-2 px-3 text-gray-600 font-medium">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {expense.items.map((item: any, index: number) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-2 px-3 text-gray-900">{item.name}</td>
                      <td className="text-right py-2 px-3 text-gray-700">{item.quantity || 1}</td>
                      <td className="text-right py-2 px-3 text-gray-900 font-medium">
                      
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
          {(expense.tax_amount || rawData?.tax) > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax:</span>
              <span className="font-medium text-gray-900">
                {expense.currency}{(expense.tax_amount || rawData?.tax || 0).toFixed(2)}
              </span>
            </div>
          )}
          <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-200">
            <span className="text-gray-900">Total:</span>
            <span className="text-green-600">
              {expense.currency}{(expense.total_amount || rawData?.total || 0).toFixed(2)}
            </span>
          </div>
        </div>

        {rawData?.confidence && (
          <div className="mt-4 flex items-center gap-2">
            <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">
              {rawData.confidence} Confidence
            </span>
          </div>
        )}

        {expense.tags && (
          <div className="mt-4 flex items-center gap-2">
            <Tag className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-600">{expense.tags}</span>
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
