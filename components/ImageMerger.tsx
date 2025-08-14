import React, { useState, useCallback, useRef } from 'react';

interface ImageMergerProps {
  onBack: () => void;
}

type Layout = 'horizontal' | 'vertical' | 'grid';

const ImageMerger: React.FC<ImageMergerProps> = ({ onBack }) => {
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [mergedImageUrl, setMergedImageUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [layout, setLayout] = useState<Layout>('horizontal');
  const [columns, setColumns] = useState(2);
  const [spacing, setSpacing] = useState(10);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const validFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
      if (validFiles.length === 0) {
        setError('Please select valid image files.');
        return;
      }
      handleClear();
      setImageFiles(validFiles);
      const urls = validFiles.map(file => URL.createObjectURL(file));
      setImageUrls(urls);
    }
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
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Image Merger</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6">Combine multiple images into a single masterpiece. Choose your layout, add spacing, and download.</p>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Panel: Upload & Settings */}
                <div className="lg:col-span-1 space-y-6">
                    <div>
                        <label htmlFor="file-upload" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Upload Images</label>
                        <div 
                            className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-md dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <div className="space-y-1 text-center">
                                <svg className="mx-auto h-12 w-12 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <p className="text-sm text-slate-600 dark:text-slate-400">Click to upload</p>
                                <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} multiple accept="image/*" ref={fileInputRef} />
                            </div>
                        </div>
                    </div>

                    {imageFiles.length > 0 && (
                        <>
                            <div className="bg-slate-100 dark:bg-slate-800/50 p-4 rounded-lg space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Layout</label>
                                    <div className="flex gap-2">
                                        { (['horizontal', 'vertical', 'grid'] as Layout[]).map(l => (
                                            <button key={l} onClick={() => setLayout(l)} className={`w-full capitalize px-3 py-2 text-sm rounded-md transition-colors ${layout === l ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600'}`}>{l}</button>
                                        ))}
                                    </div>
                                </div>
                                {layout === 'grid' && (
                                    <div>
                                        <label htmlFor="columns" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Columns: {columns}</label>
                                        <input type="range" id="columns" min="2" max={Math.max(2, imageFiles.length)} value={columns} onChange={e => setColumns(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-600" />
                                    </div>
                                )}
                                <div>
                                    <label htmlFor="spacing" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Spacing: {spacing}px</label>
                                    <input type="range" id="spacing" min="0" max="100" value={spacing} onChange={e => setSpacing(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-600" />
                                </div>
                            </div>
                             <div className="flex flex-col gap-3">
                                <button onClick={handleMerge} disabled={isLoading || imageFiles.length < 2} className="w-full px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed">
                                    {isLoading ? 'Merging...' : 'Merge Images'}
                                </button>
                                <button onClick={handleClear} className="w-full px-6 py-2 bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600">
                                    Clear All
                                </button>
                            </div>
                        </>
                    )}
                </div>

                {/* Right Panel: Previews */}
                <div className="lg:col-span-2">
                     <div className="w-full h-full bg-slate-100 dark:bg-slate-900/50 rounded-lg p-4 flex flex-col items-center justify-center min-h-[400px]">
                        {mergedImageUrl ? (
                            <div>
                                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4 text-center">Merged Result</h3>
                                <img src={mergedImageUrl} alt="Merged result" className="max-w-full max-h-[500px] object-contain rounded-md shadow-lg" />
                                <button onClick={handleDownload} className="mt-4 w-full px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 flex items-center justify-center gap-2">
                                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                    Download Merged Image
                                </button>
                            </div>
                        ) : imageUrls.length > 0 ? (
                           <div>
                                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4 text-center">{imageUrls.length} Images Selected</h3>
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-[500px] overflow-y-auto p-2 rounded-md bg-slate-200 dark:bg-slate-700">
                                    {imageUrls.map((url, index) => (
                                        <img key={index} src={url} alt={`Preview ${index}`} className="w-full h-full object-cover rounded" />
                                    ))}
                                </div>
                           </div>
                        ) : (
                            <div className="text-center text-slate-500">
                                <p>Upload images to get started.</p>
                                <p className="text-sm">Your merged image will appear here.</p>
                            </div>
                        )}
                         {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default ImageMerger;