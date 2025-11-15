import { X, CreditCard, CheckCircle2 } from 'lucide-react';

interface PaymentRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  uploadCount: number;
}

export function PaymentRequiredModal({ isOpen, onClose, uploadCount }: PaymentRequiredModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl max-w-md w-full border border-gray-700 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-200 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-8">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mb-4">
              <CreditCard className="w-8 h-8 text-orange-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Upload Limit Reached
            </h2>
            <p className="text-gray-300">
              You've uploaded <span className="font-bold text-orange-400">{uploadCount}</span> receipts
            </p>
          </div>

          <div className="bg-slate-700/50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Upgrade to Premium
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span className="text-gray-200">Unlimited receipt uploads</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span className="text-gray-200">Advanced analytics & reports</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span className="text-gray-200">Priority support</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span className="text-gray-200">Export to multiple formats</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => {
                // TODO: Implement payment integration (Stripe, etc.)
                alert('Payment integration coming soon! Contact support for upgrade.');
              }}
              className="w-full px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-orange-500/50"
            >
              Upgrade Now
            </button>
            <button
              onClick={onClose}
              className="w-full px-6 py-3 bg-slate-700 hover:bg-slate-600 text-gray-200 font-semibold rounded-lg transition-colors border border-gray-600"
            >
              Maybe Later
            </button>
          </div>

          <p className="text-center text-gray-400 text-sm mt-4">
            Questions? Contact us at support@expensetracker.com
          </p>
        </div>
      </div>
    </div>
  );
}
