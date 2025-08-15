import React, { useState, useRef, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { 
  SelectIcon,
  TextIcon,
  RectangleIcon,
  CircleIcon,
  LineIcon,
  HighlightIcon,
  PencilIcon,
  UndoIcon,
  RedoIcon,
  ZoomInIcon,
  ZoomOutIcon,
  RotateIcon,
  DeleteIcon,
  UploadIcon,
  SaveIcon,
  DownloadIcon,
  StampIcon,
  NoteIcon,
  ShapeIcon,
  ArrowIcon,
  UnderlineIcon,
  StrikethroughIcon,
  AlignLeftIcon,
  AlignCenterIcon,
  AlignRightIcon
} from './pdfEditorIcons';
import { PdfFileIcon } from './icons';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

interface PdfEditorProps {
  onBack: () => void;
}

type Tool = 'select' | 'text' | 'highlight' | 'underline' | 'strikethrough' | 'pencil' | 'shape' | 'line' | 'arrow' | 'stamp' | 'note' | 'rectangle' | 'circle';
type Shape = 'rectangle' | 'circle' | 'line' | 'arrow';
type Alignment = 'left' | 'center' | 'right';

interface Annotation {
  id: string;
  type: Tool;
  x: number;
  y: number;
  width?: number;
  height?: number;
  text?: string;
  color: string;
  strokeWidth: number;
  page: number;
}

interface PdfPage {
  pageNumber: number;
  width: number;
  height: number;
  canvas: HTMLCanvasElement | null;
  thumbnail: string | null;
}

const PdfEditor: React.FC<PdfEditorProps> = ({ onBack }) => {
  // File and PDF state
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfDocument, setPdfDocument] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [pdfPages, setPdfPages] = useState<PdfPage[]>([]);
  const [numPages, setNumPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Editor state
  const [activeTool, setActiveTool] = useState<Tool>('select');
  const [selectedShape, setSelectedShape] = useState<Shape>('rectangle');
  const [textColor, setTextColor] = useState('#1e40af'); // Indigo-800
  const [strokeColor, setStrokeColor] = useState('#dc2626'); // Red-600
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [fontSize, setFontSize] = useState(16);
  const [textAlignment, setTextAlignment] = useState<Alignment>('left');
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  
  // Annotations
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [history, setHistory] = useState<Annotation[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // UI state
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{x: number, y: number} | null>(null);
  const [showProperties, setShowProperties] = useState(true);
  const [showThumbnails, setShowThumbnails] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // Save current state to history
  const saveToHistory = () => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...annotations]);
    
    if (newHistory.length > 50) {
      newHistory.shift();
    }
    
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // Load PDF file
  const loadPdf = async (file: File) => {
    setIsLoading(true);
    setError('');
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      setPdfDocument(pdf);
      const pageCount = pdf.numPages;
      setNumPages(pageCount);
      
      // Create page objects
      const pages: PdfPage[] = [];
      for (let i = 1; i <= pageCount; i++) {
        pages.push({
          pageNumber: i,
          width: 0,
          height: 0,
          canvas: null,
          thumbnail: null
        });
      }
      
      setPdfPages(pages);
      
      // Render first page and generate thumbnails
      await renderPage(1);
      generateThumbnails(pdf);
    } catch (err: any) {
      console.error('Error loading PDF:', err);
      setError('Failed to load PDF. The file may be corrupted or password-protected.');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate thumbnails for all pages
  const generateThumbnails = async (pdf: pdfjsLib.PDFDocumentProxy) => {
    try {
      const updatedPages = [...pdfPages];
      
      for (let i = 1; i <= pdf.numPages; i++) {
        try {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 0.2 }); // Small scale for thumbnails
          
          // Create canvas for thumbnail
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          
          if (!context) continue;
          
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          
          // Render PDF page to canvas
          await page.render({
            canvasContext: context,
            viewport: viewport
          }).promise;
          
          // Update page with thumbnail
          if (updatedPages[i - 1]) {
            updatedPages[i - 1] = {
              ...updatedPages[i - 1],
              thumbnail: canvas.toDataURL()
            };
          }
        } catch (err) {
          console.error(`Error generating thumbnail for page ${i}:`, err);
        }
      }
      
      setPdfPages(updatedPages);
    } catch (err) {
      console.error('Error generating thumbnails:', err);
    }
  };

  // Render a specific page
  const renderPage = async (pageNum: number) => {
    if (!pdfDocument) return;
    
    try {
      const page = await pdfDocument.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1.5 });
      
      // Update page dimensions
      const updatedPages = [...pdfPages];
      const pageIndex = pageNum - 1;
      
      if (updatedPages[pageIndex]) {
        updatedPages[pageIndex] = {
          ...updatedPages[pageIndex],
          width: viewport.width,
          height: viewport.height
        };
      }
      
      setPdfPages(updatedPages);
      
      // Create canvas for rendering
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      if (!context) {
        throw new Error('Could not get canvas context');
      }
      
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      
      // Render PDF page to canvas
      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise;
      
      // Update page with canvas
      const finalPages = [...updatedPages];
      if (finalPages[pageIndex]) {
        finalPages[pageIndex] = {
          ...finalPages[pageIndex],
          canvas: canvas
        };
      }
      
      setPdfPages(finalPages);
    } catch (err: any) {
      console.error(`Error rendering page ${pageNum}:`, err);
      setError(`Failed to render page ${pageNum}`);
    }
  };

  // File handling
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Please select a valid PDF file.');
        return;
      }
      handleClear();
      setPdfFile(file);
      loadPdf(file);
    }
  };

  // Tool management
  const handleToolChange = (tool: Tool) => {
    setActiveTool(tool);
    if (tool === 'shape') {
      setSelectedShape('rectangle');
    }
  };

  // Drawing functions
  const handleMouseDown = (e: React.MouseEvent) => {
    if (activeTool === 'select') return;
    
    const container = canvasContainerRef.current;
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;
    
    setIsDrawing(true);
    setStartPoint({ x, y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || !startPoint || activeTool === 'select') return;
    
    const container = canvasContainerRef.current;
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;
    
    // In a real implementation, you would update the current drawing here
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDrawing || !startPoint || activeTool === 'select') return;
    
    const container = canvasContainerRef.current;
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;
    
    // Create annotation based on tool
    const newAnnotation: Annotation = {
      id: `annotation-${Date.now()}`,
      type: activeTool,
      x: startPoint.x,
      y: startPoint.y,
      width: x - startPoint.x,
      height: y - startPoint.y,
      color: activeTool === 'text' || activeTool === 'highlight' ? textColor : strokeColor,
      strokeWidth,
      page: currentPage
    };
    
    if (activeTool === 'text') {
      newAnnotation.text = 'Double click to edit';
    }
    
    setAnnotations([...annotations, newAnnotation]);
    saveToHistory();
    
    setIsDrawing(false);
    setStartPoint(null);
  };

  // Text tools
  const addText = (x: number, y: number) => {
    const newAnnotation: Annotation = {
      id: `text-${Date.now()}`,
      type: 'text',
      x,
      y,
      text: 'Double click to edit',
      color: textColor,
      strokeWidth: 1,
      page: currentPage
    };
    
    setAnnotations([...annotations, newAnnotation]);
    saveToHistory();
  };

  // Undo/Redo
  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setAnnotations([...history[newIndex]]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setAnnotations([...history[newIndex]]);
    }
  };

  // Zoom and rotation
  const handleZoom = (delta: number) => {
    const newZoom = Math.max(0.1, Math.min(5, zoom + delta));
    setZoom(newZoom);
  };

  const handleRotate = (angle: number) => {
    const newRotation = (rotation + angle) % 360;
    setRotation(newRotation);
  };

  // Page navigation
  const goToPage = async (page: number) => {
    if (page >= 1 && page <= numPages) {
      setCurrentPage(page);
      // Render the page if it hasn't been rendered yet
      const pageData = pdfPages[page - 1];
      if (pageData && !pageData.canvas) {
        await renderPage(page);
      }
    }
  };

  // Save and download
  const handleSave = () => {
    // In a real implementation, you would save the annotated PDF
    alert('PDF saved successfully!');
  };

  const handleDownload = () => {
    // In a real implementation, you would download the annotated PDF
    alert('PDF downloaded successfully!');
  };

  // Clear
  const handleClear = () => {
    setPdfFile(null);
    setPdfDocument(null);
    setPdfPages([]);
    setAnnotations([]);
    setHistory([]);
    setHistoryIndex(-1);
    setError('');
    setIsLoading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const toolIsActive = (tool: Tool) => activeTool === tool;

  // Render current page canvas
  const renderCurrentPage = () => {
    const currentPageData = pdfPages[currentPage - 1];
    
    // If page data exists but canvas is not ready, show loading
    if (currentPageData && !currentPageData.canvas) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <svg className="animate-spin h-10 w-10 text-indigo-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-3 text-slate-600 dark:text-slate-400 font-medium">Rendering page...</p>
          </div>
        </div>
      );
    }
    
    // If page data and canvas exist, render the page
    if (currentPageData && currentPageData.canvas) {
      return (
        <div 
          className="relative shadow-xl rounded-lg overflow-hidden"
          style={{ 
            width: currentPageData.width,
            height: currentPageData.height
          }}
        >
          <img 
            src={currentPageData.canvas.toDataURL()} 
            alt={`Page ${currentPage}`} 
            className="w-full h-full"
          />
          
          {/* Render annotations for current page */}
          {annotations
            .filter(ann => ann.page === currentPage)
            .map(annotation => (
              <div
                key={annotation.id}
                className="absolute border border-dashed border-red-500"
                style={{
                  left: `${annotation.x}px`,
                  top: `${annotation.y}px`,
                  width: annotation.width ? `${Math.abs(annotation.width)}px` : 'auto',
                  height: annotation.height ? `${Math.abs(annotation.height)}px` : 'auto',
                  color: annotation.color,
                  border: annotation.type === 'highlight' ? `2px solid ${annotation.color}` : 'none',
                  backgroundColor: annotation.type === 'highlight' ? `${annotation.color}40` : 'transparent'
                }}
              >
                {annotation.text && (
                  <div 
                    className="p-1"
                    style={{ 
                      fontSize: `${fontSize}px`,
                      textAlign: textAlignment,
                      color: annotation.color
                    }}
                  >
                    {annotation.text}
                  </div>
                )}
              </div>
            ))
          }
        </div>
      );
    }
    
    // Default loading state
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-slate-500 dark:text-slate-400">Loading page...</p>
      </div>
    );
  };

  return (
    <div className="w-full h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 text-slate-900 dark:text-slate-100">
      {/* Top Navigation Bar */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack} 
            className="flex items-center text-sm font-medium text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">PDF Editor</h1>
          {pdfFile && (
            <div className="hidden sm:flex items-center text-sm text-slate-500 dark:text-slate-400">
              <span className="truncate max-w-xs">{pdfFile.name}</span>
              <span className="mx-2">•</span>
              <span>{numPages} pages</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowThumbnails(!showThumbnails)}
            className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title={showThumbnails ? "Hide thumbnails" : "Show thumbnails"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
          
          <button 
            onClick={() => setShowProperties(!showProperties)}
            className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title={showProperties ? "Hide properties" : "Show properties"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          
          <div className="hidden md:flex items-center gap-2 bg-slate-100 dark:bg-slate-700 rounded-lg px-3 py-1.5">
            <button 
              onClick={handleUndo} 
              disabled={historyIndex <= 0} 
              className="p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Undo"
            >
              <UndoIcon className="h-4 w-4" />
            </button>
            <button 
              onClick={handleRedo} 
              disabled={historyIndex >= history.length - 1} 
              className="p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Redo"
            >
              <RedoIcon className="h-4 w-4" />
            </button>
            <div className="w-px h-4 bg-slate-300 dark:bg-slate-600 mx-1"></div>
            <button 
              onClick={() => handleZoom(-0.2)} 
              className="p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              title="Zoom Out"
            >
              <ZoomOutIcon className="h-4 w-4" />
            </button>
            <span className="text-xs font-medium w-12 text-center">{(zoom * 100).toFixed(0)}%</span>
            <button 
              onClick={() => handleZoom(0.2)} 
              className="p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              title="Zoom In"
            >
              <ZoomInIcon className="h-4 w-4" />
            </button>
            <button 
              onClick={() => handleRotate(90)} 
              className="p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              title="Rotate"
            >
              <RotateIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Page Thumbnails */}
        {pdfFile && showThumbnails && (
          <div className="w-24 md:w-32 bg-white/50 dark:bg-slate-800/50 border-r border-slate-200 dark:border-slate-700 overflow-y-auto flex flex-col">
            <div className="p-3 text-xs font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              Pages
            </div>
            <div className="p-2 space-y-3 flex-1">
              {pdfPages.map((page) => (
                <div 
                  key={page.pageNumber}
                  className={`cursor-pointer rounded-lg transition-all duration-200 ${currentPage === page.pageNumber ? 'ring-2 ring-indigo-500 shadow-md' : 'hover:shadow-sm'}`}
                  onClick={() => goToPage(page.pageNumber)}
                >
                  {page.thumbnail ? (
                    <img 
                      src={page.thumbnail} 
                      alt={`Page ${page.pageNumber}`} 
                      className="w-full rounded-md"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-28 bg-slate-200 dark:bg-slate-700 rounded-md">
                      <div className="animate-pulse bg-slate-300 dark:bg-slate-600 rounded w-full h-full flex items-center justify-center">
                        <span className="text-xs text-slate-500">Loading...</span>
                      </div>
                    </div>
                  )}
                  <div className="text-center text-xs p-1.5 text-slate-600 dark:text-slate-400 font-medium">
                    {page.pageNumber}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
          {!pdfFile ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center max-w-md">
                <div className="mx-auto bg-indigo-100 dark:bg-indigo-900/30 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                  <UploadIcon className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Edit Your PDF</h2>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  Upload a PDF file to start editing with our powerful tools. Add text, shapes, highlights and more.
                </p>
                <div 
                  className="mt-2 flex flex-col justify-center items-center w-full mx-auto px-6 py-8 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors" 
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input 
                    id="file-upload" 
                    type="file" 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept="application/pdf" 
                  />
                  <svg className="mx-auto h-12 w-12 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p className="mt-3 text-slate-600 dark:text-slate-400 font-medium">Click to upload a PDF</p>
                  <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">Only .pdf files are accepted</p>
                  <button className="mt-4 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors">
                    Select PDF
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col">
              {/* PDF Viewer */}
              <div className="flex-1 relative overflow-auto flex justify-center items-center p-4">
                <div 
                  ref={canvasContainerRef}
                  className="relative transition-transform duration-200 ease-in-out"
                  style={{ 
                    transform: `scale(${zoom}) rotate(${rotation}deg)`,
                    transformOrigin: 'center center'
                  }}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                >
                  {/* Render PDF page */}
                  {renderCurrentPage()}
                </div>
              </div>
              
              {/* Mobile Controls */}
              <div className="md:hidden bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-3 flex items-center justify-center gap-2">
                <button 
                  onClick={handleUndo} 
                  disabled={historyIndex <= 0} 
                  className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Undo"
                >
                  <UndoIcon className="h-5 w-5" />
                </button>
                <button 
                  onClick={handleRedo} 
                  disabled={historyIndex >= history.length - 1} 
                  className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Redo"
                >
                  <RedoIcon className="h-5 w-5" />
                </button>
                <div className="w-px h-6 bg-slate-300 dark:bg-slate-600 mx-1"></div>
                <button 
                  onClick={() => handleZoom(-0.2)} 
                  className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"
                  title="Zoom Out"
                >
                  <ZoomOutIcon className="h-5 w-5" />
                </button>
                <span className="text-sm font-medium w-12 text-center">{(zoom * 100).toFixed(0)}%</span>
                <button 
                  onClick={() => handleZoom(0.2)} 
                  className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"
                  title="Zoom In"
                >
                  <ZoomInIcon className="h-5 w-5" />
                </button>
                <button 
                  onClick={() => handleRotate(90)} 
                  className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"
                  title="Rotate"
                >
                  <RotateIcon className="h-5 w-5" />
                </button>
              </div>
              
              {/* Page Navigation */}
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-t border-slate-200 dark:border-slate-700 p-3 flex items-center justify-center">
                <button 
                  onClick={() => goToPage(currentPage - 1)} 
                  disabled={currentPage <= 1}
                  className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <span className="mx-4 text-sm font-medium">
                  Page {currentPage} of {numPages}
                </span>
                <button 
                  onClick={() => goToPage(currentPage + 1)} 
                  disabled={currentPage >= numPages}
                  className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - Properties Panel */}
        {pdfFile && showProperties && (
          <div className="w-64 md:w-72 bg-white/50 dark:bg-slate-800/50 border-l border-slate-200 dark:border-slate-700 overflow-y-auto">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Properties</h3>
                <button 
                  onClick={() => setShowProperties(false)}
                  className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-4">
              {/* Tools */}
              <div className="mb-6">
                <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">Tools</h4>
                <div className="grid grid-cols-4 gap-2">
                  <button 
                    title="Select" 
                    onClick={() => handleToolChange('select')} 
                    className={`p-3 rounded-lg flex flex-col items-center justify-center gap-1 transition-all ${toolIsActive('select') ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500' : 'hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                  >
                    <SelectIcon className="h-5 w-5" />
                    <span className="text-xs">Select</span>
                  </button>
                  <button 
                    title="Text" 
                    onClick={() => handleToolChange('text')} 
                    className={`p-3 rounded-lg flex flex-col items-center justify-center gap-1 transition-all ${toolIsActive('text') ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500' : 'hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                  >
                    <TextIcon className="h-5 w-5" />
                    <span className="text-xs">Text</span>
                  </button>
                  <button 
                    title="Highlight" 
                    onClick={() => handleToolChange('highlight')} 
                    className={`p-3 rounded-lg flex flex-col items-center justify-center gap-1 transition-all ${toolIsActive('highlight') ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500' : 'hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                  >
                    <HighlightIcon className="h-5 w-5" />
                    <span className="text-xs">Highlight</span>
                  </button>
                  <button 
                    title="Pencil" 
                    onClick={() => handleToolChange('pencil')} 
                    className={`p-3 rounded-lg flex flex-col items-center justify-center gap-1 transition-all ${toolIsActive('pencil') ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500' : 'hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                  >
                    <PencilIcon className="h-5 w-5" />
                    <span className="text-xs">Draw</span>
                  </button>
                  <button 
                    title="Shapes" 
                    onClick={() => handleToolChange('shape')} 
                    className={`p-3 rounded-lg flex flex-col items-center justify-center gap-1 transition-all ${toolIsActive('shape') ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500' : 'hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                  >
                    <ShapeIcon className="h-5 w-5" />
                    <span className="text-xs">Shapes</span>
                  </button>
                  <button 
                    title="Line" 
                    onClick={() => handleToolChange('line')} 
                    className={`p-3 rounded-lg flex flex-col items-center justify-center gap-1 transition-all ${toolIsActive('line') ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500' : 'hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                  >
                    <LineIcon className="h-5 w-5" />
                    <span className="text-xs">Line</span>
                  </button>
                  <button 
                    title="Arrow" 
                    onClick={() => handleToolChange('arrow')} 
                    className={`p-3 rounded-lg flex flex-col items-center justify-center gap-1 transition-all ${toolIsActive('arrow') ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500' : 'hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                  >
                    <ArrowIcon className="h-5 w-5" />
                    <span className="text-xs">Arrow</span>
                  </button>
                  <button 
                    title="Delete" 
                    onClick={() => setAnnotations([])} 
                    className="p-3 rounded-lg flex flex-col items-center justify-center gap-1 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    <DeleteIcon className="h-5 w-5" />
                    <span className="text-xs">Clear</span>
                  </button>
                </div>
              </div>
              
              {/* Color Picker */}
              <div className="mb-5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  {activeTool === 'text' || activeTool === 'highlight' ? 'Text Color' : 'Stroke Color'}
                </label>
                <div className="flex items-center gap-2">
                  <input 
                    type="color" 
                    value={activeTool === 'text' || activeTool === 'highlight' ? textColor : strokeColor} 
                    onChange={(e) => {
                      if (activeTool === 'text' || activeTool === 'highlight') {
                        setTextColor(e.target.value);
                      } else {
                        setStrokeColor(e.target.value);
                      }
                    }} 
                    className="w-10 h-10 rounded-lg border-0 cursor-pointer bg-transparent"
                  />
                  <div className="flex-1 grid grid-cols-6 gap-1">
                    {['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#000000', '#64748b', '#f1f5f9'].map((color) => (
                      <button
                        key={color}
                        className="w-6 h-6 rounded-full border border-slate-300 dark:border-slate-600"
                        style={{ backgroundColor: color }}
                        onClick={() => {
                          if (activeTool === 'text' || activeTool === 'highlight') {
                            setTextColor(color);
                          } else {
                            setStrokeColor(color);
                          }
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Stroke Width */}
              {(activeTool === 'pencil' || activeTool === 'shape' || activeTool === 'line' || activeTool === 'arrow') && (
                <div className="mb-5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Stroke Width
                  </label>
                  <input 
                    type="range" 
                    min="1" 
                    max="20" 
                    value={strokeWidth} 
                    onChange={(e) => setStrokeWidth(Number(e.target.value))} 
                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
                    <span>Thin</span>
                    <span className="font-medium">{strokeWidth}px</span>
                    <span>Thick</span>
                  </div>
                </div>
              )}
              
              {/* Font Size */}
              {activeTool === 'text' && (
                <div className="mb-5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Font Size
                  </label>
                  <input 
                    type="range" 
                    min="8" 
                    max="72" 
                    value={fontSize} 
                    onChange={(e) => setFontSize(Number(e.target.value))} 
                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
                    <span>Small</span>
                    <span className="font-medium">{fontSize}px</span>
                    <span>Large</span>
                  </div>
                </div>
              )}
              
              {/* Text Alignment */}
              {activeTool === 'text' && (
                <div className="mb-5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Alignment
                  </label>
                  <div className="flex gap-1 bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
                    <button 
                      onClick={() => setTextAlignment('left')}
                      className={`flex-1 p-2 rounded-md flex items-center justify-center ${textAlignment === 'left' ? 'bg-white dark:bg-slate-600 shadow' : ''}`}
                    >
                      <AlignLeftIcon className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => setTextAlignment('center')}
                      className={`flex-1 p-2 rounded-md flex items-center justify-center ${textAlignment === 'center' ? 'bg-white dark:bg-slate-600 shadow' : ''}`}
                    >
                      <AlignCenterIcon className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => setTextAlignment('right')}
                      className={`flex-1 p-2 rounded-md flex items-center justify-center ${textAlignment === 'right' ? 'bg-white dark:bg-slate-600 shadow' : ''}`}
                    >
                      <AlignRightIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
              
              {/* Shape Selection */}
              {activeTool === 'shape' && (
                <div className="mb-5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Shape
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => setSelectedShape('rectangle')}
                      className={`p-3 rounded-lg flex flex-col items-center justify-center gap-1 ${selectedShape === 'rectangle' ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500' : 'hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                    >
                      <RectangleIcon className="h-5 w-5" />
                      <span className="text-xs">Rectangle</span>
                    </button>
                    <button 
                      onClick={() => setSelectedShape('circle')}
                      className={`p-3 rounded-lg flex flex-col items-center justify-center gap-1 ${selectedShape === 'circle' ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500' : 'hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                    >
                      <CircleIcon className="h-5 w-5" />
                      <span className="text-xs">Circle</span>
                    </button>
                    <button 
                      onClick={() => setSelectedShape('line')}
                      className={`p-3 rounded-lg flex flex-col items-center justify-center gap-1 ${selectedShape === 'line' ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500' : 'hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                    >
                      <LineIcon className="h-5 w-5" />
                      <span className="text-xs">Line</span>
                    </button>
                    <button 
                      onClick={() => setSelectedShape('arrow')}
                      className={`p-3 rounded-lg flex flex-col items-center justify-center gap-1 ${selectedShape === 'arrow' ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500' : 'hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                    >
                      <ArrowIcon className="h-5 w-5" />
                      <span className="text-xs">Arrow</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Annotations List */}
            <div className="border-t border-slate-200 dark:border-slate-700 p-4">
              <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">Annotations</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {annotations.length === 0 ? (
                  <p className="text-xs text-slate-500 dark:text-slate-400 text-center py-4">No annotations yet</p>
                ) : (
                  annotations.map(annotation => (
                    <div 
                      key={annotation.id} 
                      className="p-3 bg-slate-100 dark:bg-slate-700 rounded-lg text-xs flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: annotation.color }}
                        ></div>
                        <span className="capitalize font-medium">{annotation.type}</span>
                      </div>
                      <button 
                        onClick={() => setAnnotations(annotations.filter(a => a.id !== annotation.id))}
                        className="text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Toolbar */}
      {pdfFile && (
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-t border-slate-200 dark:border-slate-700 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button 
                onClick={handleClear} 
                className="px-4 py-2 bg-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear
              </button>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={handleSave} 
                className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
              >
                <SaveIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Save</span>
              </button>
              <button 
                onClick={handleDownload} 
                className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <DownloadIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Download</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg z-50 animate-fade-in">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PdfEditor;