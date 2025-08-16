import React, { useState, useEffect } from 'react';
import type { Tool, ToolId } from './types';
import { ToolId as ToolIdEnum } from './types';
import Header from './components/Header';
import ToolGrid from './components/ToolGrid';
import Summarizer from './components/Summarizer';
import ImageGenerator from './components/ImageGenerator';
import TextExtractor from './components/TextExtractor';
import BackgroundRemover from './components/BackgroundRemover';
import ImageConverter from './components/ImageConverter';
import ImageMerger from './components/ImageMerger';
import ImageCompressor from './components/ImageCompressor';
import ImageEditor from './components/ImageEditor';
import SmartConverter from './components/SmartConverter';
import DocumentTranslator from './components/DocumentTranslator';
import PdfOcr from './components/PdfOcr';
import PdfSplitMerge from './components/PdfSplitMerge';
import PdfEditor from './components/PdfEditor';
import PdfEditorLanding from './components/PdfEditorLanding';
import RedesignedPdfEditor from './components/RedesignedPdfEditor';
import LandingPage from './components/LandingPage';
import FileUploadModal from './components/FileUploadModal';
import FileUploadPage from './components/FileUploadPage';
import WatermarkAdder from './components/WatermarkAdder';
import PdfTextExtractor from './components/PdfTextExtractor';

