import React, { useState, useCallback, useRef, useEffect } from 'react';

interface ImageCompressorProps {
  onBack: () => void;
}

const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

const ImageCompressor: React.FC<ImageCompressorProps> = ({ onBack }) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string>('');
  const [originalSize, setOriginalSize] = useState(0);

  const [compressedImageUrl, setCompressedImageUrl] = useState<string>('');
  const [compressedSize, setCompressedSize] = useState(0);

  const [quality, setQuality] = useState(0.8);
  const [estimatedSize, setEstimatedSize] = useState(0);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isEstimating, setIsEstimating] = useState(false);
  const [error, setError] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const estimateTimeoutRef = useRef<number | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file.');
        return;
      }
      handleClear();
      setImageFile(file);
      setOriginalSize(file.size);
      const reader = new FileReader();
      reader.onloadend = () => {
        setOriginalImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
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
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const reductionPercentage = originalSize > 0 ? ((originalSize - compressedSize) / originalSize * 100).toFixed(1) : 0;

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in">
      <button onClick={onBack} className="flex items-center text-sm font-medium text-slate-600 hover:text-indigo-600 mb-6 dark:text-slate-400 dark:hover:text-indigo-400">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Tools
      </button>

      <div className="bg-white rounded-xl shadow-lg p-8 dark:bg-slate-800">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Image Compressor</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6">Reduce the file size of your images with an adjustable quality slider and real-time size preview.</p>

        {!originalImageUrl ? (
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
              <p className="text-sm text-slate-600 dark:text-slate-400">Click to upload or drag and drop</p>
              <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" ref={fileInputRef} />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                {/* Left: Original */}
                <div>
                     <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2 text-center">Original Image</h3>
                     <div className="aspect-square rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                        <img src={originalImageUrl} alt="Original" className="max-w-full max-h-full object-contain" />
                    </div>
                    <div className="text-sm text-center mt-2 text-slate-500 dark:text-slate-400">{imageFile?.name} ({formatBytes(originalSize)})</div>
                </div>

                {/* Right: Compressed */}
                <div>
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2 text-center">Compressed Image</h3>
                    <div className="aspect-square rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                        {isLoading ? (
                             <div className="flex flex-col justify-center items-center">
                                <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            </div>
                        ) : compressedImageUrl ? (
                            <img src={compressedImageUrl} alt="Compressed" className="max-w-full max-h-full object-contain" />
                        ) : (
                            <div className="text-center text-slate-500 p-4">Adjust quality and click Compress</div>
                        )}
                    </div>
                    {compressedSize > 0 && (
                        <div className="text-sm text-center mt-2 font-medium text-green-600 dark:text-green-400">
                           {formatBytes(compressedSize)} ({reductionPercentage}% smaller)
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-slate-100 dark:bg-slate-800/50 p-4 rounded-lg space-y-4">
                 <div>
                    <label htmlFor="quality" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Quality: {Math.round(quality * 100)}%</label>
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

        {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}

        <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
            {originalImageUrl && (
                <button onClick={handleClear} className="px-6 py-3 bg-slate-200 text-slate-700 font-semibold rounded-lg shadow-sm hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600">
                    Clear
                </button>
            )}
             {originalImageUrl && !compressedImageUrl && (
                 <button onClick={handleCompress} disabled={isLoading} className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-300 disabled:cursor-not-allowed">
                    {isLoading ? 'Compressing...' : 'Compress'}
                 </button>
             )}
            {compressedImageUrl && (
                <button onClick={handleDownload} className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center justify-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                    Download
                </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default ImageCompressor;