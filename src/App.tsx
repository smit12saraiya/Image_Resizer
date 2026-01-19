import { useState } from 'react';
import { FileUpload, PresetType, OutputType } from './components/FileUpload';
import { Header } from './components/Header';
import { AlertCircle, Sparkles, Download } from 'lucide-react';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');

  const handleFileUpload = async (file: File, preset: PresetType, outputFormat: OutputType) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    setDownloadUrl(null);

    try {
      // Create FormData to send to n8n webhook
      const formData = new FormData();
      formData.append('file', file);
      formData.append('preset', preset);
      formData.append('outputFormat', outputFormat);

      // Replace with your actual n8n webhook URL
      const N8N_WEBHOOK_URL = 'https://n8n.srv1276188.hstgr.cloud/webhook/image-resizer';

      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }

      // Get the content type to verify it's a zip file
      const contentType = response.headers.get('content-type');
      console.log('Response content-type:', contentType);

      // Get the zip file blob from response
      const blob = await response.blob();

      // Validate that we received a valid ZIP file
      if (blob.size === 0) {
        throw new Error('Received empty file from server. The workflow may have failed.');
      }

      // Check if the blob is actually a ZIP file by checking the magic number
      const isValidZip = await validateZipFile(blob);
      if (!isValidZip) {
        throw new Error('Invalid ZIP file received. The workflow may have encountered an error.');
      }

      // Create a proper blob with correct MIME type
      const zipBlob = new Blob([blob], { type: 'application/zip' });

      // Create download URL
      const url = window.URL.createObjectURL(zipBlob);
      const downloadFileName = `resized_images_${preset}_${outputFormat}_${Date.now()}.zip`;

      setDownloadUrl(url);
      setFileName(downloadFileName);
      setSuccess(`Images processed successfully! Your zip file is ready to download.`);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Failed to process image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to validate ZIP file by checking magic number
  const validateZipFile = async (blob: Blob): Promise<boolean> => {
    try {
      const arrayBuffer = await blob.slice(0, 4).arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);

      // ZIP file magic numbers:
      // PK\x03\x04 (0x504B0304) for regular ZIP
      // PK\x05\x06 (0x504B0506) for empty ZIP
      // PK\x07\x08 (0x504B0708) for spanned ZIP
      const isPKZip = bytes[0] === 0x50 && bytes[1] === 0x4B;

      return isPKZip;
    } catch (err) {
      console.error('Error validating ZIP file:', err);
      return false;
    }
  };

  const handleDownload = () => {
    if (downloadUrl && fileName) {
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2d2a33] via-[#3a3640] to-[#25232a] relative overflow-hidden scroll-smooth">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(234,158,110,0.08),transparent_40%),radial-gradient(circle_at_80%_90%,rgba(234,158,110,0.06),transparent_40%)] pointer-events-none"></div>

      <Header />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Title */}
          <div className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3">
              No Bull Creative Cloner
            </h1>
            <p className="text-gray-300 text-lg">
              Resize your images with custom presets and output formats
            </p>
          </div>

          {/* Error Message */}
          {error && !isLoading && (
            <div className="mb-6">
              <div className="p-4 bg-red-500/20 border border-red-400/30 rounded-lg flex items-center gap-3 backdrop-blur-sm">
                <AlertCircle className="w-5 h-5 text-red-300 flex-shrink-0" />
                <p className="text-red-200">{error}</p>
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && !isLoading && (
            <div className="mb-6">
              <div className="p-4 bg-green-500/20 border border-green-400/30 rounded-lg flex items-center gap-3 backdrop-blur-sm">
                <Sparkles className="w-5 h-5 text-green-300 flex-shrink-0" />
                <p className="text-green-200">{success}</p>
              </div>
            </div>
          )}

          {/* File Upload Component */}
          <FileUpload onUpload={handleFileUpload} isLoading={isLoading} />

          {/* Processing Message */}
          {isLoading && (
            <div className="mt-6 p-4 bg-blue-500/20 border border-blue-400/30 rounded-lg flex items-center gap-3 backdrop-blur-sm">
              <Sparkles className="w-5 h-5 text-blue-300 animate-pulse flex-shrink-0" />
              <p className="text-blue-200">Processing your image...</p>
            </div>
          )}

          {/* Download Button */}
          {downloadUrl && !isLoading && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={handleDownload}
                className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-orange-500/50 transform hover:scale-105"
              >
                <Download className="w-6 h-6" />
                <span>Download ZIP File</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
