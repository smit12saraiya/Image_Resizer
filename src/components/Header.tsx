import { Receipt, LogOut, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  onSignInClick: () => void;
}

export function Header({ onSignInClick }: HeaderProps) {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.reload();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleGoogleSignIn = async () => {
    onSignInClick();
  };

  return (
    <header className="bg-[#2d2a33]/90 backdrop-blur-sm border-b border-gray-700/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Receipt className="w-8 h-8 text-orange-400" />
            <h1 className="text-2xl font-bold text-white">ReceiptIQ</h1>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="flex items-center gap-2 px-3 py-2 bg-orange-500/20 border border-orange-400/30 rounded-lg backdrop-blur-sm">
                  <User className="w-5 h-5 text-orange-300" />
                  <span className="text-sm font-medium text-orange-200">
                    {user.email}
                  </span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 px-4 py-2 bg-[#3a3640] border border-gray-600 rounded-lg hover:bg-[#2d2a33] transition-colors text-gray-200"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Sign Out</span>
                </button>
              </>
            ) : (
              
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
