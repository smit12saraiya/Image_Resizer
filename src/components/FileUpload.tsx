import { Upload } from 'lucide-react';
import { useState } from 'react';

interface FileUploadProps {
  onUpload: (file: File, preset: PresetType, outputFormat: OutputType) => void;
  isLoading: boolean;
}

export type PresetType = 'social' | 'iab' | 'website';
export type OutputType = 'jpg' | 'png' | 'pdf' | 'svg';

export function FileUpload({ onUpload, isLoading }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [preset, setPreset] = useState<PresetType>('social');
  const [outputFormat, setOutputFormat] = useState<OutputType>('jpg');

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

    onUpload(file, preset, outputFormat);
  };

  return (
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
            {(['jpg', 'png', 'pdf', 'svg'] as OutputType[]).map((option) => (
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
  );
}
