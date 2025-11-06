import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Expense } from '../lib/supabase';
import { InvoiceCard } from './InvoiceCard';
import { RestaurantReceiptCard } from './RestaurantReceiptCard';
import { GroceryReceiptCard } from './GroceryReceiptCard';
import { GenericExpenseCard } from './GenericExpenseCard';

interface ExpenseCarouselProps {
  expenses: Expense[];
  onExpenseDeleted?: () => void;
}

export function ExpenseCarousel({ expenses, onExpenseDeleted }: ExpenseCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (expenses.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % expenses.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [expenses.length]);

  if (expenses.length === 0) return null;

  const renderExpenseCard = (expense: Expense) => {
    switch (expense.category) {
      case 'INVOICE':
        return <InvoiceCard expense={expense} onDelete={onExpenseDeleted} />;
      case 'RESTAURANT':
      case 'RESTAURANT_RECEIPT':
        return <RestaurantReceiptCard expense={expense} onDelete={onExpenseDeleted} />;
      case 'GROCERY':
        return <GroceryReceiptCard expense={expense} onDelete={onExpenseDeleted} />;
      default:
        return <GenericExpenseCard expense={expense} onDelete={onExpenseDeleted} />;
    }
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + expenses.length) % expenses.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % expenses.length);
  };

  return (
    <div className="relative">
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {expenses.map((expense, index) => (
            <div key={expense.id} className="w-full flex-shrink-0 px-2">
              {renderExpenseCard(expense)}
            </div>
          ))}
        </div>
      </div>

      {expenses.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all z-10"
            aria-label="Previous expense"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all z-10"
            aria-label="Next expense"
          >
            <ChevronRight className="w-6 h-6 text-gray-700" />
          </button>

          <div className="flex justify-center gap-2 mt-4">
            {expenses.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? 'bg-blue-600 w-6'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to expense ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