const App: React.FC = () => {
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [showPdfEditorLanding, setShowPdfEditorLanding] = useState(false);
  const [showRedesignedPdfEditor, setShowRedesignedPdfEditor] = useState(false);
  const [showLandingPage, setShowLandingPage] = useState(true);
  const [showFileUploadPage, setShowFileUploadPage] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]); // For tools that accept multiple files
  const [showFileUploadModal, setShowFileUploadModal] = useState(false);

  // Handle browser navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      
      if (hash === '#/pdf-editor-landing') {
        setShowPdfEditorLanding(true);
        setShowLandingPage(false);
        setShowFileUploadPage(false);
        setShowFileUploadModal(false);
        setSelectedTool(null);
        setUploadedFile(null);
        setUploadedFiles([]);
      } else if (hash === '#/pdf-editor') {
        setShowRedesignedPdfEditor(true);
        setShowPdfEditorLanding(false);
        setShowLandingPage(false);
        setShowFileUploadPage(false);
        setShowFileUploadModal(false);
        setSelectedTool(null);
        setUploadedFile(null);
        setUploadedFiles([]);
      } else if (hash === '#/tools') {
        setShowLandingPage(false);
        setShowPdfEditorLanding(false);
        setShowRedesignedPdfEditor(false);
        setShowFileUploadPage(false);
        setShowFileUploadModal(false);
        setSelectedTool(null);
        setUploadedFile(null);
        setUploadedFiles([]);
      } else if (hash === '#/upload') {
        setShowFileUploadPage(true);
        setShowLandingPage(false);
        setShowPdfEditorLanding(false);
        setShowRedesignedPdfEditor(false);
        setShowFileUploadModal(false);
        setSelectedTool(null);
        setUploadedFile(null);
        setUploadedFiles([]);
      } else if (hash.startsWith('#/tool/')) {
        // Handle tool selection from landing page
        const toolId = hash.replace('#/tool/', '') as ToolId;
        
        // Validate toolId exists in ToolIdEnum
        if (Object.values(ToolIdEnum).includes(toolId as ToolId)) {
          const tool: Tool = {
            id: toolId as ToolId,
            title: toolId,
            description: '',
            icon: null,
            premium: false
          };
          setSelectedTool(tool);
          setShowLandingPage(false);
          setShowFileUploadPage(false);
          setShowFileUploadModal(false);
        } else {
          // If invalid toolId, show tools page
          setShowLandingPage(false);
          setShowFileUploadPage(false);
          setSelectedTool(null);
          setUploadedFile(null);
          setUploadedFiles([]);
        }
      } else if (hash === '') {
        // Show landing page for root URL
        setShowLandingPage(true);
        setShowFileUploadPage(false);
        setShowPdfEditorLanding(false);
        setShowRedesignedPdfEditor(false);
        setShowFileUploadModal(false);
        setSelectedTool(null);
        setUploadedFile(null);
        setUploadedFiles([]);
      } else {
        // For any other hash, show tools
        setShowLandingPage(false);
        setShowFileUploadPage(false);
        setShowPdfEditorLanding(false);
        setShowRedesignedPdfEditor(false);
        setShowFileUploadModal(false);
        setSelectedTool(null);
        setUploadedFile(null);
        setUploadedFiles([]);
      }
    };

    // Check initial hash
    handleHashChange();
    
    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    
    // Listen for file upload events from LandingPage
    const handleFileUpload = (e: Event) => {
      const customEvent = e as CustomEvent<File>;
      setUploadedFile(customEvent.detail);
      setShowFileUploadModal(true);
    };
    
    window.addEventListener('fileUploaded', handleFileUpload as EventListener);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('fileUploaded', handleFileUpload as EventListener);
    };
  }, []);

  const handleToolSelectWithFile = (toolId: string, file: File) => {
    setUploadedFile(file);
    setUploadedFiles([file]); // For tools that might accept multiple files
    
    // Validate toolId exists in ToolIdEnum
    if (Object.values(ToolIdEnum).includes(toolId as ToolId)) {
      const tool: Tool = {
        id: toolId as ToolId,
        title: toolId,
        description: '',
        icon: null,
        premium: false
      };
      setSelectedTool(tool);
    }
    
    setShowFileUploadModal(false);
    setShowFileUploadPage(false);
    setShowLandingPage(false);
    window.location.hash = ''; // Clear hash to show tool page
  };

  const handleToolSelectFromFileUpload = (toolId: string, file: File) => {
    setUploadedFile(file);
    setUploadedFiles([file]); // For tools that might accept multiple files
    
    // Validate toolId exists in ToolIdEnum
    if (Object.values(ToolIdEnum).includes(toolId as ToolId)) {
      const tool: Tool = {
        id: toolId as ToolId,
        title: toolId,
        description: '',
        icon: null,
        premium: false
      };
      setSelectedTool(tool);
    }
    
    setShowFileUploadPage(false);
    setShowLandingPage(false);
    window.location.hash = ''; // Clear hash to show tool page
  };

  const renderContent = () => {
    if (showLandingPage && window.location.hash === '') {
      return <LandingPage />;
    }
    
    if (showFileUploadPage) {
      return (
        <FileUploadPage 
          onToolSelect={handleToolSelectFromFileUpload}
          onBack={() => {
            setShowFileUploadPage(false);
            window.location.hash = '';
          }}
        />
      );
    }
    
    if (showPdfEditorLanding) {
      return <PdfEditorLanding />;
    }
    
    if (showRedesignedPdfEditor) {
      return <RedesignedPdfEditor onBack={() => {
        setShowRedesignedPdfEditor(false);
        window.location.hash = '';
      }} />;
    }

    if (!selectedTool) {
      return <ToolGrid onSelectTool={setSelectedTool} />;
    }

    switch (selectedTool.id) {
      case ToolIdEnum.SUMMARIZER:
        return <Summarizer onBack={() => {
          setSelectedTool(null);
          setUploadedFile(null);
          setUploadedFiles([]);
        }} initialFile={uploadedFile || undefined} />;
      case ToolIdEnum.IMAGE_GENERATOR:
        return <ImageGenerator onBack={() => {
          setSelectedTool(null);
          setUploadedFile(null);
          setUploadedFiles([]);
        }} />;
      case ToolIdEnum.TEXT_EXTRACTOR:
        return <TextExtractor onBack={() => {
          setSelectedTool(null);
          setUploadedFile(null);
          setUploadedFiles([]);
        }} initialFile={uploadedFile || undefined} />;
      case ToolIdEnum.BACKGROUND_REMOVER:
        return <BackgroundRemover onBack={() => {
          setSelectedTool(null);
          setUploadedFile(null);
          setUploadedFiles([]);
        }} initialFile={uploadedFile || undefined} />;
      case ToolIdEnum.IMAGE_CONVERTER:
        return <ImageConverter onBack={() => {
          setSelectedTool(null);
          setUploadedFile(null);
          setUploadedFiles([]);
        }} initialFile={uploadedFile || undefined} />;
      case ToolIdEnum.IMAGE_MERGER:
        return <ImageMerger onBack={() => {
          setSelectedTool(null);
          setUploadedFile(null);
          setUploadedFiles([]);
        }} initialFiles={uploadedFiles.length > 0 ? uploadedFiles : undefined} />;
      case ToolIdEnum.IMAGE_COMPRESSOR:
        return <ImageCompressor onBack={() => {
          setSelectedTool(null);
          setUploadedFile(null);
          setUploadedFiles([]);
        }} initialFile={uploadedFile || undefined} />;
      case ToolIdEnum.IMAGE_EDITOR:
        return <ImageEditor onBack={() => {
          setSelectedTool(null);
          setUploadedFile(null);
          setUploadedFiles([]);
        }} initialFile={uploadedFile || undefined} />;
      case ToolIdEnum.SMART_CONVERTER:
        return <SmartConverter onBack={() => {
          setSelectedTool(null);
          setUploadedFile(null);
          setUploadedFiles([]);
        }} />;
      case ToolIdEnum.DOCUMENT_TRANSLATOR:
        return <DocumentTranslator onBack={() => {
          setSelectedTool(null);
          setUploadedFile(null);
          setUploadedFiles([]);
        }} initialFile={uploadedFile || undefined} />;
      case ToolIdEnum.PDF_OCR:
        return <PdfOcr onBack={() => {
          setSelectedTool(null);
          setUploadedFile(null);
          setUploadedFiles([]);
        }} initialFile={uploadedFile || undefined} />;
      case ToolIdEnum.PDF_SPLIT_MERGE:
        return <PdfSplitMerge onBack={() => {
          setSelectedTool(null);
          setUploadedFile(null);
          setUploadedFiles([]);
        }} />;
      case ToolIdEnum.PDF_EDITOR:
        // Navigate to the landing page
        setShowPdfEditorLanding(true);
        window.location.hash = '/pdf-editor-landing';
        setSelectedTool(null);
        setUploadedFile(null);
        setUploadedFiles([]);
        return null;
      case ToolIdEnum.WATERMARK_ADDER:
        return <WatermarkAdder onBack={() => {
          setSelectedTool(null);
          setUploadedFile(null);
          setUploadedFiles([]);
        }} initialFile={uploadedFile || undefined} />;
      case ToolIdEnum.PDF_TEXT_EXTRACTOR:
        return <PdfTextExtractor onBack={() => {
          setSelectedTool(null);
          setUploadedFile(null);
          setUploadedFiles([]);
        }} initialFile={uploadedFile || undefined} />;
      default:
        return <ToolGrid onSelectTool={setSelectedTool} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 text-slate-800 dark:text-slate-200 font-sans flex flex-col">
      {(!showPdfEditorLanding && !showRedesignedPdfEditor && !showLandingPage && !showFileUploadPage) || (showLandingPage && window.location.hash !== '') ? <Header /> : null}
      <main className="flex-grow pt-20">
        {renderContent()}
      </main>
      {(!showPdfEditorLanding && !showRedesignedPdfEditor && !showLandingPage && !showFileUploadPage) || (showLandingPage && window.location.hash !== '') ? (
        <footer className="text-center py-8 text-sm text-slate-600 dark:text-slate-400 border-t border-slate-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4">
            <p>&copy; {new Date().getFullYear()} PDF Master. All rights reserved.</p>
            <p className="mt-1">The ultimate AI-powered toolkit for all your document needs.</p>
          </div>
        </footer>
      ) : null}
      
      <FileUploadModal 
        isOpen={showFileUploadModal}
        onClose={() => {
          setShowFileUploadModal(false);
          setUploadedFile(null);
          setUploadedFiles([]);
        }}
        onToolSelect={handleToolSelectWithFile}
        uploadedFile={uploadedFile}
      />
    </div>
  );
};

export default App;