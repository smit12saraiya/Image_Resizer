import { Upload, X, FileImage, Settings, FileOutput, Lock, AlertTriangle } from 'lucide-react';
import { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface FileUploadProps {
  onUpload: (file: File, preset: PresetType, outputFormat: OutputType) => void;
  isLoading: boolean;
}

export type PresetType = 'social' | 'iab' | 'website';
export type OutputType = 'jpg' | 'png' | 'pdf' | 'svg';

const presetLabels: Record<PresetType, string> = {
  social: 'Social Media',
  iab: 'IAB Display Ads',
  website: 'Website Banners',
};

const formatLabels: Record<OutputType, string> = {
  jpg: 'JPEG Image',
  png: 'PNG Image',
  pdf: 'PDF Document',
  svg: 'SVG Vector',
};

export function FileUpload({ onUpload, isLoading }: FileUploadProps) {
  const { user, signInWithGoogle, canUpload, remainingUploads, incrementUploadCount, profile } = useAuth();
  const [dragActive, setDragActive] = useState(false);
  const [preset, setPreset] = useState<PresetType>('social');
  const [outputFormat, setOutputFormat] = useState<OutputType>('jpg');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showModal, setShowModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
    // Reset input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFile = (file: File) => {
    const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes

    if (!validTypes.includes(file.type)) {
      alert('Please upload a PDF, PNG, JPG, or JPEG file');
      return;
    }

    if (file.size > maxSize) {
      alert('File size must be less than 5MB. Please upload a smaller file.');
      return;
    }

    setSelectedFile(file);
    setShowModal(true);
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setShowModal(false);
  };

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Sign in failed:', error);
    }
  };

  const handleConvert = async () => {
    if (selectedFile && user && canUpload()) {
      const success = await incrementUploadCount();
      if (success) {
        setShowModal(false);
        onUpload(selectedFile, preset, outputFormat);
        setSelectedFile(null);
      } else {
        alert('Failed to process upload. Please try again.');
      }
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  // Check if user needs to authenticate or has reached limit
  const needsAuth = !user;
  const reachedLimit = user && !canUpload();

  return (
    <>
      <div className="space-y-6">
        {/* Dropdown Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* PRESET Dropdown */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-gray-600 rounded-xl p-6">
            <label htmlFor="preset-select" className="text-lg font-semibold text-white mb-4 block">
              PRESET
            </label>
            <select
              id="preset-select"
              value={preset}
              onChange={(e) => setPreset(e.target.value as PresetType)}
              className="w-full px-4 py-3 bg-slate-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 cursor-pointer appearance-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 12px center',
                backgroundSize: '20px',
              }}
            >
              {(['social', 'iab', 'website'] as PresetType[]).map((option) => (
                <option key={option} value={option} className="bg-slate-700">
                  {presetLabels[option]}
                </option>
              ))}
            </select>
          </div>

          {/* OUTPUT Dropdown */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-gray-600 rounded-xl p-6">
            <label htmlFor="output-select" className="text-lg font-semibold text-white mb-4 block">
              OUTPUT
            </label>
            <select
              id="output-select"
              value={outputFormat}
              onChange={(e) => setOutputFormat(e.target.value as OutputType)}
              className="w-full px-4 py-3 bg-slate-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 cursor-pointer appearance-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 12px center',
                backgroundSize: '20px',
              }}
            >
              {(['jpg', 'png', 'pdf'] as OutputType[]).map((option) => (
                <option key={option} value={option} className="bg-slate-700">
                  {formatLabels[option]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Upload Area */}
        <div
          className={`relative border-2 border-dashed rounded-xl p-12 transition-all backdrop-blur-sm ${
            dragActive
              ? 'border-blue-400 bg-blue-500/20'
              : 'border-gray-600 bg-slate-800/50 hover:border-gray-500'
          } ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            id="file-upload"
            className="hidden"
            accept=".png,.jpg,.jpeg"
            onChange={handleChange}
            disabled={isLoading}
          />
          <label
            htmlFor="file-upload"
            className="flex flex-col items-center cursor-pointer"
          >
            <Upload className={`w-16 h-16 mb-4 ${dragActive ? 'text-blue-400' : 'text-gray-400'}`} />
            <p className="text-lg font-medium text-gray-200 mb-2">
              {isLoading ? 'Processing...' : 'Drop your image here'}
            </p>
            <p className="text-sm text-gray-400 mb-4">or click to browse</p>
            <p className="text-xs text-gray-500">Supports PNG, JPG, JPEG</p>
          </label>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showModal && selectedFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={handleCancel}
          />

          {/* Modal */}
          <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 border border-gray-600 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white">
                {needsAuth ? 'Sign In Required' : reachedLimit ? 'Upload Limit Reached' : 'Confirm Conversion'}
              </h2>
              <button
                onClick={handleCancel}
                className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {needsAuth ? (
                // Not authenticated - show sign in prompt
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-orange-500/20 rounded-full flex items-center justify-center">
                    <Lock className="w-8 h-8 text-orange-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Authentication Required</h3>
                    <p className="text-gray-400 text-sm">
                      Please sign in with your Google account to convert images.
                      Free users get 5 conversions.
                    </p>
                  </div>
                  <button
                    onClick={handleSignIn}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white hover:bg-gray-100 text-gray-800 font-medium rounded-xl transition-colors shadow-lg"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    <span>Sign in with Google</span>
                  </button>
                </div>
              ) : reachedLimit ? (
                // Reached upload limit - show upgrade prompt
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-red-500/20 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-8 h-8 text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Free Limit Reached</h3>
                    <p className="text-gray-400 text-sm">
                      You've used all 5 free conversions. Upgrade to continue converting images without limits.
                    </p>
                  </div>
                  <div className="p-4 bg-slate-700/50 rounded-xl">
                    <p className="text-orange-400 font-semibold mb-1">Upgrade to Pro</p>
                    <p className="text-gray-400 text-sm">Unlimited conversions, priority processing</p>
                  </div>
                  <button
                    disabled
                    className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl opacity-50 cursor-not-allowed"
                  >
                    Coming Soon
                  </button>
                </div>
              ) : (
                // Authenticated and can upload - show confirmation
                <>
                  {/* File Info */}
                  <div className="flex items-start gap-4 p-4 bg-slate-700/50 rounded-xl">
                    <div className="p-3 bg-orange-500/20 rounded-lg">
                      <FileImage className="w-8 h-8 text-orange-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate" title={selectedFile.name}>
                        {selectedFile.name}
                      </p>
                      <p className="text-gray-400 text-sm mt-1">
                        {formatFileSize(selectedFile.size)} • {selectedFile.type.split('/')[1].toUpperCase()}
                      </p>
                    </div>
                  </div>

                  {/* Settings Summary */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Preset */}
                    <div className="p-4 bg-slate-700/50 rounded-xl">
                      <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                        <Settings className="w-4 h-4" />
                        <span>Preset</span>
                      </div>
                      <p className="text-white font-medium">{presetLabels[preset]}</p>
                    </div>

                    {/* Output Format */}
                    <div className="p-4 bg-slate-700/50 rounded-xl">
                      <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                        <FileOutput className="w-4 h-4" />
                        <span>Output</span>
                      </div>
                      <p className="text-white font-medium">{formatLabels[outputFormat]}</p>
                    </div>
                  </div>

                  {/* Remaining uploads warning */}
                  {profile && !profile.hasPaid && (
                    <div className={`p-3 rounded-lg text-sm text-center ${remainingUploads() <= 2 ? 'bg-red-500/20 text-red-300' : 'bg-slate-700/50 text-gray-400'}`}>
                      {remainingUploads()} free conversion{remainingUploads() !== 1 ? 's' : ''} remaining
                    </div>
                  )}

                  {/* Info text */}
                  <p className="text-gray-400 text-sm text-center">
                    Your image will be resized to multiple dimensions based on the selected preset.
                  </p>
                </>
              )}
            </div>

            {/* Footer - only show for authenticated users who can upload */}
            {!needsAuth && !reachedLimit && (
              <div className="flex gap-3 p-6 border-t border-gray-700 bg-slate-800/50">
                <button
                  onClick={handleCancel}
                  className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConvert}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-orange-500/30"
                >
                  Convert
                </button>
              </div>
            )}

            {/* Footer for auth/limit states */}
            {(needsAuth || reachedLimit) && (
              <div className="flex gap-3 p-6 border-t border-gray-700 bg-slate-800/50">
                <button
                  onClick={handleCancel}
                  className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-xl transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
