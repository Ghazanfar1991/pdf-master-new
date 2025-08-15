import React, { useState, useCallback, useEffect } from 'react';
import FileUploader from './FileUploader';

interface ImageConverterProps {
  onBack: () => void;
  initialFile?: File; // New prop to accept pre-uploaded file
}

type TargetFormat = 'jpeg' | 'png' | 'webp';

const ImageConverter: React.FC<ImageConverterProps> = ({ onBack, initialFile }) => {
  const [imageFile, setImageFile] = useState<File | null>(initialFile || null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string>('');
  const [convertedImageUrl, setConvertedImageUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [targetFormat, setTargetFormat] = useState<TargetFormat>('jpeg');
  const [jpegQuality, setJpegQuality] = useState(0.8);

  // Handle initial file if provided
  useEffect(() => {
    if (initialFile) {
      handleFileSelect(initialFile);
    }
  }, [initialFile]);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (PNG, JPG, etc.).');
      return;
    }
    setError('');
    setImageFile(file);
    setConvertedImageUrl('');
    const reader = new FileReader();
    reader.onloadend = () => {
      setOriginalImageUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleConvert = useCallback(() => {
    if (!originalImageUrl) return;

    setIsLoading(true);
    setError('');
    setConvertedImageUrl('');

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
          setError('Could not get canvas context.');
          setIsLoading(false);
          return;
      }
      ctx.drawImage(img, 0, 0);

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          setConvertedImageUrl(url);
        } else {
            setError('Image conversion failed. The format might not be supported by your browser.');
        }
        setIsLoading(false);
      }, `image/${targetFormat}`, targetFormat === 'jpeg' ? jpegQuality : undefined);
    };
    img.onerror = () => {
        setError('Failed to load the image for conversion.');
        setIsLoading(false);
    }
    img.src = originalImageUrl;
  }, [originalImageUrl, targetFormat, jpegQuality]);
  
  const handleDownload = () => {
    if (convertedImageUrl) {
        const link = document.createElement('a');
        link.href = convertedImageUrl;
        const originalName = imageFile?.name.split('.').slice(0, -1).join('.') || 'image';
        link.download = `${originalName}.${targetFormat}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
  };

  const handleClear = () => {
    setImageFile(null);
    setOriginalImageUrl('');
    setConvertedImageUrl('');
    setError('');
    setIsLoading(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in-up">
      <div className="mb-6">
        <button 
          onClick={onBack} 
          className="flex items-center text-sm font-medium text-slate-600 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Tools
        </button>
      </div>

      <div className="card p-8">
        <div className="text-center mb-8">
          <div className="mx-auto bg-gradient-primary w-16 h-16 rounded-2xl flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Image Format Converter</h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Convert your images to JPEG, PNG, or WEBP with ease. All processing is done in your browser.
          </p>
        </div>

        {!originalImageUrl ? (
          <FileUploader 
            onFileSelect={handleFileSelect} 
            accept="image/*"
            maxFileSize={10}
            className="mt-6"
          />
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-1/2">
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2 text-center">Original</h3>
                    <div className="aspect-square rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-700 flex items-center justify-center shadow-md">
                        <img src={originalImageUrl} alt="Original" className="max-w-full max-h-full object-contain" />
                    </div>
                </div>
                <div className="w-full md:w-1/2">
                     <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2 text-center">Converted</h3>
                     <div className="aspect-square rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center shadow-md">
                        {isLoading ? (
                             <div className="flex flex-col justify-center items-center">
                                <svg className="animate-spin h-8 w-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Converting...</p>
                            </div>
                        ) : convertedImageUrl ? (
                            <img src={convertedImageUrl} alt="Converted" className="max-w-full max-h-full object-contain" />
                        ) : (
                            <div className="text-center text-slate-500 p-4">Select format and click Convert</div>
                        )}
                    </div>
                </div>
            </div>
            
            <div className="card p-6">
                <div className="mb-4">
                    <label htmlFor="format" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Convert to:</label>
                    <select
                        id="format"
                        value={targetFormat}
                        onChange={(e) => setTargetFormat(e.target.value as TargetFormat)}
                        className="input w-full"
                        >
                        <option value="jpeg">JPEG</option>
                        <option value="png">PNG</option>
                        <option value="webp">WEBP</option>
                    </select>
                </div>
                {targetFormat === 'jpeg' && (
                    <div>
                        <label htmlFor="quality" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Quality: {Math.round(jpegQuality * 100)}%</label>
                        <input
                            type="range"
                            id="quality"
                            min="0.1"
                            max="1"
                            step="0.05"
                            value={jpegQuality}
                            onChange={(e) => setJpegQuality(Number(e.target.value))}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-600"
                         />
                    </div>
                )}
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 rounded-lg bg-error-50 dark:bg-error-900/20 text-error-700 dark:text-error-300">
            <div className="flex items-center">
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
            {originalImageUrl && (
                <button
                    onClick={handleClear}
                    className="btn btn-outline flex-1 sm:flex-none"
                >
                    Clear & Start Over
                </button>
            )}
            {convertedImageUrl ? (
                 <button
                    onClick={handleDownload}
                    className="btn btn-success flex-1 sm:flex-none flex items-center justify-center"
                 >
                    <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download Image
                 </button>
            ) : originalImageUrl && (
                 <button
                    onClick={handleConvert}
                    disabled={isLoading}
                    className="btn btn-primary flex-1 sm:flex-none flex items-center justify-center"
                 >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Converting...
                      </>
                    ) : (
                      <>
                        <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                        Convert Image
                      </>
                    )}
                 </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default ImageConverter;
