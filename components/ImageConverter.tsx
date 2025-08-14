import React, { useState, useCallback, useRef } from 'react';

interface ImageConverterProps {
  onBack: () => void;
}

type TargetFormat = 'jpeg' | 'png' | 'webp';

const ImageConverter: React.FC<ImageConverterProps> = ({ onBack }) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string>('');
  const [convertedImageUrl, setConvertedImageUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [targetFormat, setTargetFormat] = useState<TargetFormat>('jpeg');
  const [jpegQuality, setJpegQuality] = useState(0.8);
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
      const reader = new FileReader();
      reader.onloadend = () => {
        setOriginalImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
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
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Image Format Converter</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6">Convert your images to JPEG, PNG, or WEBP with ease. All processing is done in your browser.</p>

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
              <div className="flex text-sm text-slate-600 dark:text-slate-400 justify-center">
                <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500 dark:bg-transparent dark:text-indigo-400">
                  <span>Upload a file</span>
                  <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" ref={fileInputRef} />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-500">PNG, JPG, WEBP, GIF etc.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-1/2">
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2 text-center">Original</h3>
                    <div className="aspect-square rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                        <img src={originalImageUrl} alt="Original" className="max-w-full max-h-full object-contain" />
                    </div>
                </div>
                <div className="w-full md:w-1/2">
                     <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2 text-center">Converted</h3>
                     <div className="aspect-square rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                        {isLoading ? (
                             <div className="flex flex-col justify-center items-center">
                                <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
            
            <div className="bg-slate-100 dark:bg-slate-800/50 p-4 rounded-lg space-y-4">
                <div>
                    <label htmlFor="format" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Convert to:</label>
                    <select
                        id="format"
                        value={targetFormat}
                        onChange={(e) => setTargetFormat(e.target.value as TargetFormat)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        >
                        <option value="jpeg">JPEG</option>
                        <option value="png">PNG</option>
                        <option value="webp">WEBP</option>
                    </select>
                </div>
                {targetFormat === 'jpeg' && (
                    <div>
                        <label htmlFor="quality" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Quality: {Math.round(jpegQuality * 100)}%</label>
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
            {convertedImageUrl ? (
                 <button
                    onClick={handleDownload}
                    className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center justify-center gap-2"
                 >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Download Image
                 </button>
            ) : originalImageUrl && (
                 <button
                    onClick={handleConvert}
                    disabled={isLoading}
                    className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-300 disabled:cursor-not-allowed dark:disabled:bg-indigo-800 dark:disabled:text-slate-400 flex items-center justify-center"
                 >
                    Convert
                 </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default ImageConverter;
