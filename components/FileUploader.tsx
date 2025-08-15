import React, { useState, useRef, useCallback } from 'react';
import { UploadIcon } from './icons';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxFileSize?: number; // in MB
  className?: string;
}

const FileUploader: React.FC<FileUploaderProps> = ({ 
  onFileSelect, 
  accept = '*',
  maxFileSize = 10,
  className = ''
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    // Check file size
    if (file.size > maxFileSize * 1024 * 1024) {
      setError(`File size exceeds ${maxFileSize}MB limit`);
      return false;
    }

    // Check file type if specific types are accepted
    if (accept !== '*') {
      const acceptedTypes = accept.split(',').map(type => type.trim());
      const fileType = file.type;
      const fileName = file.name.toLowerCase();
      
      const isAccepted = acceptedTypes.some(type => {
        // Handle MIME types
        if (type.includes('/')) {
          return fileType === type || fileType.startsWith(type.split('/')[0] + '/');
        }
        // Handle file extensions
        return fileName.endsWith(type);
      });
      
      if (!isAccepted) {
        setError(`File type not supported. Accepted types: ${accept}`);
        return false;
      }
    }

    setError('');
    return true;
  };

  const handleFile = useCallback((file: File) => {
    if (validateFile(file)) {
      onFileSelect(file);
    }
  }, [onFileSelect, validateFile]);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Get file type icon
  const getFileTypeIcon = (fileType: string) => {
    if (fileType.includes('pdf')) {
      return (
        <svg className="w-12 h-12 text-red-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
        </svg>
      );
    } else if (fileType.includes('image')) {
      return (
        <svg className="w-12 h-12 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
        </svg>
      );
    } else if (fileType.includes('text') || fileType.includes('plain')) {
      return (
        <svg className="w-12 h-12 text-green-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
        </svg>
      );
    } else {
      return (
        <svg className="w-12 h-12 text-slate-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
        </svg>
      );
    }
  };

  return (
    <div className={className}>
      <div
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
          isDragging 
            ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-900/20 shadow-lg' 
            : 'border-slate-300 dark:border-slate-600 hover:border-primary-400 dark:hover:border-primary-500 hover:shadow-md'
        }`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerFileInput}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept={accept}
          onChange={handleFileInput}
        />
        
        <div className="flex flex-col items-center justify-center">
          <div className="bg-gradient-primary w-16 h-16 rounded-2xl flex items-center justify-center mb-4">
            <UploadIcon className="h-8 w-8 text-white" />
          </div>
          
          <p className="text-lg font-medium text-slate-900 dark:text-white mb-2">
            Drop your file here or click to browse
          </p>
          
          <p className="text-slate-600 dark:text-slate-400">
            Supports all file types up to {maxFileSize}MB
          </p>
          
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-200">
              PDF
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
              Images
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200">
              Documents
            </span>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="mt-4 p-3 rounded-lg bg-error-50 dark:bg-error-900/20 text-error-700 dark:text-error-300 text-sm flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          {error}
        </div>
      )}
    </div>
  );
};

export default FileUploader;