import React, { useState, useEffect } from 'react';
import Modal from './Modal';
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
  ImageCompressorIcon,
  SummarizeIcon,
  TextExtractorIcon
} from './icons';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onToolSelect: (toolId: string, file: File) => void;
  uploadedFile: File | null;
}

const FileUploadModal: React.FC<FileUploadModalProps> = ({ 
  isOpen, 
  onClose, 
  onToolSelect,
  uploadedFile
}) => {
  const [fileType, setFileType] = useState<string>('');

  useEffect(() => {
    if (uploadedFile) {
      const type = uploadedFile.type;
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
    }
  }, [uploadedFile]);

  const getRecommendedTools = () => {
    switch (fileType) {
      case 'pdf':
        return [
          { id: 'pdf-editor', name: 'PDF Editor', icon: <PdfEditorToolIcon />, description: 'Edit PDF files with text, shapes, highlights' },
          { id: 'pdf-ocr', name: 'PDF OCR', icon: <TextExtractorIcon />, description: 'Extract all text content from any PDF file' },
          { id: 'summarizer', name: 'AI Summarizer', icon: <SummarizeIcon />, description: 'Quickly summarize long PDF documents' },
          { id: 'document-translator', name: 'Document Translator', icon: <DocumentTranslatorIcon />, description: 'Extract text and translate it instantly' }
        ];
      case 'image':
        return [
          { id: 'background-remover', name: 'Background Remover', icon: <BackgroundRemoverIcon />, description: 'Instantly remove the background from any image' },
          { id: 'image-editor', name: 'Image Editor', icon: <ImageIcon />, description: 'Edit images with tools like crop, text, shapes' },
          { id: 'image-converter', name: 'Image Converter', icon: <ImageConverterIcon />, description: 'Convert images between popular formats' },
          { id: 'image-compressor', name: 'Image Compressor', icon: <ImageCompressorIcon />, description: 'Reduce image file size with quality slider' }
        ];
      case 'text':
      case 'document':
        return [
          { id: 'summarizer', name: 'AI Summarizer', icon: <SummarizeIcon />, description: 'Quickly summarize long documents' },
          { id: 'document-translator', name: 'Document Translator', icon: <DocumentTranslatorIcon />, description: 'Translate document content instantly' },
          { id: 'text-extractor', name: 'AI Text Extractor', icon: <TextExtractorIcon />, description: 'Extract and structure text content' }
        ];
      default:
        return [
          { id: 'pdf-editor', name: 'PDF Editor', icon: <PdfEditorToolIcon />, description: 'Edit PDF files with text, shapes, highlights' },
          { id: 'summarizer', name: 'AI Summarizer', icon: <SummarizeIcon />, description: 'Quickly summarize documents' },
          { id: 'document-translator', name: 'Document Translator', icon: <DocumentTranslatorIcon />, description: 'Translate document content instantly' }
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="py-4">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Choose a Tool</h3>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Select the tool you want to use with your file
          </p>
        </div>

        {uploadedFile && (
          <div className="mb-8 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
            <div className="flex items-center">
              <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center">
                {getFileIcon()}
              </div>
              <div className="ml-4 flex-1 min-w-0">
                <div className="text-sm font-medium text-slate-900 dark:text-white truncate">
                  {uploadedFile.name}
                </div>
                <div className="mt-1 flex items-center text-sm text-slate-500 dark:text-slate-400">
                  <span>{formatFileSize(uploadedFile.size)}</span>
                  <span className="mx-2">•</span>
                  <span className="capitalize">{fileType}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-slate-900 dark:text-white">
            Recommended Tools
          </h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {getRecommendedTools().map((tool) => (
              <div
                key={tool.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-300 cursor-pointer group hover:shadow-md"
                onClick={() => handleToolSelect(tool.id)}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                    {tool.icon}
                  </div>
                  <div className="ml-4 flex-1">
                    <h5 className="font-medium text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors">
                      {tool.name}
                    </h5>
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

        <div className="mt-8 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default FileUploadModal;