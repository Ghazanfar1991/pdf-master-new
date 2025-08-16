import React, { useState, useRef } from 'react';
import { PDFDocument, rgb } from 'pdf-lib';
import { WatermarkAdderIcon } from './icons';
import FileUploader from './FileUploader';
import Button from './Button';
import Card from './Card';
import LoadingSpinner from './LoadingSpinner';

interface WatermarkAdderProps {
  onBack: () => void;
  initialFile?: File;
}

const WatermarkAdder: React.FC<WatermarkAdderProps> = ({ onBack, initialFile }) => {
  const [file, setFile] = useState<File | null>(initialFile || null);
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
  const [watermarkSize, setWatermarkSize] = useState(50);
  const [watermarkOpacity, setWatermarkOpacity] = useState(0.5);
  const [watermarkColor, setWatermarkColor] = useState('#FF0000');
  const [position, setPosition] = useState<'center' | 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight'>('center');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (selectedFile: File) => {
    if (selectedFile.type !== 'application/pdf') {
      setError('Please upload a PDF file');
      return;
    }
    setFile(selectedFile);
    setError('');
    setSuccess(false);
  };

  const addWatermark = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError('');
    setSuccess(false);

    try {
      // Read the PDF file
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();

      // Add watermark to each page
      pages.forEach(page => {
        const { width, height } = page.getSize();
        
        // Calculate position based on selection
        let x = 0;
        let y = 0;
        
        switch (position) {
          case 'center':
            x = width / 2;
            y = height / 2;
            break;
          case 'topLeft':
            x = 50;
            y = height - 50;
            break;
          case 'topRight':
            x = width - 50;
            y = height - 50;
            break;
          case 'bottomLeft':
            x = 50;
            y = 50;
            break;
          case 'bottomRight':
            x = width - 50;
            y = 50;
            break;
        }

        // Add watermark text
        page.drawText(watermarkText, {
          x: x,
          y: y,
          size: watermarkSize,
          opacity: watermarkOpacity,
          color: rgb(
            parseInt(watermarkColor.slice(1, 3), 16) / 255,
            parseInt(watermarkColor.slice(3, 5), 16) / 255,
            parseInt(watermarkColor.slice(5, 7), 16) / 255
          ),
          rotate: { type: 'degrees', angle: 45 }
        });
      });

      // Save the modified PDF
      const modifiedPdfBytes = await pdfDoc.save();
      const blob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      // Create download link
      const a = document.createElement('a');
      a.href = url;
      a.download = `watermarked_${file.name}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setSuccess(true);
    } catch (err) {
      console.error('Error adding watermark:', err);
      setError('Failed to add watermark to the PDF. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadSample = () => {
    // Create a sample PDF with watermark instructions
    const sampleContent = `
      PDF Watermark Adder Instructions:
      
      1. Upload a PDF file using the file uploader
      2. Customize your watermark text, size, color, and position
      3. Click "Add Watermark" to process your PDF
      4. The watermarked PDF will be automatically downloaded
      
      Sample watermark positions:
      - Top Left: For discrete markings
      - Top Right: For version control
      - Center: For prominent markings
      - Bottom Left/Right: For page-specific markings
      
      Tip: Use watermarks to protect sensitive documents or indicate document status.
    `.trim();

    const blob = new Blob([sampleContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'watermark_instructions.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
        >
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Tools
        </button>
      </div>

      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-primary shadow-lg mb-4">
          <WatermarkAdderIcon />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">PDF Watermark Adder</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Add custom watermarks to your PDF documents to protect sensitive information or indicate document status.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - File Upload and Controls */}
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Upload PDF</h2>
            <FileUploader
              onFileSelect={handleFileChange}
              accept="application/pdf"
              file={file}
              onClear={() => {
                setFile(null);
                setError('');
                setSuccess(false);
              }}
            />
            {error && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg">
                {error}
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Watermark Settings</h2>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Watermark Text
                </label>
                <input
                  type="text"
                  value={watermarkText}
                  onChange={(e) => setWatermarkText(e.target.value)}
                  className="w-full input"
                  placeholder="Enter watermark text"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Font Size: {watermarkSize}px
                </label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={watermarkSize}
                  onChange={(e) => setWatermarkSize(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Opacity: {Math.round(watermarkOpacity * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={watermarkOpacity}
                  onChange={(e) => setWatermarkOpacity(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Color
                </label>
                <input
                  type="color"
                  value={watermarkColor}
                  onChange={(e) => setWatermarkColor(e.target.value)}
                  className="w-full h-10 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Position
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['center', 'topLeft', 'topRight', 'bottomLeft', 'bottomRight'] as const).map((pos) => (
                    <button
                      key={pos}
                      onClick={() => setPosition(pos)}
                      className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                        position === pos
                          ? 'bg-primary-500 text-white'
                          : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {pos === 'center' && 'Center'}
                      {pos === 'topLeft' && 'Top Left'}
                      {pos === 'topRight' && 'Top Right'}
                      {pos === 'bottomLeft' && 'Bottom Left'}
                      {pos === 'bottomRight' && 'Bottom Right'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column - Preview and Actions */}
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Preview</h2>
            <div className="flex flex-col items-center justify-center h-64 bg-slate-50 dark:bg-slate-800 rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-700">
              {file ? (
                <div className="text-center">
                  <div className="flex items-center justify-center h-16 w-16 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-500 mx-auto mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="font-medium text-slate-900 dark:text-white">{file.name}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <div className="flex items-center justify-center h-16 w-16 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-500 mx-auto mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400">No file selected</p>
                  <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                    Upload a PDF to add watermarks
                  </p>
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Actions</h2>
            <div className="space-y-4">
              <Button
                onClick={addWatermark}
                disabled={!file || isProcessing}
                className="w-full py-3 flex items-center justify-center"
              >
                {isProcessing ? (
                  <>
                    <LoadingSpinner className="mr-2 h-5 w-5" />
                    Adding Watermark...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Add Watermark
                  </>
                )}
              </Button>

              {success && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg">
                  Watermark added successfully! The file is downloading now.
                </div>
              )}

              <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                <button
                  onClick={handleDownloadSample}
                  className="w-full py-2.5 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 text-sm font-medium flex items-center justify-center transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                  </svg>
                  Download Instructions
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WatermarkAdder;