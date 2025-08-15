import React, { useState, useRef } from 'react';
import FileUploader from './FileUploader';
import { 
  PdfFileIcon, 
  WordFileIcon, 
  TextFileIcon, 
  ImageFileIcon, 
  ImageIcon, 
  DocumentTranslatorIcon,
  PdfEditorToolIcon,
  BackgroundRemoverIcon,
  ImageConverterIcon,
  ImageMergerIcon,
  ImageCompressorIcon,
  SummarizeIcon,
  TextExtractorIcon,
  SmartConverterIcon,
  ImageEditorIcon,
  DocumentTranslatorIcon as DocumentTranslatorIconComponent,
  PdfOcrIcon,
  PdfSplitMergeIcon
} from './icons';

interface FileUploadPageProps {
  onToolSelect: (toolId: string, file: File) => void;
  onBack: () => void;
}

const FileUploadPage: React.FC<FileUploadPageProps> = ({ onToolSelect, onBack }) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<string>('');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    setUploadedFile(file);
    setError('');
    
    // Determine file type
    const type = file.type;
    if (type.includes('pdf')) {
      setFileType('pdf');
    } else if (type.includes('image')) {
      setFileType('image');
    } else if (type.includes('text') || type.includes('plain')) {
      setFileType('text');
    } else if (type.includes('word') || type.includes('document')) {
      setFileType('document');
    } else {
      setFileType('unknown');
    }
  };

  const getRecommendedTools = () => {
    switch (fileType) {
      case 'pdf':
        return [
          { id: 'pdf-editor', name: 'PDF Editor', icon: <PdfEditorToolIcon />, description: 'Edit PDF files with text, shapes, highlights' },
          { id: 'pdf-ocr', name: 'PDF OCR', icon: <PdfOcrIcon />, description: 'Extract all text content from any PDF file' },
          { id: 'summarizer', name: 'AI Summarizer', icon: <SummarizeIcon />, description: 'Quickly summarize long PDF documents' },
          { id: 'document-translator', name: 'Document Translator', icon: <DocumentTranslatorIconComponent />, description: 'Extract text and translate it instantly' },
          { id: 'pdf-split-merge', name: 'PDF Split & Merge', icon: <PdfSplitMergeIcon />, description: 'Split a PDF into multiple files or combine several PDFs' }
        ];
      case 'image':
        return [
          { id: 'background-remover', name: 'Background Remover', icon: <BackgroundRemoverIcon />, description: 'Instantly remove the background from any image' },
          { id: 'image-editor', name: 'Image Editor', icon: <ImageEditorIcon />, description: 'Edit images with tools like crop, text, shapes' },
          { id: 'image-converter', name: 'Image Converter', icon: <ImageConverterIcon />, description: 'Convert images between popular formats' },
          { id: 'image-compressor', name: 'Image Compressor', icon: <ImageCompressorIcon />, description: 'Reduce image file size with quality slider' },
          { id: 'image-merger', name: 'Image Merger', icon: <ImageMergerIcon />, description: 'Combine multiple images horizontally, vertically, or in a grid' }
        ];
      case 'text':
      case 'document':
        return [
          { id: 'summarizer', name: 'AI Summarizer', icon: <SummarizeIcon />, description: 'Quickly summarize long documents or articles' },
          { id: 'document-translator', name: 'Document Translator', icon: <DocumentTranslatorIconComponent />, description: 'Extract text and translate it instantly' },
          { id: 'text-extractor', name: 'AI Text Extractor', icon: <TextExtractorIcon />, description: 'Extract and structure text content' }
        ];
      default:
        return [
          { id: 'pdf-editor', name: 'PDF Editor', icon: <PdfEditorToolIcon />, description: 'Edit PDF files with text, shapes, highlights' },
          { id: 'summarizer', name: 'AI Summarizer', icon: <SummarizeIcon />, description: 'Quickly summarize documents' },
          { id: 'document-translator', name: 'Document Translator', icon: <DocumentTranslatorIconComponent />, description: 'Extract text and translate it instantly' },
          { id: 'text-extractor', name: 'AI Text Extractor', icon: <TextExtractorIcon />, description: 'Extract written content from any image' }
        ];
    }
  };

  const handleToolSelect = (toolId: string) => {
    if (uploadedFile) {
      onToolSelect(toolId, uploadedFile);
    }
  };

  const getFileIcon = () => {
    if (!uploadedFile) return null;
    
    switch (fileType) {
      case 'pdf':
        return <PdfFileIcon />;
      case 'image':
        return <ImageFileIcon />;
      case 'text':
        return <TextFileIcon />;
      case 'document':
        return <WordFileIcon />;
      default:
        return (
          <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
        );
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleClear = () => {
    setUploadedFile(null);
    setFileType('');
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.586a1 1 0 01-.707-.293l-5.414-5.414A1 1 0 0011.586 3H7a4 4 0 000 8z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Upload Your Document</h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Upload a file to get started with our AI-powered tools. We'll recommend the best tools for your file type.
          </p>
        </div>

        {!uploadedFile ? (
          <FileUploader 
            onFileSelect={handleFileSelect} 
            accept="*"
            maxFileSize={10}
            className="mt-6"
          />
        ) : (
          <div className="space-y-8">
            {/* File Info */}
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center">
                  {getFileIcon()}
                </div>
                <div className="ml-4 flex-1 min-w-0">
                  <div className="text-lg font-medium text-slate-900 dark:text-white truncate">
                    {uploadedFile.name}
                  </div>
                  <div className="mt-1 flex items-center text-sm text-slate-500 dark:text-slate-400">
                    <span>{formatFileSize(uploadedFile.size)}</span>
                    <span className="mx-2">•</span>
                    <span className="capitalize">{fileType}</span>
                  </div>
                </div>
                <button
                  onClick={handleClear}
                  className="ml-4 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  Change File
                </button>
              </div>
            </div>

            {/* Recommended Tools */}
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                Recommended Tools for Your {fileType.toUpperCase()}
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {getRecommendedTools().map((tool) => (
                  <div
                    key={tool.id}
                    className="card p-5 hover:shadow-xl transition-all duration-300 cursor-pointer group"
                    onClick={() => handleToolSelect(tool.id)}
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center">
                        {tool.icon}
                      </div>
                      <div className="ml-4 flex-1">
                        <h4 className="font-semibold text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors">
                          {tool.name}
                        </h4>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                          {tool.description}
                        </p>
                      </div>
                      <svg className="w-5 h-5 text-slate-400 group-hover:text-primary-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* All Tools Button */}
            <div className="text-center pt-4">
              <button
                onClick={() => window.location.hash = ''}
                className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 rounded-lg transition-colors group"
              >
                View All Tools
                <svg className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 rounded-lg bg-error-50 dark:bg-error-900/20 text-error-700 dark:text-error-300 text-sm">
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
  );
};

export default FileUploadPage;