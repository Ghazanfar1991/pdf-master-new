import React, { useState } from 'react';
import type { Tool } from './types';
import { ToolId } from './types';
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

const App: React.FC = () => {
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);

  const renderContent = () => {
    if (!selectedTool) {
      return <ToolGrid onSelectTool={setSelectedTool} />;
    }

    switch (selectedTool.id) {
      case ToolId.SUMMARIZER:
        return <Summarizer onBack={() => setSelectedTool(null)} />;
      case ToolId.IMAGE_GENERATOR:
        return <ImageGenerator onBack={() => setSelectedTool(null)} />;
      case ToolId.TEXT_EXTRACTOR:
        return <TextExtractor onBack={() => setSelectedTool(null)} />;
      case ToolId.BACKGROUND_REMOVER:
        return <BackgroundRemover onBack={() => setSelectedTool(null)} />;
      case ToolId.IMAGE_CONVERTER:
        return <ImageConverter onBack={() => setSelectedTool(null)} />;
      case ToolId.IMAGE_MERGER:
        return <ImageMerger onBack={() => setSelectedTool(null)} />;
      case ToolId.IMAGE_COMPRESSOR:
        return <ImageCompressor onBack={() => setSelectedTool(null)} />;
      case ToolId.IMAGE_EDITOR:
        return <ImageEditor onBack={() => setSelectedTool(null)} />;
      case ToolId.SMART_CONVERTER:
        return <SmartConverter onBack={() => setSelectedTool(null)} />;
      case ToolId.DOCUMENT_TRANSLATOR:
        return <DocumentTranslator onBack={() => setSelectedTool(null)} />;
      case ToolId.PDF_OCR:
        return <PdfOcr onBack={() => setSelectedTool(null)} />;
      case ToolId.PDF_SPLIT_MERGE:
        return <PdfSplitMerge onBack={() => setSelectedTool(null)} />;
      case ToolId.PDF_EDITOR:
        return <PdfEditor onBack={() => setSelectedTool(null)} />;
      default:
        return <ToolGrid onSelectTool={setSelectedTool} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-900 dark:text-slate-200 font-sans flex flex-col">
      <Header />
      <main className="flex-grow">
        {renderContent()}
      </main>
      <footer className="text-center py-6 text-sm text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800">
        <p>&copy; {new Date().getFullYear()} PDF Master. All rights reserved.</p>
        <p className="mt-1">Inspired by the functionality and design of PDF Guru.</p>
      </footer>
    </div>
  );
};

export default App;