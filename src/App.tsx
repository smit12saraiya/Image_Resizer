import { useState, useEffect } from 'react';
import { FileUpload } from './components/FileUpload';
import { InvoiceCard } from './components/InvoiceCard';
import { RestaurantReceiptCard } from './components/RestaurantReceiptCard';
import { GroceryReceiptCard } from './components/GroceryReceiptCard';
import { GenericExpenseCard } from './components/GenericExpenseCard';
import { AuthModal } from './components/AuthModal';
import { Header } from './components/Header';
import { uploadExpenseDocument, saveExpenseToDatabase, getAllExpenses } from './services/expenseService';
import { Expense } from './lib/supabase';
import { Receipt, AlertCircle, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import { sampleExpenses } from './data/sampleExpenses';

function App() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { user, signOut, loading: authLoading } = useAuth();
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    if (user) {
      loadExpenses();
    } else {
      setExpenses(sampleExpenses as Expense[]);
      setIsInitialLoading(false);
    }
  }, [user]);

  const loadExpenses = async () => {
    try {
      const data = await getAllExpenses();
      setExpenses(data);
      setError(null);
    } catch (err) {
      console.error('Error loading expenses:', err);
      setError('Failed to load expenses. Please check your connection.');
      setExpenses([]);
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
      const savedExpense = await saveExpenseToDatabase(result, user.id);
      setExpenses(prev => [savedExpense, ...prev]);
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to process document. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExpenseDeleted = () => {
    loadExpenses();
  };

  const renderExpenseCard = (expense: Expense) => {
    switch (expense.category) {
      case 'INVOICE':
        return <InvoiceCard key={expense.id} expense={expense} onDelete={handleExpenseDeleted} showDelete={!!user} />;
      case 'RESTAURANT':
      case 'RESTAURANT_RECEIPT':
        return <RestaurantReceiptCard key={expense.id} expense={expense} onDelete={handleExpenseDeleted} showDelete={!!user} />;
      case 'GROCERY':
        return <GroceryReceiptCard key={expense.id} expense={expense} onDelete={handleExpenseDeleted} showDelete={!!user} />;
      default:
        return <GenericExpenseCard key={expense.id} expense={expense} onDelete={handleExpenseDeleted} showDelete={!!user} />;
    }
  };

  const totalPages = Math.ceil(expenses.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentExpenses = expenses.slice(startIndex, endIndex);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#2d2a33] via-[#3a3640] to-[#25232a] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2d2a33] via-[#3a3640] to-[#25232a] relative overflow-hidden scroll-smooth">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(234,158,110,0.08),transparent_40%),radial-gradient(circle_at_80%_90%,rgba(234,158,110,0.06),transparent_40%)] pointer-events-none"></div>

      <Header onSignInClick={() => setIsAuthModalOpen(true)} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {error && !isLoading && (
          <div className="mb-6 max-w-2xl mx-auto">
            <div className="p-4 bg-red-500/20 border border-red-400/30 rounded-lg flex items-center gap-3 backdrop-blur-sm">
              <AlertCircle className="w-5 h-5 text-red-300 flex-shrink-0" />
              <p className="text-red-200">{error}</p>
            </div>
          </div>
        )}

        {user && (
          <div className="mb-20 max-w-2xl mx-auto">
            <FileUpload onUpload={handleFileUpload} isLoading={isLoading} />

            {isLoading && (
              <div className="mt-4 p-4 bg-blue-500/20 border border-blue-400/30 rounded-lg flex items-center gap-3 backdrop-blur-sm">
                <Sparkles className="w-5 h-5 text-blue-300 animate-pulse flex-shrink-0" />
                <p className="text-blue-200">Processing your document with AI...</p>
              </div>
            )}
          </div>
        )}

        {isInitialLoading ? (
          <div className="text-center py-12">
            <div className="relative inline-flex">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-600 border-t-blue-500"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Receipt className="w-8 h-8 text-blue-400 animate-pulse" />
              </div>
            </div>
            <p className="text-gray-300 mt-4 text-lg font-medium">Loading expenses...</p>
          </div>
        ) : expenses.length === 0 ? (
          <div className="text-center py-16 bg-slate-800/50 backdrop-blur-sm rounded-xl border-2 border-dashed border-gray-600">
            <Receipt className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-200 mb-2">
              {user ? 'No expenses yet' : 'No expenses to display'}
            </h3>
            <p className="text-gray-400">
              {user ? 'Upload your first document to get started' : 'Sign in and upload your first document to get started'}
            </p>
          </div>
        ) : user ? (
          <div className="mb-20">
            <h3 className="text-2xl font-bold text-white mb-6">
              Your Expenses
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {currentExpenses.map((expense) => renderExpenseCard(expense))}
            </div>

            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-4">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-700 border border-gray-600 rounded-lg hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-gray-200"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Previous
                </button>

                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-700 border border-gray-600 text-gray-200 hover:bg-slate-600'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-700 border border-gray-600 rounded-lg hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-gray-200"
                >
                  Next
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="py-12 sm:py-16 lg:py-20 px-4">
            <div className="max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                {/* Hero Text Content */}
                <div className="text-center lg:text-left space-y-6 animate-fade-in">
                  <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-[#FFFFFF] leading-tight">
                    Smart Receipt Parsing, Zero Manual Entry
                  </h1>
                  <p className="text-lg sm:text-xl md:text-2xl text-[#FFFFFF] leading-relaxed max-w-2xl mx-auto lg:mx-0">
                    Snap a photo of your receipt and let AI do the rest. ReceiptIQ makes expense tracking effortless.
                  </p>
                  <div className="pt-4 space-y-3">
                    <button
                      onClick={() => setIsAuthModalOpen(true)}
                      className="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-[#FFFFFF] text-lg font-bold rounded-lg transition-all shadow-2xl hover:scale-105 hover:shadow-orange-500/50 w-full sm:w-auto inline-block"
                    >
                      Start Free Trial
                    </button>
                    <p className="text-[#FFFFFF] text-sm font-medium">
                      No credit card required
                    </p>
                  </div>
                </div>

                {/* Hero Image */}
                <div className="relative animate-fade-in-delay">
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl group cursor-pointer" onClick={() => setIsAuthModalOpen(true)}>
                    {/* Gradient Overlay for better text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent z-10 pointer-events-none"></div>
                    <img
                      src="/ChatGPT Image Nov 6, 2025, 03_30_07 PM.png"
                      alt="ReceiptIQ - Track Expenses On The Go"
                      className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      </div>
    </div>
  );
}

export default App;
