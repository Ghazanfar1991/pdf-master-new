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
  CheckIcon,
  CrossIcon,
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
  const [textColor, setTextColor] = useState('#000000');
  const [strokeColor, setStrokeColor] = useState('#FF0000');
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
    const newZoom = Math.max(0.5, Math.min(3, zoom + delta));
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
            <svg className="animate-spin h-8 w-8 text-indigo-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-2 text-slate-600 dark:text-slate-400">Rendering page...</p>
          </div>
        </div>
      );
    }
    
    // If page data and canvas exist, render the page
    if (currentPageData && currentPageData.canvas) {
      return (
        <div 
          className="relative"
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
                      textAlign: textAlignment
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
        <p className="text-slate-500">Loading page...</p>
      </div>
    );
  };

  return (
    <div className="w-full h-screen flex flex-col bg-slate-100 dark:bg-slate-900">
      {/* Header - Top Toolbar */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack} 
              className="flex items-center text-sm font-medium text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Tools
            </button>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">PDF Editor</h1>
          </div>
          
          {/* Editing Tools */}
          <div className="flex items-center gap-1">
            <button 
              title="Select" 
              onClick={() => handleToolChange('select')} 
              className={`p-2 rounded-md ${toolIsActive('select') ? 'bg-indigo-600 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-700'}`}
            >
              <SelectIcon className="h-5 w-5" />
            </button>
            <button 
              title="Text" 
              onClick={() => handleToolChange('text')} 
              className={`p-2 rounded-md ${toolIsActive('text') ? 'bg-indigo-600 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-700'}`}
            >
              <TextIcon className="h-5 w-5" />
            </button>
            <button 
              title="Highlight" 
              onClick={() => handleToolChange('highlight')} 
              className={`p-2 rounded-md ${toolIsActive('highlight') ? 'bg-indigo-600 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-700'}`}
            >
              <HighlightIcon className="h-5 w-5" />
            </button>
            <button 
              title="Underline" 
              onClick={() => handleToolChange('underline')} 
              className={`p-2 rounded-md ${toolIsActive('underline') ? 'bg-indigo-600 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-700'}`}
            >
              <UnderlineIcon className="h-5 w-5" />
            </button>
            <button 
              title="Strikethrough" 
              onClick={() => handleToolChange('strikethrough')} 
              className={`p-2 rounded-md ${toolIsActive('strikethrough') ? 'bg-indigo-600 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-700'}`}
            >
              <StrikethroughIcon className="h-5 w-5" />
            </button>
            <button 
              title="Pencil" 
              onClick={() => handleToolChange('pencil')} 
              className={`p-2 rounded-md ${toolIsActive('pencil') ? 'bg-indigo-600 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-700'}`}
            >
              <PencilIcon className="h-5 w-5" />
            </button>
            <button 
              title="Shapes" 
              onClick={() => handleToolChange('shape')} 
              className={`p-2 rounded-md ${toolIsActive('shape') ? 'bg-indigo-600 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-700'}`}
            >
              <ShapeIcon className="h-5 w-5" />
            </button>
            <button 
              title="Line" 
              onClick={() => handleToolChange('line')} 
              className={`p-2 rounded-md ${toolIsActive('line') ? 'bg-indigo-600 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-700'}`}
            >
              <LineIcon className="h-5 w-5" />
            </button>
            <button 
              title="Arrow" 
              onClick={() => handleToolChange('arrow')} 
              className={`p-2 rounded-md ${toolIsActive('arrow') ? 'bg-indigo-600 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-700'}`}
            >
              <ArrowIcon className="h-5 w-5" />
            </button>
            <button 
              title="Stamp" 
              onClick={() => handleToolChange('stamp')} 
              className={`p-2 rounded-md ${toolIsActive('stamp') ? 'bg-indigo-600 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-700'}`}
            >
              <StampIcon className="h-5 w-5" />
            </button>
            <button 
              title="Note" 
              onClick={() => handleToolChange('note')} 
              className={`p-2 rounded-md ${toolIsActive('note') ? 'bg-indigo-600 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-700'}`}
            >
              <NoteIcon className="h-5 w-5" />
            </button>
            <div className="w-px h-6 bg-slate-300 dark:bg-slate-600 mx-2"></div>
            <button 
              title="Delete" 
              onClick={() => setAnnotations([])} 
              className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md"
            >
              <DeleteIcon className="h-5 w-5" />
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={handleUndo} 
              disabled={historyIndex <= 0} 
              className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md disabled:opacity-50"
              title="Undo"
            >
              <UndoIcon className="h-5 w-5" />
            </button>
            <button 
              onClick={handleRedo} 
              disabled={historyIndex >= history.length - 1} 
              className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md disabled:opacity-50"
              title="Redo"
            >
              <RedoIcon className="h-5 w-5" />
            </button>
            <div className="w-px h-6 bg-slate-300 dark:bg-slate-600 mx-2"></div>
            <button 
              onClick={() => handleZoom(-0.1)} 
              className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md"
              title="Zoom Out"
            >
              <ZoomOutIcon className="h-5 w-5" />
            </button>
            <span className="text-sm font-medium w-16 text-center">{(zoom * 100).toFixed(0)}%</span>
            <button 
              onClick={() => handleZoom(0.1)} 
              className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md"
              title="Zoom In"
            >
              <ZoomInIcon className="h-5 w-5" />
            </button>
            <button 
              onClick={() => handleRotate(90)} 
              className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md"
              title="Rotate"
            >
              <RotateIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Page Thumbnails */}
        {pdfFile && (
          <div className="w-32 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 overflow-y-auto">
            <div className="p-2 text-xs font-medium text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
              Pages ({numPages})
            </div>
            <div className="p-2 space-y-2">
              {pdfPages.map((page) => (
                <div 
                  key={page.pageNumber}
                  className={`cursor-pointer rounded border ${currentPage === page.pageNumber ? 'border-indigo-500 ring-2 ring-indigo-200 dark:ring-indigo-900' : 'border-slate-200 dark:border-slate-700'} bg-slate-100 dark:bg-slate-700`}
                  onClick={() => goToPage(page.pageNumber)}
                >
                  {page.thumbnail ? (
                    <img 
                      src={page.thumbnail} 
                      alt={`Page ${page.pageNumber}`} 
                      className="w-full"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-24">
                      <div className="animate-pulse bg-slate-200 dark:bg-slate-600 rounded w-full h-full flex items-center justify-center">
                        <span className="text-xs text-slate-500">Loading...</span>
                      </div>
                    </div>
                  )}
                  <div className="text-center text-xs p-1 text-slate-600 dark:text-slate-400">
                    {page.pageNumber}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col">
          {!pdfFile ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div 
                  className="mt-4 flex flex-col justify-center items-center w-full max-w-2xl mx-auto px-6 py-10 border-2 border-slate-300 border-dashed rounded-md dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800/50 cursor-pointer" 
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
                  <UploadIcon className="mx-auto h-12 w-12 text-slate-400" />
                  <p className="mt-2 text-slate-500">Click to upload a PDF</p>
                  <p className="text-xs text-slate-500 mt-1">Only .pdf files are accepted</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col">
              {/* PDF Viewer */}
              <div className="flex-1 relative bg-slate-200 dark:bg-slate-700 overflow-auto flex justify-center items-center p-4">
                <div 
                  ref={canvasContainerRef}
                  className="relative bg-white shadow-lg"
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
                  
                  {isLoading && (
                    <div className="absolute inset-0 bg-white/80 dark:bg-slate-800/80 flex flex-col justify-center items-center rounded-md z-50">
                      <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <p className="mt-2 text-slate-600 dark:text-slate-400">Loading PDF...</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Page Navigation */}
              <div className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-3 flex items-center justify-center">
                <button 
                  onClick={() => goToPage(currentPage - 1)} 
                  disabled={currentPage <= 1}
                  className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md disabled:opacity-50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <span className="mx-4 text-sm">
                  Page {currentPage} of {numPages}
                </span>
                <button 
                  onClick={() => goToPage(currentPage + 1)} 
                  disabled={currentPage >= numPages}
                  className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md disabled:opacity-50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - Properties */}
        <div className="w-64 bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 flex flex-col">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-2">Properties</h3>
            
            {/* Color Picker */}
            <div className="mb-4">
              <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1">Color</label>
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
                className="w-full h-8 rounded border cursor-pointer"
              />
            </div>
            
            {/* Stroke Width */}
            {(activeTool === 'pencil' || activeTool === 'shape' || activeTool === 'line' || activeTool === 'arrow') && (
              <div className="mb-4">
                <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1">Stroke Width</label>
                <input 
                  type="range" 
                  min="1" 
                  max="20" 
                  value={strokeWidth} 
                  onChange={(e) => setStrokeWidth(Number(e.target.value))} 
                  className="w-full" 
                />
                <span className="text-xs text-slate-500">{strokeWidth}px</span>
              </div>
            )}
            
            {/* Font Size */}
            {activeTool === 'text' && (
              <div className="mb-4">
                <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1">Font Size</label>
                <input 
                  type="range" 
                  min="8" 
                  max="72" 
                  value={fontSize} 
                  onChange={(e) => setFontSize(Number(e.target.value))} 
                  className="w-full" 
                />
                <span className="text-xs text-slate-500">{fontSize}px</span>
              </div>
            )}
            
            {/* Text Alignment */}
            {activeTool === 'text' && (
              <div className="mb-4">
                <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1">Alignment</label>
                <div className="flex gap-1">
                  <button 
                    onClick={() => setTextAlignment('left')}
                    className={`p-2 rounded ${textAlignment === 'left' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                  >
                    <AlignLeftIcon className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => setTextAlignment('center')}
                    className={`p-2 rounded ${textAlignment === 'center' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                  >
                    <AlignCenterIcon className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => setTextAlignment('right')}
                    className={`p-2 rounded ${textAlignment === 'right' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                  >
                    <AlignRightIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
            
            {/* Shape Selection */}
            {activeTool === 'shape' && (
              <div className="mb-4">
                <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1">Shape</label>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => setSelectedShape('rectangle')}
                    className={`p-2 rounded text-xs flex items-center justify-center gap-1 ${selectedShape === 'rectangle' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                  >
                    <RectangleIcon className="h-4 w-4" />
                    Rectangle
                  </button>
                  <button 
                    onClick={() => setSelectedShape('circle')}
                    className={`p-2 rounded text-xs flex items-center justify-center gap-1 ${selectedShape === 'circle' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                  >
                    <CircleIcon className="h-4 w-4" />
                    Circle
                  </button>
                  <button 
                    onClick={() => setSelectedShape('line')}
                    className={`p-2 rounded text-xs flex items-center justify-center gap-1 ${selectedShape === 'line' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                  >
                    <LineIcon className="h-4 w-4" />
                    Line
                  </button>
                  <button 
                    onClick={() => setSelectedShape('arrow')}
                    className={`p-2 rounded text-xs flex items-center justify-center gap-1 ${selectedShape === 'arrow' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                  >
                    <ArrowIcon className="h-4 w-4" />
                    Arrow
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Annotations List */}
          <div className="flex-1 overflow-y-auto p-4">
            <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-2">Annotations</h3>
            <div className="space-y-2">
              {annotations.length === 0 ? (
                <p className="text-xs text-slate-500 dark:text-slate-400">No annotations yet</p>
              ) : (
                annotations.map(annotation => (
                  <div 
                    key={annotation.id} 
                    className="p-2 bg-slate-100 dark:bg-slate-700 rounded text-xs flex items-center justify-between"
                  >
                    <span className="capitalize">{annotation.type}</span>
                    <button 
                      onClick={() => setAnnotations(annotations.filter(a => a.id !== annotation.id))}
                      className="text-red-500 hover:text-red-700"
                    >
                      <CrossIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Toolbar */}
      <div className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={handleClear} 
              className="px-4 py-2 bg-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
            >
              Clear
            </button>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={handleSave} 
              disabled={!pdfFile} 
              className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <SaveIcon className="h-4 w-4" />
              Save
            </button>
            <button 
              onClick={handleDownload} 
              disabled={!pdfFile} 
              className="px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <DownloadIcon className="h-4 w-4" />
              Download
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg z-50">
          {error}
        </div>
      )}
    </div>
  );
};

export default PdfEditor;