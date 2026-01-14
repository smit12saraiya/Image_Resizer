import { Receipt } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-[#2d2a33]/90 backdrop-blur-sm border-b border-gray-700/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Receipt className="w-8 h-8 text-orange-400" />
            <h1 className="text-2xl font-bold text-white">Image Resizer</h1>
          </div>
        </div>
      </div>
    </header>
  );
}
