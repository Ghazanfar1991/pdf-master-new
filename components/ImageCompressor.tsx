import React, { useState, useCallback, useEffect } from 'react';
import FileUploader from './FileUploader';

interface ImageCompressorProps {
  onBack: () => void;
  initialFile?: File; // New prop to accept pre-uploaded file
}

const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

const ImageCompressor: React.FC<ImageCompressorProps> = ({ onBack, initialFile }) => {
  const [imageFile, setImageFile] = useState<File | null>(initialFile || null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string>('');
  const [originalSize, setOriginalSize] = useState(0);

  const [compressedImageUrl, setCompressedImageUrl] = useState<string>('');
  const [compressedSize, setCompressedSize] = useState(0);

  const [quality, setQuality] = useState(0.8);
  const [estimatedSize, setEstimatedSize] = useState(0);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isEstimating, setIsEstimating] = useState(false);
  const [error, setError] = useState('');
  
  const estimateTimeoutRef = React.useRef<number | null>(null);

  // Handle initial file if provided
  useEffect(() => {
    if (initialFile) {
      handleFileSelect(initialFile);
    }
  }, [initialFile]);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      return;
    }
    setError('');
    setImageFile(file);
    setOriginalSize(file.size);
    setCompressedImageUrl('');
    setCompressedSize(0);
    setQuality(0.8);
    setEstimatedSize(0);
    setIsLoading(false);
    setIsEstimating(false);
    const reader = new FileReader();
    reader.onloadend = () => {
      setOriginalImageUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const runCompression = useCallback((
    img: HTMLImageElement, 
    compressionQuality: number
  ): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            return reject(new Error('Could not get canvas context.'));
        }
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
            if (blob) {
                resolve(blob);
            } else {
                reject(new Error('Canvas to Blob conversion failed.'));
            }
        }, 'image/jpeg', compressionQuality);
    });
  }, []);
  
  const updateEstimatedSize = useCallback((currentQuality: number) => {
    if (!originalImageUrl) return;

    setIsEstimating(true);
    if (estimateTimeoutRef.current) {
        clearTimeout(estimateTimeoutRef.current);
    }

    estimateTimeoutRef.current = window.setTimeout(() => {
        const img = new Image();
        img.onload = async () => {
            try {
                const blob = await runCompression(img, currentQuality);
                setEstimatedSize(blob.size);
            } catch (err) {
                console.error("Estimation failed:", err);
                setEstimatedSize(0);
            } finally {
                setIsEstimating(false);
            }
        };
        img.src = originalImageUrl;
    }, 300); // Debounce by 300ms
  }, [originalImageUrl, runCompression]);

  useEffect(() => {
    if(originalImageUrl) {
        updateEstimatedSize(quality);
    }
  }, [quality, originalImageUrl, updateEstimatedSize]);
  
  const handleCompress = useCallback(async () => {
    if (!originalImageUrl) return;

    setIsLoading(true);
    setError('');
    setCompressedImageUrl('');
    setCompressedSize(0);

    const img = new Image();
    img.onload = async () => {
      try {
        const blob = await runCompression(img, quality);
        setCompressedImageUrl(URL.createObjectURL(blob));
        setCompressedSize(blob.size);
      } catch (err: any) {
        setError(err.message || "Compression failed.");
      } finally {
        setIsLoading(false);
      }
    };
    img.src = originalImageUrl;
  }, [originalImageUrl, quality, runCompression]);

  const handleDownload = () => {
    if (compressedImageUrl) {
        const link = document.createElement('a');
        link.href = compressedImageUrl;
        const originalName = imageFile?.name.split('.').slice(0, -1).join('.') || 'image';
        link.download = `${originalName}_compressed.jpeg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
  };

  const handleClear = () => {
    if (compressedImageUrl) URL.revokeObjectURL(compressedImageUrl);
    setImageFile(null);
    setOriginalImageUrl('');
    setOriginalSize(0);
    setCompressedImageUrl('');
    setCompressedSize(0);
    setError('');
    setQuality(0.8);
    setEstimatedSize(0);
    setIsLoading(false);
    setIsEstimating(false);
  };

  const reductionPercentage = originalSize > 0 ? ((originalSize - compressedSize) / originalSize * 100).toFixed(1) : 0;

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
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Image Compressor</h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Reduce the file size of your images with an adjustable quality slider and real-time size preview.
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                {/* Left: Original */}
                <div>
                     <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2 text-center">Original Image</h3>
                     <div className="aspect-square rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-700 flex items-center justify-center shadow-md">
                        <img src={originalImageUrl} alt="Original" className="max-w-full max-h-full object-contain" />
                    </div>
                    <div className="text-sm text-center mt-2 text-slate-500 dark:text-slate-400">{imageFile?.name} ({formatBytes(originalSize)})</div>
                </div>

                {/* Right: Compressed */}
                <div>
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2 text-center">Compressed Image</h3>
                    <div className="aspect-square rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center shadow-md">
                        {isLoading ? (
                             <div className="flex flex-col justify-center items-center">
                                <svg className="animate-spin h-8 w-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Compressing...</p>
                            </div>
                        ) : compressedImageUrl ? (
                            <img src={compressedImageUrl} alt="Compressed" className="max-w-full max-h-full object-contain" />
                        ) : (
                            <div className="text-center text-slate-500 p-4">Adjust quality and click Compress</div>
                        )}
                    </div>
                    {compressedSize > 0 && (
                        <div className="text-sm text-center mt-2 font-medium text-success-600 dark:text-success-400">
                           {formatBytes(compressedSize)} ({reductionPercentage}% smaller)
                        </div>
                    )}
                </div>
            </div>

            <div className="card p-6">
                 <div>
                    <label htmlFor="quality" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Quality: {Math.round(quality * 100)}%</label>
                    <input
                        type="range"
                        id="quality"
                        min="0.01"
                        max="1"
                        step="0.01"
                        value={quality}
                        onChange={(e) => setQuality(Number(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-600"
                    />
                    <div className="text-xs text-right text-slate-500 dark:text-slate-400 mt-1">
                        Estimated size: {isEstimating ? '...' : formatBytes(estimatedSize)}
                    </div>
                </div>
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
             {originalImageUrl && !compressedImageUrl && (
                 <button 
                   onClick={handleCompress} 
                   disabled={isLoading} 
                   className="btn btn-primary flex-1 sm:flex-none flex items-center justify-center"
                 >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Compressing...
                      </>
                    ) : (
                      <>
                        <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                        Compress Image
                      </>
                    )}
                 </button>
             )}
            {compressedImageUrl && (
                <button 
                  onClick={handleDownload} 
                  className="btn btn-success flex-1 sm:flex-none flex items-center justify-center"
                >
                    <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download Image
                </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default ImageCompressor;