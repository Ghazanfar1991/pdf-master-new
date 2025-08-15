import React, { useState, useCallback, useRef, useEffect } from 'react';
import { removeImageBackground } from '../services/geminiService';
import { SliderHandleIcon } from './icons';
import FileUploader from './FileUploader';
import LoadingSpinner from './LoadingSpinner';
import ProgressBar from './ProgressBar';

interface BackgroundRemoverProps {
  onBack: () => void;
  initialFile?: File; // New prop to accept pre-uploaded file
}

const BackgroundRemover: React.FC<BackgroundRemoverProps> = ({ onBack, initialFile }) => {
  const [imageFile, setImageFile] = useState<File | null>(initialFile || null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string>('');
  const [resultImageUrl, setResultImageUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [sliderValue, setSliderValue] = useState(50);
  const [imageDimensions, setImageDimensions] = useState<{width: number, height: number} | null>(null);

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
  };

  const handleRemoveBackground = useCallback(async () => {
    if (!imageFile) {
      setError('Please select an image first.');
      return;
    }
    setError('');
    setIsLoading(true);
    setProgress(0);
    setResultImageUrl('');
    
    // Simulate progress for better UX
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 5, 95));
    }, 200);
    
    try {
      const resultUrl = await removeImageBackground(imageFile);
      clearInterval(progressInterval);
      setProgress(100);
      setResultImageUrl(resultUrl);
    } catch (err: any) {
      clearInterval(progressInterval);
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
      setProgress(0);
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.562L16.25 21.75l-.648-1.188a2.25 2.25 0 01-1.476-1.476L12.938 18l1.188-.648a2.25 2.25 0 011.476-1.476L16.25 15l.648 1.188a2.25 2.25 0 011.476 1.476L19.562 18l-1.188.648a2.25 2.25 0 01-1.476 1.476z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">AI Background Remover</h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Upload an image to automatically remove the background. Compare the result with the interactive slider.
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
          <div className="mt-8">
            <div className="flex justify-center mb-6">
              <div
                className="relative rounded-2xl select-none overflow-hidden shadow-lg"
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
                  <div className="absolute inset-0 w-full h-full flex flex-col justify-center items-center bg-white/80 dark:bg-slate-800/80 rounded-2xl">
                    <LoadingSpinner size="lg" color="primary" />
                    <p className="mt-4 text-lg font-medium text-slate-900 dark:text-white">Removing background...</p>
                    <div className="mt-4 w-64">
                      <ProgressBar value={progress} showPercentage color="primary" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-lg bg-error-50 dark:bg-error-900/20 text-error-700 dark:text-error-300">
                <div className="flex items-center">
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <button
                onClick={handleClear}
                className="btn btn-outline flex-1 sm:flex-none"
              >
                Clear & Start Over
              </button>
              
              {!resultImageUrl ? (
                <button
                  onClick={handleRemoveBackground}
                  disabled={isLoading || !imageFile}
                  className="btn btn-primary flex-1 sm:flex-none flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner size="sm" color="white" className="mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Remove Background
                    </>
                  )}
                </button>
              ) : (
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
        )}
      </div>
    </div>
  );
};

export default BackgroundRemover;
