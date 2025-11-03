import { useState, useEffect } from 'react';
import { FileUpload } from './components/FileUpload';
import { InvoiceCard } from './components/InvoiceCard';
import { RestaurantReceiptCard } from './components/RestaurantReceiptCard';
import { GroceryReceiptCard } from './components/GroceryReceiptCard';
import { GenericExpenseCard } from './components/GenericExpenseCard';
import { AuthModal } from './components/AuthModal';
import { Header } from './components/Header';
import { ExpenseCarousel } from './components/ExpenseCarousel';
import { uploadExpenseDocument, saveExpenseToDatabase, getAllExpenses } from './services/expenseService';
import { Expense } from './lib/supabase';
import { Receipt, AlertCircle, Sparkles, Lock } from 'lucide-react';
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
    if (!user) {
      setError('Please sign in to upload documents');
      setIsAuthModalOpen(true);
      return;
    }

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

  const recentExpenses = expenses.slice(0, 5);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(147,51,234,0.1),transparent_50%)] pointer-events-none"></div>

      <Header onSignInClick={() => setIsAuthModalOpen(true)} />

      <div className="relative max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-3">
            Track Your Expenses Effortlessly
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload receipts and invoices to automatically extract and organize expense data with AI
          </p>
        </div>

        {recentExpenses.length > 0 && (
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Recent Expenses
            </h3>
            <div className="max-w-3xl mx-auto">
              <ExpenseCarousel expenses={recentExpenses} />
            </div>
          </div>
        )}

        {user && (
          <div className="mb-12 max-w-2xl mx-auto">
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
        )}

        {!user && (
          <div className="mb-12 max-w-2xl mx-auto">
            <div className="p-8 bg-white/80 backdrop-blur-sm border-2 border-blue-200 rounded-xl text-center">
              <Lock className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Sign in to Upload Expenses
              </h3>
              <p className="text-gray-600 mb-4">
                Sign in with your Google account to start uploading and tracking your expenses
              </p>
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Sign In with Google
              </button>
            </div>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              All Expenses
            </h2>
            {expenses.length > 0 && (
              <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                {expenses.length} {expenses.length === 1 ? 'expense' : 'expenses'}
              </span>
            )}
          </div>

          {isInitialLoading ? (
            <div className="text-center py-12">
              <div className="relative inline-flex">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Receipt className="w-8 h-8 text-blue-600 animate-pulse" />
                </div>
              </div>
              <p className="text-gray-600 mt-4 text-lg font-medium">Loading expenses...</p>
            </div>
          ) : expenses.length === 0 ? (
            <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-xl border-2 border-dashed border-gray-300">
              <Receipt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No expenses yet
              </h3>
              <p className="text-gray-500">
                {user ? 'Upload your first document to get started' : 'Sign in and upload your first document to get started'}
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
