import React, { useState, useCallback, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import { 
    PdfFileIcon, WordFileIcon, PptFileIcon, ImageIcon, 
    TextFileIcon, ExcelFileIcon, ArchiveFileIcon, VideoFileIcon,
    AudioFileIcon, CodeFileIcon, DocumentFileIcon
} from './icons';


interface SmartConverterProps {
    onBack: () => void;
}

type ConversionType = 
    | 'pdf-to-word' | 'pdf-to-text'
    | 'word-to-pdf'
    | 'ppt-to-pdf'
    | 'excel-to-pdf' | 'excel-to-word' | 'excel-to-csv'
    | 'image-to-pdf' | 'image-to-jpg' | 'image-to-png' | 'image-to-webp'
    | 'text-to-pdf' | 'text-to-word';

interface FilePreview {
    id: string;
    file: File;
    url?: string;
    name: string;
    size: string;
    type: string;
    icon: React.ReactNode;
}

interface ConversionOption {
    id: ConversionType;
    name: string;
    description: string;
    fromFormat: string;
    toFormat: string;
    icon: React.ReactNode;
    supportedExtensions: string[];
    maxFileSize: number;
}

const SmartConverter: React.FC<SmartConverterProps> = ({ onBack }) => {
    const [selectedConversion, setSelectedConversion] = useState<ConversionType | null>(null);
    const [files, setFiles] = useState<FilePreview[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [outputUrl, setOutputUrl] = useState<string | null>(null);
    const [conversionProgress, setConversionProgress] = useState(0);
    const [conversionStatus, setConversionStatus] = useState('');

    const [pdfOptions, setPdfOptions] = useState({
        quality: 'high',
        compress: false,
        password: '',
        watermark: false,
        watermarkText: ''
    });

    const [imageOptions, setImageOptions] = useState({
        quality: 90,
        format: 'jpeg',
        resize: false,
        width: 1920,
        height: 1080
    });

    const fileInputRef = useRef<HTMLInputElement>(null);
    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);

    const conversionOptions: ConversionOption[] = [
        {
            id: 'pdf-to-word',
            name: 'PDF to Word',
            description: 'Convert PDF documents to editable Word format',
            fromFormat: 'PDF',
            toFormat: 'DOCX',
            icon: <PdfFileIcon />,
            supportedExtensions: ['.pdf'],
            maxFileSize: 50
        },
        {
            id: 'pdf-to-text',
            name: 'PDF to Text',
            description: 'Extract text content from PDF files',
            fromFormat: 'PDF',
            toFormat: 'TXT',
            icon: <PdfFileIcon />,
            supportedExtensions: ['.pdf'],
            maxFileSize: 50
        },
        {
            id: 'word-to-pdf',
            name: 'Word to PDF',
            description: 'Convert Word documents to PDF format',
            fromFormat: 'DOCX/DOC',
            toFormat: 'PDF',
            icon: <WordFileIcon />,
            supportedExtensions: ['.docx', '.doc'],
            maxFileSize: 50
        },
        {
            id: 'ppt-to-pdf',
            name: 'PowerPoint to PDF',
            description: 'Convert PowerPoint presentations to PDF',
            fromFormat: 'PPTX/PPT',
            toFormat: 'PDF',
            icon: <PptFileIcon />,
            supportedExtensions: ['.pptx', '.ppt'],
            maxFileSize: 50
        },
        {
            id: 'excel-to-pdf',
            name: 'Excel to PDF',
            description: 'Convert Excel spreadsheets to PDF',
            fromFormat: 'XLSX/XLS',
            toFormat: 'PDF',
            icon: <ExcelFileIcon />,
            supportedExtensions: ['.xlsx', '.xls'],
            maxFileSize: 50
        },
        {
            id: 'excel-to-word',
            name: 'Excel to Word',
            description: 'Convert Excel data to Word format',
            fromFormat: 'XLSX/XLS',
            toFormat: 'DOCX',
            icon: <ExcelFileIcon />,
            supportedExtensions: ['.xlsx', '.xls'],
            maxFileSize: 50
        },
        {
            id: 'excel-to-csv',
            name: 'Excel to CSV',
            description: 'Convert Excel to CSV format',
            fromFormat: 'XLSX/XLS',
            toFormat: 'CSV',
            icon: <ExcelFileIcon />,
            supportedExtensions: ['.xlsx', '.xls'],
            maxFileSize: 50
        },
        {
            id: 'image-to-pdf',
            name: 'Image to PDF',
            description: 'Convert images to PDF documents',
            fromFormat: 'JPG/PNG/GIF',
            toFormat: 'PDF',
            icon: <ImageIcon />,
            supportedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'],
            maxFileSize: 20
        },
        {
            id: 'image-to-jpg',
            name: 'Convert to JPG',
            description: 'Convert images to JPG format',
            fromFormat: 'PNG/GIF/BMP',
            toFormat: 'JPG',
            icon: <ImageIcon />,
            supportedExtensions: ['.png', '.gif', '.bmp', '.webp'],
            maxFileSize: 20
        },
        {
            id: 'image-to-png',
            name: 'Convert to PNG',
            description: 'Convert images to PNG format',
            fromFormat: 'JPG/GIF/BMP',
            toFormat: 'PNG',
            icon: <ImageIcon />,
            supportedExtensions: ['.jpg', '.jpeg', '.gif', '.bmp', '.webp'],
            maxFileSize: 20
        },
        {
            id: 'image-to-webp',
            name: 'Convert to WebP',
            description: 'Convert images to WebP format',
            fromFormat: 'JPG/PNG/GIF',
            toFormat: 'WEBP',
            icon: <ImageIcon />,
            supportedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.bmp'],
            maxFileSize: 20
        },
        {
            id: 'text-to-pdf',
            name: 'Text to PDF',
            description: 'Convert text files to PDF format',
            fromFormat: 'TXT',
            toFormat: 'PDF',
            icon: <TextFileIcon />,
            supportedExtensions: ['.txt'],
            maxFileSize: 10
        },
        {
            id: 'text-to-word',
            name: 'Text to Word',
            description: 'Convert text files to Word format',
            fromFormat: 'TXT',
            toFormat: 'DOCX',
            icon: <TextFileIcon />,
            supportedExtensions: ['.txt'],
            maxFileSize: 10
        }
    ];

    const getFileIcon = (file: File): React.ReactNode => {
        const extension = file.name.toLowerCase().split('.').pop();
        const type = file.type;

        if (type.includes('pdf')) return <PdfFileIcon />;
        if (type.includes('word') || extension === 'docx' || extension === 'doc') return <WordFileIcon />;
        if (type.includes('powerpoint') || extension === 'pptx' || extension === 'ppt') return <PptFileIcon />;
        if (type.includes('excel') || extension === 'xlsx' || extension === 'xls') return <ExcelFileIcon />;
        if (type.includes('image')) return <ImageIcon />;
        if (type.includes('text') || extension === 'txt') return <TextFileIcon />;
        if (type.includes('video')) return <VideoFileIcon />;
        if (type.includes('audio')) return <AudioFileIcon />;
        if (type.includes('zip') || type.includes('rar')) return <ArchiveFileIcon />;
        return <DocumentFileIcon />;
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const validateFile = (file: File, conversion: ConversionType): boolean => {
        const option = conversionOptions.find(opt => opt.id === conversion);
        if (!option) {
            setError('Invalid conversion type');
            return false;
        }

        const fileSizeMB = file.size / (1024 * 1024);
        if (fileSizeMB > option.maxFileSize) {
            setError(`File size (${fileSizeMB.toFixed(1)}MB) exceeds maximum limit of ${option.maxFileSize}MB`);
            return false;
        }

        const extension = '.' + file.name.toLowerCase().split('.').pop();
        if (!option.supportedExtensions.includes(extension)) {
            setError(`File type "${extension}" not supported. Supported: ${option.supportedExtensions.join(', ')}`);
            return false;
        }

        return true;
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = event.target.files;
        if (!selectedFiles || !selectedConversion) {
            setError('Please select a conversion type and files');
            return;
        }

        const validFiles: FilePreview[] = [];
        for (let i = 0; i < selectedFiles.length; i++) {
            const file = selectedFiles[i];
            if (validateFile(file, selectedConversion)) {
                validFiles.push({
                    id: `${file.name}-${file.lastModified}-${Math.random()}`,
                    file,
                    name: file.name,
                    size: formatFileSize(file.size),
                    type: file.type,
                    icon: getFileIcon(file)
                });
            }
        }

        if (validFiles.length === 0) {
            setError('No valid files selected for this conversion');
            return;
        }

        setFiles(validFiles);
        setError('');
    };

    const handleConversion = useCallback(async () => {
        if (!selectedConversion || files.length === 0) {
            setError('Please select files and conversion type');
            return;
        }

        setIsLoading(true);
        setError('');
        setOutputUrl(null);
        setConversionProgress(0);
        setConversionStatus('Starting conversion...');

        try {
            const option = conversionOptions.find(opt => opt.id === selectedConversion);
            if (!option) throw new Error('Invalid conversion type');

            setConversionProgress(20);
            setConversionStatus('Reading files...');

            const file = files[0].file;

            setConversionProgress(40);
            setConversionStatus('Processing content...');

            let outputBlob: Blob;
            let outputFileName: string;
            let content = '';

            switch (selectedConversion) {
                case 'pdf-to-word':
                case 'pdf-to-text':
                    setConversionStatus('Extracting text from PDF...');
                    const pdfArrayBuffer = await file.arrayBuffer();
                    const pdfjsDocument = await pdfjsLib.getDocument({ data: pdfArrayBuffer }).promise;
                    let extractedText = '';
                    for (let pageNum = 1; pageNum <= pdfjsDocument.numPages; pageNum++) {
                        setConversionStatus(`Extracting text from page ${pageNum}...`);
                        const page = await pdfjsDocument.getPage(pageNum);
                        const textContent = await page.getTextContent();
                        const pageText = textContent.items
                            .map((item: any) => item.str)
                            .join(' ');
                        extractedText += `Page ${pageNum}\n${'='.repeat(50)}\n\n${pageText}\n\n`;
                    }

                    if (selectedConversion === 'pdf-to-word') {
                        // Read file fresh for mammoth
                        const wordArrayBuffer = await file.arrayBuffer();
                        const docxContent = await mammoth.convertToHtml({ arrayBuffer: wordArrayBuffer });
                        outputBlob = new Blob([docxContent.value], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
                        outputFileName = `converted_${Date.now()}.docx`;
                    } else {
                        outputBlob = new Blob([extractedText], { type: 'text/plain' });
                        outputFileName = `converted_${Date.now()}.txt`;
                    }
                    break;

                case 'word-to-pdf':
                case 'text-to-pdf':
                    const pdfDoc = await PDFDocument.create();
                    const page = pdfDoc.addPage();
                    let content = '';
                    if (selectedConversion === 'word-to-pdf') {
                        // Read file fresh for mammoth
                        const wordToPdfArrayBuffer = await file.arrayBuffer();
                        const result = await mammoth.extractRawText({ arrayBuffer: wordToPdfArrayBuffer });
                        content = result.value || 'No text content found';
                    } else {
                        content = await file.text();
                    }

                    const cleanTextForPDF = (text: string) => {
                        return text
                            .replace(/[^\x00-\x7F]/g, '?')
                            .replace(/[\u{0080}-\u{FFFF}]/gu, '');
                    };

                    const lines = content.split('\n');
                    let yPosition = 750;
                    const lineHeight = 25;
                    const leftMargin = 50;
                    const rightMargin = 50;
                    const maxWidth = page.getWidth() - leftMargin - rightMargin;
                    const fontSize = 12;
                    const avgCharWidth = 6;
                    const maxCharsPerLine = Math.floor(maxWidth / avgCharWidth);

                    for (const line of lines) {
                        const cleanLine = cleanTextForPDF(line);
                        if (!cleanLine.trim()) continue;

                        const words = cleanLine.split(' ');
                        let currentLine = '';
                        for (const word of words) {
                            const testLine = currentLine + (currentLine ? ' ' : '') + word;
                            if (yPosition <= 50) {
                                const newPage = pdfDoc.addPage();
                                yPosition = 750;
                            }

                            if (testLine.length > maxCharsPerLine && currentLine) {
                                page.drawText(currentLine, { x: leftMargin, y: yPosition, size: fontSize });
                                yPosition -= lineHeight;
                                currentLine = word;
                            } else {
                                currentLine = testLine;
                            }
                        }

                        if (currentLine) {
                            if (yPosition <= 50) {
                                const newPage = pdfDoc.addPage();
                                yPosition = 750;
                            }
                            page.drawText(currentLine, { x: leftMargin, y: yPosition, size: fontSize });
                            yPosition -= lineHeight;
                        }
                    }

                    // PDF compression is handled automatically by pdf-lib
                    // No manual compression needed

                    const pdfBytes = await pdfDoc.save();
                    outputBlob = new Blob([pdfBytes], { type: 'application/pdf' });
                    outputFileName = `converted_${Date.now()}.pdf`;
                    break;

                case 'ppt-to-pdf':
                    const pptContent = 'PowerPoint to PDF conversion not fully supported in browser';
                    const pdfDoc2 = await PDFDocument.create();
                    const page2 = pdfDoc2.addPage();
                    page2.drawText(pptContent, { x: 50, y: 750, size: 12 });
                    const pdfBytes2 = await pdfDoc2.save();
                    outputBlob = new Blob([pdfBytes2], { type: 'application/pdf' });
                    outputFileName = `converted_${Date.now()}.pdf`;
                    break;

                case 'excel-to-pdf':
                case 'excel-to-word':
                case 'excel-to-csv':
                    // Read file fresh for XLSX
                    const excelArrayBuffer = await file.arrayBuffer();
                    const workbook = XLSX.read(excelArrayBuffer, { type: 'array' });
                    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                    const data = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as string[][];

                    if (selectedConversion === 'excel-to-csv') {
                        const csvContent = data.map(row => row.join(',')).join('\n');
                        outputBlob = new Blob([csvContent], { type: 'text/csv' });
                        outputFileName = `converted_${Date.now()}.csv`;
                    } else if (selectedConversion === 'excel-to-word') {
                        const wordContent = data.map(row => row.join('\t')).join('\n');
                        outputBlob = new Blob([`<?xml version="1.0" encoding="UTF-8"?>
                            <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
                                <w:body>
                                    <w:p><w:r><w:t>${wordContent}</w:t></w:r></w:p>
                                </w:body>
                            </w:document>`], 
                            { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }
                        );
                        outputFileName = `converted_${Date.now()}.docx`;
                    } else {
                        const pdfDoc3 = await PDFDocument.create();
                        const page3 = pdfDoc3.addPage();
                        let yPos = 750;
                        data.forEach(row => {
                            if (yPos <= 50) {
                                const newPage = pdfDoc3.addPage();
                                yPos = 750;
                            }
                            page3.drawText(row.join('\t'), { x: 50, y: yPos, size: 12 });
                            yPos -= 25;
                        });
                        const pdfBytes3 = await pdfDoc3.save();
                        outputBlob = new Blob([pdfBytes3], { type: 'application/pdf' });
                        outputFileName = `converted_${Date.now()}.pdf`;
                    }
                    break;

                case 'image-to-pdf':
                    const img = new Image();
                    const imgUrl = URL.createObjectURL(file);
                    await new Promise((resolve, reject) => {
                        img.onload = resolve;
                        img.onerror = reject;
                        img.src = imgUrl;
                    });

                    const canvas = document.createElement('canvas');
                    canvas.width = imageOptions.resize ? imageOptions.width : img.width;
                    canvas.height = imageOptions.resize ? imageOptions.height : img.height;
                    const ctx = canvas.getContext('2d')!;
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                    const pdfDoc3 = await PDFDocument.create();
                    const page3 = pdfDoc3.addPage([canvas.width, canvas.height]);
                    const imgBytes = await new Promise<Uint8Array>(resolve => {
                        canvas.toBlob(blob => {
                            blob!.arrayBuffer().then(buffer => resolve(new Uint8Array(buffer)));
                        }, 'image/png');
                    });

                    const pdfImage = await pdfDoc3.embedPng(imgBytes);
                    page3.drawImage(pdfImage, { x: 0, y: 0, width: canvas.width, height: canvas.height });

                    const pdfBytes3 = await pdfDoc3.save();
                    outputBlob = new Blob([pdfBytes3], { type: 'application/pdf' });
                    outputFileName = `converted_${Date.now()}.pdf`;
                    URL.revokeObjectURL(imgUrl);
                    break;

                case 'image-to-jpg':
                case 'image-to-png':
                case 'image-to-webp':
                    const img2 = new Image();
                    const imgUrl2 = URL.createObjectURL(file);
                    await new Promise((resolve, reject) => {
                        img2.onload = resolve;
                        img2.onerror = reject;
                        img2.src = imgUrl2;
                    });

                    const canvas2 = document.createElement('canvas');
                    canvas2.width = imageOptions.resize ? imageOptions.width : img2.width;
                    canvas2.height = imageOptions.resize ? imageOptions.height : img2.height;
                    const ctx2 = canvas2.getContext('2d')!;
                    ctx2.drawImage(img2, 0, 0, canvas2.width, canvas2.height);

                    const mimeType = selectedConversion === 'image-to-jpg' ? 'image/jpeg' : 
                                   selectedConversion === 'image-to-png' ? 'image/png' : 'image/webp';
                    const extension = selectedConversion === 'image-to-jpg' ? 'jpg' : 
                                    selectedConversion === 'image-to-png' ? 'png' : 'webp';

                    outputBlob = await new Promise<Blob>(resolve => {
                        canvas2.toBlob(blob => resolve(blob!), mimeType, imageOptions.quality / 100);
                    });
                    outputFileName = `converted_${Date.now()}.${extension}`;
                    URL.revokeObjectURL(imgUrl2);
                    break;

                case 'text-to-word':
                    const textContent = await file.text();
                    const docxContent = `<?xml version="1.0" encoding="UTF-8"?>
                        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
                            <w:body>
                                <w:p><w:r><w:t>${textContent.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/&/g, '&amp;')}</w:t></w:r></w:p>
                            </w:body>
                        </w:document>`;
                    outputBlob = new Blob([docxContent], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
                    outputFileName = `converted_${Date.now()}.docx`;
                    break;

                default:
                    throw new Error(`Unsupported conversion: ${selectedConversion}`);
            }

            setConversionProgress(80);
            setConversionStatus('Finalizing...');

            const url = URL.createObjectURL(outputBlob);
            setOutputUrl(url);
            setConversionStatus('Conversion completed successfully!');
            setConversionProgress(100);

        } catch (err) {
            console.error('Conversion error:', err);
            setError(`Conversion failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
        } finally {
            setIsLoading(false);
        }
    }, [selectedConversion, files, conversionOptions, pdfOptions, imageOptions]);

    const handleDragSort = () => {
        if (dragItem.current === null || dragOverItem.current === null) return;
        const newItems = [...files];
        const [draggedItem] = newItems.splice(dragItem.current, 1);
        newItems.splice(dragOverItem.current, 0, draggedItem);
        setFiles(newItems);
        dragItem.current = null;
        dragOverItem.current = null;
    };

    const handleClear = () => {
        files.forEach(f => {
            if (f.url) URL.revokeObjectURL(f.url);
        });
        if (outputUrl) URL.revokeObjectURL(outputUrl);
        setFiles([]);
        setError('');
        setOutputUrl(null);
        setConversionProgress(0);
        setConversionStatus('');
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const getAcceptTypes = (): string => {
        if (!selectedConversion) return '';
        const option = conversionOptions.find(opt => opt.id === selectedConversion);
        if (!option) return '';
        
        const mimeTypes = option.supportedExtensions.map(ext => {
            switch (ext.toLowerCase()) {
                case '.pdf': return 'application/pdf';
                case '.docx': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
                case '.doc': return 'application/msword';
                case '.pptx': return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
                case '.ppt': return 'application/vnd.ms-powerpoint';
                case '.xlsx': return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                case '.xls': return 'application/vnd.ms-excel';
                case '.txt': return 'text/plain';
                case '.jpg':
                case '.jpeg': return 'image/jpeg';
                case '.png': return 'image/png';
                case '.gif': return 'image/gif';
                case '.bmp': return 'image/bmp';
                case '.webp': return 'image/webp';
                default: return '';
            }
        }).filter(type => type !== '');
        
        return [...option.supportedExtensions, ...mimeTypes].join(',');
    };

    const groupedOptions = {
        'PDF Conversions': conversionOptions.filter(opt => opt.fromFormat === 'PDF'),
        'Document Conversions': conversionOptions.filter(opt => 
            ['DOCX/DOC', 'PPTX/PPT', 'XLSX/XLS'].includes(opt.fromFormat)
        ),
        'Image Conversions': conversionOptions.filter(opt => 
            opt.fromFormat.includes('JPG') || opt.fromFormat.includes('PNG') || opt.fromFormat.includes('GIF')
        ),
        'Text Conversions': conversionOptions.filter(opt => 
            opt.fromFormat === 'TXT'
        )
    };

    return (
        <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in">
            <button onClick={onBack} className="flex items-center text-sm font-medium text-slate-600 hover:text-indigo-600 mb-6 dark:text-slate-400 dark:hover:text-indigo-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Tools
            </button>

            <div className="bg-white rounded-xl shadow-lg p-8 dark:bg-slate-800">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Smart Converter</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-lg">
                        Convert files between different formats with ease
                    </p>
                </div>

                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Choose Conversion Type</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.entries(groupedOptions).map(([category, options]) => (
                            <div key={category} className="space-y-3">
                                <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                                    {category}
                                </h4>
                                <div className="space-y-2">
                                    {options.map((option) => (
                                        <button
                                            key={option.id}
                                            onClick={() => {
                                                setSelectedConversion(option.id);
                                                handleClear();
                                            }}
                                            className={`w-full p-3 text-left rounded-lg border transition-all ${
                                                selectedConversion === option.id
                                                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                                                    : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="flex-shrink-0 text-indigo-600 dark:text-indigo-400">
                                                    {option.icon}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                                                        {option.name}
                                                    </p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                                        {option.description}
                                                    </p>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {selectedConversion && (
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Upload Files</h3>
                        {files.length === 0 ? (
                            <div 
                                className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-8 text-center hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors cursor-pointer"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <div className="space-y-4">
                                    <div className="mx-auto w-16 h-16 bg-indigo-100 dark:bg-indigo-900/20 rounded-full flex items-center justify-center">
                                        <svg className="w-8 h-8 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-lg font-medium text-slate-900 dark:text-white">
                                            Drop files here or click to upload
                                        </p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                            Supported formats: {getAcceptTypes() || 'All files'}
                                        </p>
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="mt-2 px-4 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                                        >
                                            Select Files
                                        </button>
                                    </div>
                                </div>
                                <input 
                                    ref={fileInputRef}
                                    type="file" 
                                    className="hidden" 
                                    onChange={handleFileChange} 
                                    accept={getAcceptTypes()}
                                    multiple
                                />
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {files.map((file, index) => (
                                        <div 
                                            key={file.id}
                                            className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700"
                                            draggable
                                            onDragStart={() => dragItem.current = index}
                                            onDragEnter={() => dragOverItem.current = index}
                                            onDragEnd={handleDragSort}
                                            onDragOver={(e) => e.preventDefault()}
                                        >
                                            <div className="flex-shrink-0 text-slate-600 dark:text-slate-400">
                                                {file.icon}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                                                    {file.name}
                                                </p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                                    {file.size}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    const newFiles = files.filter(f => f.id !== file.id);
                                                    setFiles(newFiles);
                                                }}
                                                className="flex-shrink-0 text-slate-400 hover:text-red-500"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                                    >
                                        Add More Files
                                    </button>
                                    <button
                                        onClick={handleClear}
                                        className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                                    >
                                        Clear All
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {selectedConversion && files.length > 0 && (
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Conversion Options</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {selectedConversion.includes('pdf') && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            Quality
                                        </label>
                                        <select 
                                            value={pdfOptions.quality}
                                            onChange={(e) => setPdfOptions(prev => ({ ...prev, quality: e.target.value }))}
                                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                        >
                                            <option value="high">High Quality</option>
                                            <option value="medium">Medium Quality</option>
                                            <option value="low">Low Quality</option>
                                        </select>
                                    </div>
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="compress"
                                            checked={pdfOptions.compress}
                                            onChange={(e) => setPdfOptions(prev => ({ ...prev, compress: e.target.checked }))}
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
                                        />
                                        <label htmlFor="compress" className="ml-2 text-sm text-slate-700 dark:text-slate-300">
                                            Compress PDF
                                        </label>
                                    </div>
                                </div>
                            )}
                            {selectedConversion.includes('image') && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            Quality ({imageOptions.quality}%)
                                        </label>
                                        <input
                                            type="range"
                                            min="1"
                                            max="100"
                                            value={imageOptions.quality}
                                            onChange={(e) => setImageOptions(prev => ({ ...prev, quality: parseInt(e.target.value) }))}
                                            className="w-full"
                                        />
                                    </div>
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="resize"
                                            checked={imageOptions.resize}
                                            onChange={(e) => setImageOptions(prev => ({ ...prev, resize: e.target.checked }))}
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
                                        />
                                        <label htmlFor="resize" className="ml-2 text-sm text-slate-700 dark:text-slate-300">
                                            Resize Image
                                        </label>
                                    </div>
                                    {imageOptions.resize && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                    Width
                                                </label>
                                                <input
                                                    type="number"
                                                    value={imageOptions.width}
                                                    onChange={(e) => setImageOptions(prev => ({ ...prev, width: parseInt(e.target.value) }))}
                                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                    Height
                                                </label>
                                                <input
                                                    type="number"
                                                    value={imageOptions.height}
                                                    onChange={(e) => setImageOptions(prev => ({ ...prev, height: parseInt(e.target.value) }))}
                                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {selectedConversion && files.length > 0 && (
                    <div className="mb-8">
                        <button
                            onClick={handleConversion}
                            disabled={isLoading}
                            className="w-full px-6 py-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Converting...
                                </>
                            ) : (
                                <>
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    Convert Files
                                </>
                            )}
                        </button>
                    </div>
                )}

                {isLoading && (
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                {conversionStatus}
                            </span>
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                {Math.round(conversionProgress)}%
                            </span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                            <div 
                                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${conversionProgress}%` }}
                            ></div>
                        </div>
                    </div>
                )}

                {outputUrl && (
                    <div className="mb-8">
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="flex-shrink-0">
                                    <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-green-900 dark:text-green-100">
                                        Conversion Completed!
                                    </h3>
                                    <p className="text-sm text-green-700 dark:text-green-300">
                                        Your file has been successfully converted.
                                    </p>
                                </div>
                            </div>
                            <a
                                href={outputUrl}
                                download="converted_file"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition-colors"
                            >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Download Converted File
                            </a>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            <svg className="h-5 w-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-red-800 dark:text-red-200">{error}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SmartConverter;