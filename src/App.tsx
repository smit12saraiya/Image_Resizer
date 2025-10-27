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

        
      
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      </div>
    </div>
  );
}

export default App;
