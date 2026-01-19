import { Upload, X, FileImage, Settings, FileOutput } from 'lucide-react';
import { useState, useRef } from 'react';

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

  const handleConvert = () => {
    if (selectedFile) {
      setShowModal(false);
      onUpload(selectedFile, preset, outputFormat);
      setSelectedFile(null);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <>
      <div className="space-y-6">
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

        {/* Radio Button Groups */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* PRESET Radio Group */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-gray-600 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">PRESET</h3>
            <div className="space-y-3">
              {(['social', 'iab', 'website'] as PresetType[]).map((option) => (
                <label
                  key={option}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <input
                    type="radio"
                    name="preset"
                    value={option}
                    checked={preset === option}
                    onChange={(e) => setPreset(e.target.value as PresetType)}
                    className="w-5 h-5 text-orange-500 bg-gray-700 border-gray-600 focus:ring-orange-500 focus:ring-2 cursor-pointer"
                  />
                  <span className="text-gray-200 group-hover:text-white transition-colors">
                    {option}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* OUTPUT Radio Group */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-gray-600 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">OUTPUT</h3>
            <div className="space-y-3">
              {(['jpg', 'png', 'pdf'] as OutputType[]).map((option) => (
                <label
                  key={option}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <input
                    type="radio"
                    name="output"
                    value={option}
                    checked={outputFormat === option}
                    onChange={(e) => setOutputFormat(e.target.value as OutputType)}
                    className="w-5 h-5 text-orange-500 bg-gray-700 border-gray-600 focus:ring-orange-500 focus:ring-2 cursor-pointer"
                  />
                  <span className="text-gray-200 group-hover:text-white transition-colors uppercase">
                    {option}
                  </span>
                </label>
              ))}
            </div>
          </div>
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
              <h2 className="text-xl font-bold text-white">Confirm Conversion</h2>
              <button
                onClick={handleCancel}
                className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
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

              {/* Info text */}
              <p className="text-gray-400 text-sm text-center">
                Your image will be resized to multiple dimensions based on the selected preset.
              </p>
            </div>

            {/* Footer */}
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
          </div>
        </div>
      )}
    </>
  );
}
