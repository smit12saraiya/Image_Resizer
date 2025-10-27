import { useState, useEffect } from 'react';
import { FileUpload } from './components/FileUpload';
import { InvoiceCard } from './components/InvoiceCard';
import { RestaurantReceiptCard } from './components/RestaurantReceiptCard';
import { GroceryReceiptCard } from './components/GroceryReceiptCard';
import { GenericExpenseCard } from './components/GenericExpenseCard';
import { AuthModal } from './components/AuthModal';
import { uploadExpenseDocument, saveExpenseToDatabase, getAllExpenses } from './services/expenseService';
import { Expense } from './lib/supabase';
import { Receipt, AlertCircle, Sparkles, LogIn, LogOut, User } from 'lucide-react';
import { useAuth } from './contexts/AuthContext';

function App() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { user, signOut, loading: authLoading } = useAuth();

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      const data = await getAllExpenses();
      setExpenses(data);
    } catch (err) {
      console.error('Error loading expenses:', err);
    } finally {
      setIsInitialLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await uploadExpenseDocument(file);
      const savedExpense = await saveExpenseToDatabase(result);
      setExpenses(prev => [savedExpense, ...prev]);
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to process document. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderExpenseCard = (expense: Expense) => {
    switch (expense.category) {
      case 'INVOICE':
        return <InvoiceCard key={expense.id} expense={expense} />;
      case 'RESTAURANT':
      case 'RESTAURANT_RECEIPT':
        return <RestaurantReceiptCard key={expense.id} expense={expense} />;
      case 'GROCERY':
        return <GroceryReceiptCard key={expense.id} expense={expense} />;
      default:
        return <GenericExpenseCard key={expense.id} expense={expense} />;
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Receipt className="w-12 h-12 text-blue-600" />
            <h1 className="text-5xl font-bold text-gray-900">
              Multi-Channel Expense Tracker
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload your receipts and invoices to automatically extract and organize expense data.
            Supports documents from Telegram, webhooks, and manual uploads.
          </p>

          <div className="mt-6 flex items-center justify-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg">
                  <User className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">
                    {user.email}
                  </span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Sign Out</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                <LogIn className="w-5 h-5" />
                Sign In
              </button>
            )}
          </div>
        </div>

        <div className="mb-12">
          <FileUpload onUpload={handleFileUpload} isLoading={isLoading} />

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {isLoading && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-blue-600 animate-pulse flex-shrink-0" />
              <p className="text-blue-800">Processing your document with AI...</p>
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Recent Expenses
            </h2>
            {expenses.length > 0 && (
              <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                {expenses.length} {expenses.length === 1 ? 'expense' : 'expenses'}
              </span>
            )}
          </div>

          {isInitialLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading expenses...</p>
            </div>
          ) : expenses.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-300">
              <Receipt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No expenses yet
              </h3>
              <p className="text-gray-500">
                Upload your first document to get started
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {expenses.map(renderExpenseCard)}
            </div>
          )}
        </div>

        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      </div>
    </div>
  );
}

export default App;
