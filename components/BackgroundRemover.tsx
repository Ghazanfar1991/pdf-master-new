import React, { useState, useCallback, useRef } from 'react';
import { removeImageBackground } from '../services/geminiService';
import { SliderHandleIcon } from './icons';

interface BackgroundRemoverProps {
  onBack: () => void;
}

const BackgroundRemover: React.FC<BackgroundRemoverProps> = ({ onBack }) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string>('');
  const [resultImageUrl, setResultImageUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [sliderValue, setSliderValue] = useState(50);
  const [imageDimensions, setImageDimensions] = useState<{width: number, height: number} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file (PNG, JPG, etc.).');
        return;
      }
      setError('');
      setSliderValue(50);
      setImageFile(file);
      setResultImageUrl('');
      setImageDimensions(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          setImageDimensions({ width: img.width, height: img.height });
        };
        img.src = reader.result as string;
        setOriginalImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveBackground = useCallback(async () => {
    if (!imageFile) {
      setError('Please select an image first.');
      return;
    }
    setError('');
    setIsLoading(true);
    setResultImageUrl('');
    try {
      const resultUrl = await removeImageBackground(imageFile);
      setResultImageUrl(resultUrl);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [imageFile]);
  
  const handleDownload = () => {
    if (resultImageUrl) {
        const link = document.createElement('a');
        link.href = resultImageUrl;
        link.download = `${imageFile?.name.split('.')[0]}_no_bg.png` || 'image_no_bg.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
  };

  const handleClear = () => {
    setImageFile(null);
    setOriginalImageUrl('');
    setResultImageUrl('');
    setError('');
    setSliderValue(50);
    setImageDimensions(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in">
      <button onClick={onBack} className="flex items-center text-sm font-medium text-slate-600 hover:text-indigo-600 mb-6 dark:text-slate-400 dark:hover:text-indigo-400">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Tools
      </button>

      <div className="bg-white rounded-xl shadow-lg p-8 dark:bg-slate-800">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">AI Background Remover</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6">Upload an image to automatically remove the background. Compare the result with the interactive slider.</p>

        {!originalImageUrl ? (
          <div 
            className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-md dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                fileInputRef.current?.click();
              }
            }}
            role="button"
            tabIndex={0}
          >
            <div className="space-y-1 text-center">
              <svg className="mx-auto h-12 w-12 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="flex text-sm text-slate-600 dark:text-slate-400 justify-center">
                <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500 dark:bg-transparent dark:text-indigo-400">
                  <span>Upload a file</span>
                  <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" ref={fileInputRef} />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-500">PNG, JPG, GIF up to 10MB</p>
            </div>
          </div>
        ) : (
            <div className="flex justify-center">
                <div
                    className="relative rounded-lg select-none overflow-hidden"
                    style={{
                      backgroundImage: 'repeating-conic-gradient(#e5e7eb 0% 25%, transparent 0% 50%)',
                      backgroundSize: '16px 16px',
                      width: imageDimensions ? Math.min(imageDimensions.width, 800) : '100%',
                      height: imageDimensions ? Math.min(imageDimensions.height, 600) : 'auto',
                      maxWidth: '100%',
                      maxHeight: '70vh',
                      aspectRatio: imageDimensions ? `${imageDimensions.width} / ${imageDimensions.height}` : 'auto'
                    }}
                  >
                    {/* Original Image (left side) */}
                    <div
                        className="absolute inset-0 bg-contain bg-no-repeat bg-center pointer-events-none"
                        style={{ 
                            backgroundImage: `url(${originalImageUrl})`,
                            clipPath: resultImageUrl ? `inset(0 ${100 - sliderValue}% 0 0)` : 'none'
                        }}
                        aria-label="Original image"
                        role="img"
                    ></div>
                    
                    {/* Result Image (right side) */}
                    {resultImageUrl && (
                        <div
                            className="absolute inset-0 bg-contain bg-no-repeat bg-center pointer-events-none"
                            style={{
                                backgroundImage: `url(${resultImageUrl})`,
                                clipPath: `inset(0 0 0 ${sliderValue}%)`
                            }}
                            aria-label="Image with background removed"
                            role="img"
                        ></div>
                    )}
                    
                    {/* Slider and Handle */}
                    {resultImageUrl && !isLoading && (
                        <>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={sliderValue}
                                onChange={(e) => setSliderValue(Number(e.target.value))}
                                aria-label="Comparison slider"
                                className="absolute inset-0 w-full h-full cursor-ew-resize appearance-none bg-transparent z-10"
                            />
                            <div
                                className="absolute top-0 bottom-0 w-1 bg-white/50 backdrop-blur-sm pointer-events-none"
                                style={{ left: `${sliderValue}%`, transform: 'translateX(-50%)' }}
                            >
                                <div className="absolute top-1/2 -translate-y-1/2 -left-4 w-9 h-9 rounded-full bg-white/50 backdrop-blur-sm shadow-lg flex items-center justify-center transform rotate-90">
                                    <SliderHandleIcon />
                                </div>
                            </div>
                        </>
                    )}

                    {/* Loading State Overlay */}
                    {isLoading && (
                       <div className="absolute inset-0 w-full h-full flex flex-col justify-center items-center bg-white/80 dark:bg-slate-800/80 rounded-lg">
                          <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Processing...</p>
                      </div>
                    )}
                </div>
            </div>
        )}

        {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}

        <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
            {originalImageUrl && (
                <button
                    onClick={handleClear}
                    className="px-6 py-3 bg-slate-200 text-slate-700 font-semibold rounded-lg shadow-sm hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
                >
                    Clear & Start Over
                </button>
            )}
            {!resultImageUrl ? (
                 <button
                    onClick={handleRemoveBackground}
                    disabled={isLoading || !imageFile}
                    className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-300 disabled:cursor-not-allowed dark:disabled:bg-indigo-800 dark:disabled:text-slate-400 flex items-center justify-center"
                 >
                    Remove Background
                 </button>
            ): (
                 <button
                    onClick={handleDownload}
                    className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center justify-center gap-2"
                 >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Download Image
                 </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default BackgroundRemover;
