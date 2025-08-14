import React, { useState, useRef } from 'react';

interface PdfEditorProps { 
    onBack: () => void; 
}

const PdfEditor: React.FC<PdfEditorProps> = ({ onBack }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [error, setError] = useState('');
    
    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || file.type !== 'application/pdf') {
            setError('Please select a valid PDF file.');
            return;
        }
        
        setPdfFile(file);
        setError('');
    };
    
    const downloadPdf = () => {
        if (!pdfFile) return;
        
        const url = URL.createObjectURL(pdfFile);
        const a = document.createElement('a');
        a.href = url;
        a.download = pdfFile.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };
    
    // Function to open PDF in a new tab
    const viewPdf = () => {
        if (!pdfFile) return;
        
        const url = URL.createObjectURL(pdfFile);
        window.open(url, '_blank');
    };
    
    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="mb-6">
                <button 
                    onClick={onBack}
                    className="flex items-center text-indigo-600 hover:text-indigo-800 font-medium"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    Back
                </button>
                <h1 className="text-2xl font-bold text-gray-800 mt-4">PDF Viewer</h1>
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
                {!pdfFile ? (
                    <div className="text-center py-12">
                        <div className="mx-auto bg-indigo-100 rounded-full p-3 w-16 h-16 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800 mt-4">View Your PDF</h3>
                        <p className="text-gray-600 mt-2 mb-6">Upload a PDF file to view and download</p>
                        <label className="cursor-pointer">
                            <div className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors inline-flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                                Choose PDF File
                            </div>
                            <input 
                                type="file" 
                                ref={fileInputRef}
                                onChange={handleFileChange} 
                                accept=".pdf,application/pdf" 
                                className="hidden" 
                            />
                        </label>
                        {error && <p className="text-red-500 mt-4">{error}</p>}
                        <p className="text-gray-500 text-sm mt-4">Supports PDF files up to 100MB</p>
                    </div>
                ) : (
                    <div className="p-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500 mr-3" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                </svg>
                                <div>
                                    <h3 className="font-medium text-gray-800">{pdfFile.name}</h3>
                                    <p className="text-sm text-gray-600">{(pdfFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                            </div>
                            <div className="flex space-x-2">
                                <button 
                                    onClick={viewPdf}
                                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                    </svg>
                                    View
                                </button>
                                <button 
                                    onClick={downloadPdf}
                                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                    Download
                                </button>
                            </div>
                        </div>
                        
                        <div className="text-center py-8">
                            <div className="inline-flex items-center justify-center bg-indigo-100 rounded-full p-4 mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">PDF Ready to View</h3>
                            <p className="text-gray-600 mb-6">Your PDF file has been uploaded successfully. Click "View" to open it in a new tab or "Download" to save it to your device.</p>
                            
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl mx-auto">
                                <h4 className="font-medium text-blue-800 mb-2">Note about PDF viewing capabilities</h4>
                                <p className="text-blue-700 text-sm">
                                    For full PDF editing capabilities with annotation tools, text highlighting, and drawing features, 
                                    we would need to implement a more advanced PDF.js integration with canvas rendering. 
                                    This simplified version demonstrates the core file handling functionality.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PdfEditor;