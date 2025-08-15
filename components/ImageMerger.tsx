import React, { useState, useCallback, useEffect } from 'react';
import FileUploader from './FileUploader';

interface ImageMergerProps {
  onBack: () => void;
  initialFiles?: File[]; // New prop to accept pre-uploaded files
}

type Layout = 'horizontal' | 'vertical' | 'grid';

const ImageMerger: React.FC<ImageMergerProps> = ({ onBack, initialFiles }) => {
  const [imageFiles, setImageFiles] = useState<File[]>(initialFiles || []);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [mergedImageUrl, setMergedImageUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [layout, setLayout] = useState<Layout>('horizontal');
  const [columns, setColumns] = useState(2);
  const [spacing, setSpacing] = useState(10);

  // Handle initial files if provided
  useEffect(() => {
    if (initialFiles && initialFiles.length > 0) {
      handleFilesSelect(initialFiles);
    }
  }, [initialFiles]);

  const handleFilesSelect = (files: File[]) => {
    const validFiles = files.filter(file => file.type.startsWith('image/'));
    if (validFiles.length === 0) {
      setError('Please select valid image files.');
      return;
    }
    setError('');
    setImageFiles(validFiles);
    const urls = validFiles.map(file => URL.createObjectURL(file));
    setImageUrls(urls);
    setMergedImageUrl('');
    setIsLoading(false);
  };

  const handleMerge = useCallback(async () => {
    if (imageUrls.length < 2) {
      setError('Please upload at least two images to merge.');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setMergedImageUrl('');

    try {
      const images: HTMLImageElement[] = await Promise.all(
        imageUrls.map(url => new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = url;
        }))
      );

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Could not create canvas context.');
      }
      
      const numImages = images.length;

      if (layout === 'horizontal') {
        canvas.width = images.reduce((sum, img) => sum + img.width, 0) + (numImages - 1) * spacing;
        canvas.height = Math.max(...images.map(img => img.height));
        let currentX = 0;
        images.forEach(img => {
            ctx.drawImage(img, currentX, 0);
            currentX += img.width + spacing;
        });
      } else if (layout === 'vertical') {
        canvas.width = Math.max(...images.map(img => img.width));
        canvas.height = images.reduce((sum, img) => sum + img.height, 0) + (numImages - 1) * spacing;
        let currentY = 0;
        images.forEach(img => {
            ctx.drawImage(img, 0, currentY);
            currentY += img.height + spacing;
        });
      } else { // grid
        const numCols = Math.min(columns, numImages);
        const numRows = Math.ceil(numImages / numCols);

        const colWidths = Array(numCols).fill(0);
        const rowHeights = Array(numRows).fill(0);

        for (let i = 0; i < numImages; i++) {
            const row = Math.floor(i / numCols);
            const col = i % numCols;
            if (images[i].width > colWidths[col]) {
                colWidths[col] = images[i].width;
            }
            if (images[i].height > rowHeights[row]) {
                rowHeights[row] = images[i].height;
            }
        }

        canvas.width = colWidths.reduce((a, b) => a + b, 0) + (numCols - 1) * spacing;
        canvas.height = rowHeights.reduce((a, b) => a + b, 0) + (numRows - 1) * spacing;
        
        let currentY = 0;
        for (let row = 0; row < numRows; row++) {
            let currentX = 0;
            for (let col = 0; col < numCols; col++) {
                const index = row * numCols + col;
                if (index < numImages) {
                    ctx.drawImage(images[index], currentX, currentY);
                }
                currentX += colWidths[col] + spacing;
            }
            currentY += rowHeights[row] + spacing;
        }
      }

      setMergedImageUrl(canvas.toDataURL('image/png'));

    } catch (err) {
      console.error(err);
      setError('Failed to load or merge images. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [imageUrls, layout, columns, spacing]);

  const handleDownload = () => {
    if (mergedImageUrl) {
      const link = document.createElement('a');
      link.href = mergedImageUrl;
      link.download = 'merged_image.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleClear = () => {
    setImageFiles([]);
    imageUrls.forEach(url => URL.revokeObjectURL(url));
    setImageUrls([]);
    setMergedImageUrl('');
    setError('');
    setIsLoading(false);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in-up">
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2zm6 6v6m-6-6h6m-6 6l6-6m6 6l-6-6m6 6v-6m0 6h-6" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Image Merger</h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Combine multiple images into a single masterpiece. Choose your layout, add spacing, and download.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel: Upload & Settings */}
          <div className="lg:col-span-1 space-y-6">
            {!imageFiles.length ? (
              <FileUploader 
                onFileSelect={(file) => handleFilesSelect([file])}
                accept="image/*"
                maxFileSize={10}
                className="mt-6"
                multiple
              />
            ) : (
              <>
                <div className="card p-6">
                  <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">Layout Options</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Layout</label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['horizontal', 'vertical', 'grid'] as Layout[]).map(l => (
                          <button 
                            key={l} 
                            onClick={() => setLayout(l)} 
                            className={`capitalize px-3 py-2 text-sm rounded-md transition-colors ${
                              layout === l 
                                ? 'bg-gradient-primary text-white shadow' 
                                : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {l}
                          </button>
                        ))}
                      </div>
                    </div>
                    {layout === 'grid' && (
                      <div>
                        <label htmlFor="columns" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Columns: {columns}</label>
                        <input 
                          type="range" 
                          id="columns" 
                          min="2" 
                          max={Math.max(2, imageFiles.length)} 
                          value={columns} 
                          onChange={e => setColumns(Number(e.target.value))} 
                          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-600" 
                        />
                      </div>
                    )}
                    <div>
                      <label htmlFor="spacing" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Spacing: {spacing}px</label>
                      <input 
                        type="range" 
                        id="spacing" 
                        min="0" 
                        max="100" 
                        value={spacing} 
                        onChange={e => setSpacing(Number(e.target.value))} 
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-600" 
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={handleMerge} 
                    disabled={isLoading || imageFiles.length < 2}
                    className="btn btn-primary flex items-center justify-center"
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Merging...
                      </>
                    ) : (
                      <>
                        <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                        Merge Images
                      </>
                    )}
                  </button>
                  <button 
                    onClick={handleClear} 
                    className="btn btn-outline"
                  >
                    Clear All
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Right Panel: Previews */}
          <div className="lg:col-span-2">
            <div className="w-full h-full bg-slate-100 dark:bg-slate-900/50 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[400px]">
              {mergedImageUrl ? (
                <div className="w-full">
                  <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4 text-center">Merged Result</h3>
                  <div className="rounded-xl overflow-hidden bg-white dark:bg-slate-800 shadow-lg mb-4">
                    <img src={mergedImageUrl} alt="Merged result" className="max-w-full max-h-[500px] object-contain mx-auto" />
                  </div>
                  <button 
                    onClick={handleDownload} 
                    className="btn btn-success w-full flex items-center justify-center"
                  >
                    <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download Merged Image
                  </button>
                </div>
              ) : imageUrls.length > 0 ? (
                <div className="w-full">
                  <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4 text-center">{imageUrls.length} Images Selected</h3>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-[500px] overflow-y-auto p-2 rounded-xl bg-slate-200 dark:bg-slate-800">
                    {imageUrls.map((url, index) => (
                      <img 
                        key={index} 
                        src={url} 
                        alt={`Preview ${index}`} 
                        className="w-full h-full object-cover rounded-lg border-2 border-slate-300 dark:border-slate-600" 
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center text-slate-500 dark:text-slate-400">
                  <div className="mx-auto bg-slate-200 dark:bg-slate-700 w-16 h-16 rounded-2xl flex items-center justify-center mb-4">
                    <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2zm6 6v6m-6-6h6m-6 6l6-6m6 6l-6-6m6 6v-6m0 6h-6" />
                    </svg>
                  </div>
                  <p className="font-medium text-slate-900 dark:text-white">Upload images to get started</p>
                  <p className="text-sm mt-1">Your merged image will appear here.</p>
                </div>
              )}
              {error && (
                <div className="mt-4 p-3 rounded-lg bg-error-50 dark:bg-error-900/20 text-error-700 dark:text-error-300 text-sm">
                  <div className="flex items-center">
                    <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {error}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageMerger;