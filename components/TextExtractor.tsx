import React, { useState, useCallback, useRef } from 'react';
import { extractTextWithTesseract } from '../services/ocrService';

interface TextExtractorProps {
  onBack: () => void;
}

const TextExtractor: React.FC<TextExtractorProps> = ({ onBack }) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [extractedText, setExtractedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file (PNG, JPG, etc.).');
        return;
      }
      handleClear();
      setImageFile(file);
      setImageUrl(URL.createObjectURL(file));
    }
  };

  const handleExtract = useCallback(async () => {
    if (!imageFile) {
      setError('Please select an image first.');
      return;
    }
    setError('');
    setIsLoading(true);
    setExtractedText('');
    try {
      const result = await extractTextWithTesseract(imageFile);
      setExtractedText(result);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [imageFile]);

  const handleCopyText = () => {
    if (!extractedText) return;
    navigator.clipboard.writeText(extractedText).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const handleClear = () => {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    setImageFile(null);
    setImageUrl('');
    setExtractedText('');
    setError('');
    setIsLoading(false);
    setIsCopied(false);
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in">
      <button onClick={onBack} className="flex items-center text-sm font-medium text-slate-600 hover:text-indigo-600 mb-6 dark:text-slate-400 dark:hover:text-indigo-400">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Tools
      </button>

      <div className="bg-white rounded-xl shadow-lg p-8 dark:bg-slate-800">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">AI Text Extractor (OCR)</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6">Upload an image to extract text content accurately using Optical Character Recognition.</p>

        {!imageUrl ? (
          <div 
            className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-md dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && fileInputRef.current?.click()}
          >
            <div className="space-y-1 text-center">
              <svg className="mx-auto h-12 w-12 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="flex text-sm text-slate-600 dark:text-slate-400 justify-center">
                <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 dark:bg-transparent dark:text-indigo-400">
                  <span>Upload an image</span>
                  <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" ref={fileInputRef} />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-500">PNG, JPG, WEBP, etc.</p>
            </div>
          </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                {/* Image Preview */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white">Image Preview</h3>
                    <div className="aspect-video rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                        <img src={imageUrl} alt="Uploaded preview" className="max-w-full max-h-full object-contain" />
                    </div>
                     <div className="flex flex-col sm:flex-row gap-3">
                        <button onClick={handleExtract} disabled={isLoading} className="w-full px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed flex items-center justify-center">
                            {isLoading && <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                            {isLoading ? 'Extracting...' : 'Extract Text'}
                        </button>
                        <button onClick={handleClear} className="w-full sm:w-auto px-6 py-3 bg-slate-200 text-slate-700 font-semibold rounded-lg shadow-sm hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600">
                            Clear
                        </button>
                    </div>
                </div>
                {/* Extracted Text */}
                <div className="space-y-4">
                     <h3 className="text-lg font-medium text-slate-900 dark:text-white">Extracted Text</h3>
                     <div className="relative">
                        <textarea
                            readOnly
                            value={isLoading ? 'Analyzing image...' : extractedText}
                            placeholder="Text from the image will appear here..."
                            className="w-full h-80 p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out bg-slate-50 dark:bg-slate-900/50 dark:border-slate-600 dark:text-slate-300 dark:placeholder-slate-400"
                            aria-label="Extracted Text"
                            />
                        {extractedText && (
                            <button onClick={handleCopyText} className="absolute top-3 right-3 px-3 py-1 bg-slate-200 text-slate-700 text-xs font-semibold rounded-md hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600">
                                {isCopied ? 'Copied!' : 'Copy'}
                            </button>
                        )}
                     </div>
                </div>
            </div>
        )}
        {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
      </div>
    </div>
  );
};

export default TextExtractor;
