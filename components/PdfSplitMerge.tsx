import React, { useState, useCallback, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { PdfFileIcon } from './icons';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

interface PdfSplitMergeProps {
    onBack: () => void;
}

type Mode = 'merge' | 'split';

interface PdfPreview {
    id: string;
    file: File;
    name: string;
    pageCount: number;
    thumbnails: string[]; // For preview
}

interface SplitPage {
    index: number;
    thumbnail: string;
    selected: boolean;
}

const parsePageRanges = (rangeStr: string, maxPages: number): number[] => {
    const indices = new Set<number>();
    if (!rangeStr.trim()) {
        throw new Error('Page range cannot be empty.');
    }
    const parts = rangeStr.split(',');

    for (const part of parts) {
        const trimmedPart = part.trim();
        if (!trimmedPart) continue;

        if (trimmedPart.includes('-')) {
            const [start, end] = trimmedPart.split('-').map(num => parseInt(num.trim(), 10));
            if (isNaN(start) || isNaN(end) || start > end || start < 1 || end > maxPages) {
                throw new Error(`Invalid range: "${part}". Must be between 1 and ${maxPages}.`);
            }
            for (let i = start; i <= end; i++) {
                indices.add(i - 1); // pdf-lib is 0-indexed
            }
        } else {
            const pageNum = parseInt(trimmedPart, 10);
            if (isNaN(pageNum) || pageNum < 1 || pageNum > maxPages) {
                 throw new Error(`Invalid page number: "${part}". Must be between 1 and ${maxPages}.`);
            }
            indices.add(pageNum - 1);
        }
    }
    if (indices.size === 0) {
        throw new Error('No valid pages selected.');
    }
    return Array.from(indices).sort((a, b) => a - b);
};

const PdfSplitMerge: React.FC<PdfSplitMergeProps> = ({ onBack }) => {
    const [mode, setMode] = useState<Mode>('merge');
    
    // Merge State
    const [pdfPreviews, setPdfPreviews] = useState<PdfPreview[]>([]);
    
    // Split State
    const [singlePdfFile, setSinglePdfFile] = useState<File | null>(null);
    const [pageCount, setPageCount] = useState(0);
    const [splitPages, setSplitPages] = useState<SplitPage[]>([]);
    const [rangeInput, setRangeInput] = useState('');
    const [splitPreview, setSplitPreview] = useState<string | null>(null);

    // Shared State
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [outputUrl, setOutputUrl] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);

    // Generate thumbnails for PDF preview
    const generateThumbnails = async (file: File, maxPages: number = 10): Promise<string[]> => {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            
            const thumbnails: string[] = [];
            const pagesToProcess = Math.min(pdf.numPages, maxPages);
            
            for (let pageNum = 1; pageNum <= pagesToProcess; pageNum++) {
                const page = await pdf.getPage(pageNum);
                const viewport = page.getViewport({ scale: 0.5 }); // Small thumbnails
                
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                
                if (context) {
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;
                    
                    await page.render({
                        canvasContext: context,
                        viewport: viewport
                    }).promise;
                    
                    thumbnails.push(canvas.toDataURL());
                }
            }
            
            return thumbnails;
        } catch (err) {
            console.error('Thumbnail generation failed:', err);
            return [];
        }
    };

    const handleClear = () => {
        if (outputUrl) URL.revokeObjectURL(outputUrl);
        if (splitPreview) URL.revokeObjectURL(splitPreview);
        setPdfPreviews([]);
        setSinglePdfFile(null);
        setPageCount(0);
        setSplitPages([]);
        setRangeInput('');
        setSplitPreview(null);
        setError('');
        setOutputUrl(null);
        setIsLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const switchMode = (newMode: Mode) => {
        if (mode !== newMode) {
            handleClear();
            setMode(newMode);
        }
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) {
            return;
        }
        
        const filesToProcess = Array.from(files) as File[];
        handleClear();

        if (mode === 'merge') {
            const validFiles: { file: File; pageCount: number; thumbnails: string[] }[] = [];
            
            setIsLoading(true);
            setError('Validating PDF files...');
            
            for (let i = 0; i < filesToProcess.length; i++) {
                const file = filesToProcess[i];
                try {
                    // Check if file has PDF extension
                    if (!file.name.toLowerCase().endsWith('.pdf')) {
                        continue;
                    }
                    
                    // Try to load the PDF to validate it
                    const arrayBuffer = await file.arrayBuffer();
                    const pdfDoc = await PDFDocument.load(arrayBuffer);
                    const pageCount = pdfDoc.getPageCount();
                    
                    // Generate thumbnails for preview
                    const thumbnails = await generateThumbnails(file);
                    
                    validFiles.push({ 
                        file, 
                        pageCount, 
                        thumbnails 
                    });
                    
                } catch (err) {
                    console.error('File validation failed:', file.name, err);
                }
            }
            
            setIsLoading(false);
            
            if (validFiles.length === 0) {
                setError('No valid PDF files found. Please check your files.');
                return;
            }
            
            const newPreviews = validFiles.map(({ file, pageCount, thumbnails }) => ({
                id: `${file.name}-${file.lastModified}-${Math.random()}`,
                file,
                name: file.name,
                pageCount,
                thumbnails
            }));
            
            setPdfPreviews(newPreviews);
            setError('');
            
        } else { // split mode
            const file = filesToProcess[0];
            
            if (!file) {
                setError('No file selected.');
                return;
            }
            
            if (!file.name || !file.name.toLowerCase().endsWith('.pdf')) {
                setError('Please select a valid PDF file.');
                return;
            }
            
            setIsLoading(true);
            setError('');
            
            try {
                const arrayBuffer = await file.arrayBuffer();
                const pdfDoc = await PDFDocument.load(arrayBuffer, {
                    ignoreEncryption: true,
                    updateMetadata: false
                });
                
                const pages = pdfDoc.getPageCount();
                setPageCount(pages);
                setSinglePdfFile(file);
                
                // Generate thumbnails for all pages
                const thumbnails = await generateThumbnails(file, pages);
                const pagesData = Array.from({ length: pages }, (_, i) => ({
                    index: i,
                    thumbnail: thumbnails[i] || '',
                    selected: false
                }));
                
                setSplitPages(pagesData);
                setError('');
            } catch (err) {
                console.error('Failed to load PDF:', err);
                setError('Could not read the PDF file. It might be corrupted or password-protected.');
                setSinglePdfFile(null);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleMergePdfs = useCallback(async () => {
        if (pdfPreviews.length < 2) {
            setError('Please upload at least two PDF files to merge.');
            return;
        }
        
        setIsLoading(true);
        setError('');
        setOutputUrl(null);

        try {
            const mergedPdf = await PDFDocument.create();
            
            for (let i = 0; i < pdfPreviews.length; i++) {
                const pdfPreview = pdfPreviews[i];
                const pdfBytes = await pdfPreview.file.arrayBuffer();
                const pdf = await PDFDocument.load(pdfBytes);
                const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
                copiedPages.forEach((page) => mergedPdf.addPage(page));
            }
            
            const mergedPdfBytes = await mergedPdf.save();
            const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            
            setOutputUrl(url);
            
        } catch (err) {
            console.error('Merge failed:', err);
            setError('Failed to merge PDFs. One or more files may be corrupted or password-protected.');
        } finally {
            setIsLoading(false);
        }
    }, [pdfPreviews]);

    const handleSplitPdf = useCallback(async () => {
        if (!singlePdfFile) return;
        
        setIsLoading(true);
        setError('');
        setOutputUrl(null);
        setSplitPreview(null);

        try {
            let pageIndices: number[];
            
            if (rangeInput.trim()) {
                // Use manual range input
                pageIndices = parsePageRanges(rangeInput, pageCount);
            } else {
                // Use selected pages from visual interface
                pageIndices = splitPages
                    .filter(page => page.selected)
                    .map(page => page.index);
                
                if (pageIndices.length === 0) {
                    throw new Error('Please select at least one page to extract.');
                }
            }
            
            const pdfBytes = await singlePdfFile.arrayBuffer();
            const originalPdf = await PDFDocument.load(pdfBytes);

            const newPdf = await PDFDocument.create();
            const copiedPages = await newPdf.copyPages(originalPdf, pageIndices);
            copiedPages.forEach(page => newPdf.addPage(page));

            const newPdfBytes = await newPdf.save();
            const blob = new Blob([newPdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            
            setOutputUrl(url);
            setSplitPreview(url);
            
        } catch (err: any) {
            console.error('Split failed:', err);
            setError(err.message || 'Failed to split PDF. Please check your page selection.');
        } finally {
            setIsLoading(false);
        }
    }, [singlePdfFile, rangeInput, pageCount, splitPages]);

    const handleDragSort = () => {
        if (dragItem.current === null || dragOverItem.current === null) return;
        
        const newItems = [...pdfPreviews];
        const [draggedItem] = newItems.splice(dragItem.current, 1);
        newItems.splice(dragOverItem.current, 0, draggedItem);
        setPdfPreviews(newItems);

        dragItem.current = null;
        dragOverItem.current = null;
    };
    
    const togglePageSelection = (index: number) => {
        setSplitPages(prev => 
            prev.map(page => 
                page.index === index 
                    ? { ...page, selected: !page.selected } 
                    : page
            )
        );
    };
    
    const selectAllPages = () => {
        setSplitPages(prev => prev.map(page => ({ ...page, selected: true })));
    };
    
    const deselectAllPages = () => {
        setSplitPages(prev => prev.map(page => ({ ...page, selected: false })));
    };
    
    const renderMergeMode = () => (
        <>
            {!pdfPreviews.length ? (
                <div 
                    className="mt-1 flex justify-center items-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-md dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800/50 cursor-pointer min-h-[100px]" 
                    onClick={isLoading ? undefined : () => fileInputRef.current?.click()}
                >
                    {isLoading ? (
                        <div className="space-y-1 text-center">
                            <svg className="animate-spin mx-auto h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Validating PDFs...</p>
                        </div>
                    ) : (
                        <div className="space-y-1 text-center">
                            <PdfFileIcon />
                            <p className="text-sm text-slate-600 dark:text-slate-400">Click to upload multiple PDFs</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Select 2 or more PDF files to merge</p>
                            <input 
                                id="file-upload" 
                                type="file" 
                                className="sr-only" 
                                ref={fileInputRef} 
                                onChange={handleFileChange} 
                                accept=".pdf,application/pdf" 
                                multiple 
                                disabled={isLoading}
                            />
                        </div>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div>
                            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-3">File Order</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Drag and drop to reorder files. The merged PDF will be created in this order.</p>
                            
                            <div className="space-y-3">
                                {pdfPreviews.map((preview, index) => (
                                    <div 
                                        key={preview.id} 
                                        className="flex items-center gap-4 p-4 bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 shadow-sm hover:shadow-md transition-shadow"
                                        draggable 
                                        onDragStart={() => dragItem.current = index} 
                                        onDragEnter={() => dragOverItem.current = index} 
                                        onDragEnd={handleDragSort} 
                                        onDragOver={(e) => e.preventDefault()}
                                    >
                                        <div className="flex-shrink-0 cursor-grab text-slate-400">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        
                                        <div className="flex-shrink-0">
                                            <PdfFileIcon />
                                        </div>
                                        
                                        <div className="flex-grow min-w-0">
                                            <p className="font-medium text-slate-800 dark:text-slate-200 truncate">{preview.name}</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">{preview.pageCount} pages</p>
                                        </div>
                                        
                                        <div className="flex-shrink-0 text-xs text-slate-500 dark:text-slate-400">
                                            #{index + 1}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        {pdfPreviews.length > 0 && (
                            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4">
                                <h4 className="font-medium text-slate-800 dark:text-slate-200 mb-2">Preview</h4>
                                <div className="flex gap-2 overflow-x-auto pb-2">
                                    {pdfPreviews.map((preview, index) => (
                                        <div key={`${preview.id}-preview`} className="flex-shrink-0 text-center">
                                            <div className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded p-2">
                                                {preview.thumbnails.length > 0 ? (
                                                    <img 
                                                        src={preview.thumbnails[0]} 
                                                        alt={`Preview of ${preview.name}`} 
                                                        className="h-24 object-contain"
                                                    />
                                                ) : (
                                                    <div className="h-24 w-16 flex items-center justify-center bg-slate-100 dark:bg-slate-800">
                                                        <PdfFileIcon />
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-xs mt-1 text-slate-600 dark:text-slate-400 truncate w-16">#{index + 1}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <div className="space-y-6">
                        <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4">
                            <h3 className="text-lg font-medium text-indigo-800 dark:text-indigo-200 mb-2">Merge Summary</h3>
                            <ul className="text-sm text-indigo-700 dark:text-indigo-300 space-y-1">
                                <li>• {pdfPreviews.length} PDF files selected</li>
                                <li>• Total pages: {pdfPreviews.reduce((sum, preview) => sum + preview.pageCount, 0)}</li>
                                <li>• Files will be merged in order shown</li>
                            </ul>
                        </div>
                        
                        <div className="flex flex-col gap-3">
                            <button 
                                onClick={handleMergePdfs} 
                                disabled={isLoading || pdfPreviews.length < 2} 
                                className="w-full px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Merging...
                                    </>
                                ) : (
                                    'Merge PDFs'
                                )}
                            </button>
                            
                            {outputUrl && (
                                <a 
                                    href={outputUrl} 
                                    download="merged.pdf" 
                                    className="w-full text-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 flex items-center justify-center gap-2"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                    Download Merged PDF
                                </a>
                            )}
                            
                            <button 
                                onClick={handleClear} 
                                className="w-full px-6 py-2 text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
                            >
                                Clear All
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );

    const renderSplitMode = () => (
        <>
            {!singlePdfFile ? (
                <div 
                    className="mt-1 flex justify-center items-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-md dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800/50 cursor-pointer min-h-[100px]" 
                    onClick={isLoading ? undefined : () => fileInputRef.current?.click()}
                >
                    {isLoading ? (
                        <div className="space-y-1 text-center">
                            <svg className="animate-spin mx-auto h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Reading PDF...</p>
                        </div>
                    ) : (
                        <div className="space-y-1 text-center">
                            <PdfFileIcon />
                            <p className="text-sm text-slate-600 dark:text-slate-400">Click to upload a single PDF</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Select a PDF file to split into parts</p>
                            <input 
                                id="file-upload" 
                                type="file" 
                                className="sr-only" 
                                ref={fileInputRef} 
                                onChange={handleFileChange} 
                                accept=".pdf,application/pdf" 
                                disabled={isLoading}
                            />
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-8">
                    <div className="flex flex-col sm:flex-row gap-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                        <div className="flex-shrink-0">
                            <PdfFileIcon />
                        </div>
                        <div className="flex-grow">
                            <p className="font-medium text-slate-800 dark:text-slate-200">{singlePdfFile.name}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{pageCount} pages</p>
                        </div>
                        <div className="flex-shrink-0">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-200">
                                Ready to split
                            </span>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-medium text-slate-900 dark:text-white">Select Pages</h3>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={selectAllPages}
                                            className="text-xs px-2 py-1 bg-slate-200 text-slate-700 rounded hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
                                        >
                                            Select All
                                        </button>
                                        <button 
                                            onClick={deselectAllPages}
                                            className="text-xs px-2 py-1 bg-slate-200 text-slate-700 rounded hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
                                        >
                                            Deselect All
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                                    {splitPages.map((page) => (
                                        <div 
                                            key={page.index}
                                            onClick={() => togglePageSelection(page.index)}
                                            className={`relative cursor-pointer rounded-lg border-2 transition-all ${
                                                page.selected 
                                                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
                                                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                            }`}
                                        >
                                            <div className="p-2">
                                                {page.thumbnail ? (
                                                    <img 
                                                        src={page.thumbnail} 
                                                        alt={`Page ${page.index + 1}`} 
                                                        className="w-full h-24 object-contain bg-white dark:bg-slate-800"
                                                    />
                                                ) : (
                                                    <div className="h-24 flex items-center justify-center bg-white dark:bg-slate-800">
                                                        <PdfFileIcon />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-2 text-center">
                                                <span className={`text-xs font-medium ${
                                                    page.selected 
                                                        ? 'text-indigo-700 dark:text-indigo-300' 
                                                        : 'text-slate-500 dark:text-slate-400'
                                                }`}>
                                                    Page {page.index + 1}
                                                </span>
                                            </div>
                                            
                                            {page.selected && (
                                                <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4">
                                <h4 className="font-medium text-slate-800 dark:text-slate-200 mb-2">Manual Page Selection</h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                                    Or enter page numbers manually (e.g., 1-3, 5, 8-10)
                                </p>
                                <input 
                                    type="text" 
                                    value={rangeInput}
                                    onChange={(e) => setRangeInput(e.target.value)}
                                    placeholder="e.g., 1-3, 5, 8-10"
                                    className="block w-full pl-3 pr-3 py-2 text-base border-slate-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                />
                            </div>
                        </div>
                        
                        <div className="space-y-6">
                            <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4">
                                <h3 className="text-lg font-medium text-indigo-800 dark:text-indigo-200 mb-2">Split Summary</h3>
                                <ul className="text-sm text-indigo-700 dark:text-indigo-300 space-y-1">
                                    <li>• Original PDF: {pageCount} pages</li>
                                    <li>• Selected: {
                                        rangeInput.trim() 
                                            ? 'Manual selection' 
                                            : `${splitPages.filter(p => p.selected).length} pages`
                                    }</li>
                                    <li>• Output: New PDF with selected pages</li>
                                </ul>
                            </div>
                            
                            <div className="flex flex-col gap-3">
                                <button 
                                    onClick={handleSplitPdf} 
                                    disabled={isLoading || 
                                        (!rangeInput.trim() && splitPages.filter(p => p.selected).length === 0)}
                                    className="w-full px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed flex items-center justify-center"
                                >
                                    {isLoading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Splitting...
                                        </>
                                    ) : (
                                        'Split PDF'
                                    )}
                                </button>
                                
                                {outputUrl && (
                                    <div className="space-y-3">
                                        <a 
                                            href={outputUrl} 
                                            download="split.pdf" 
                                            className="w-full text-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 flex items-center justify-center gap-2"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                            Download Split PDF
                                        </a>
                                        
                                        {splitPreview && (
                                            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3">
                                                <h4 className="text-sm font-medium text-slate-800 dark:text-slate-200 mb-2">Preview</h4>
                                                <iframe 
                                                    src={splitPreview} 
                                                    className="w-full h-40 rounded border border-slate-200 dark:border-slate-700"
                                                    title="Split PDF Preview"
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}
                                
                                <button 
                                    onClick={handleClear} 
                                    className="w-full px-6 py-2 text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
                                >
                                    Clear
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );

    return (
        <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in">
            <button 
                onClick={onBack} 
                className="flex items-center text-sm font-medium text-slate-600 hover:text-indigo-600 mb-6 dark:text-slate-400 dark:hover:text-indigo-400"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Tools
            </button>

            <div className="bg-white rounded-xl shadow-lg p-8 dark:bg-slate-800">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">PDF Split & Merge</h2>
                        <p className="text-slate-500 dark:text-slate-400">Combine multiple PDFs, or extract specific pages from a single file.</p>
                    </div>
                    <div className="flex-shrink-0 flex gap-1 bg-slate-200 dark:bg-slate-700 p-1 rounded-lg">
                        <button 
                            onClick={() => switchMode('merge')} 
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${mode === 'merge' ? 'bg-white text-indigo-700 shadow dark:bg-slate-800 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}
                        >
                            Merge
                        </button>
                        <button 
                            onClick={() => switchMode('split')} 
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${mode === 'split' ? 'bg-white text-indigo-700 shadow dark:bg-slate-800 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}
                        >
                            Split
                        </button>
                    </div>
                </div>

                {mode === 'merge' ? renderMergeMode() : renderSplitMode()}

                {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
            </div>
        </div>
    );
};

export default PdfSplitMerge;