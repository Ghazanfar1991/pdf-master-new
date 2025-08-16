import React, { useState, useCallback, useRef } from 'react';
import { extractTextFromFile, translateText } from '../services/huggingFaceService';
import { PdfFileIcon } from './icons';

interface DocumentTranslatorProps {
  onBack: () => void;
}

const LANGUAGES = [
    "Chinese (Simplified)", "English", "French", "German", "Hindi", "Italian", "Japanese", "Korean", "Portuguese", "Russian", "Spanish", "Urdu"
];

type Mode = 'document' | 'text';

const DocumentTranslator: React.FC<DocumentTranslatorProps> = ({ onBack }) => {
  const [mode, setMode] = useState<Mode>('document');
  
  // State for Document mode
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string>('');
  const [extractedText, setExtractedText] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  
  // State for Text mode
  const [inputText, setInputText] = useState('');

  // Shared state
  const [translatedText, setTranslatedText] = useState('');
  const [targetLanguage, setTargetLanguage] = useState("English");
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState('');
  
  const [isInputCopied, setIsInputCopied] = useState(false);
  const [isTranslatedCopied, setIsTranslatedCopied] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleClear = () => {
    if (filePreview) URL.revokeObjectURL(filePreview);
    setFile(null);
    setFilePreview('');
    setExtractedText('');
    setTranslatedText('');
    setInputText('');
    setError('');
    setIsExtracting(false);
    setIsTranslating(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const switchMode = (newMode: Mode) => {
    if (mode !== newMode) {
      handleClear();
      setMode(newMode);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith('image/') && selectedFile.type !== 'application/pdf') {
        setError('Please select a valid image or PDF file.');
        return;
      }
      handleClear();
      setFile(selectedFile);
      if (selectedFile.type.startsWith('image/')) {
        setFilePreview(URL.createObjectURL(selectedFile));
      }
    }
  };

  const handleExtract = useCallback(async () => {
    if (!file) {
      setError('Please select a file first.');
      return;
    }
    setError('');
    setIsExtracting(true);
    setExtractedText('');
    setTranslatedText('');
    try {
      const result = await extractTextFromFile(file);
      setExtractedText(result);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred during extraction.');
    } finally {
      setIsExtracting(false);
    }
  }, [file]);
  
  const handleTranslate = useCallback(async () => {
    const textToTranslate = mode === 'document' ? extractedText : inputText;
    if (!textToTranslate.trim()) {
      setError('There is no text to translate.');
      return;
    }
    setError('');
    setIsTranslating(true);
    setTranslatedText('');
    try {
      const result = await translateText(textToTranslate, targetLanguage);
      setTranslatedText(result);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred during translation.');
    } finally {
      setIsTranslating(false);
    }
  }, [extractedText, inputText, targetLanguage, mode]);

  const handleCopy = (text: string, type: 'input' | 'translated') => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      if (type === 'input') {
        setIsInputCopied(true);
        setTimeout(() => setIsInputCopied(false), 2000);
      } else {
        setIsTranslatedCopied(true);
        setTimeout(() => setIsTranslatedCopied(false), 2000);
      }
    });
  };

  const renderDocumentMode = () => (
    <>
      {!file ? (
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-md dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800/50 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
          <div className="space-y-1 text-center"><svg className="mx-auto h-12 w-12 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></svg>
            <p className="text-sm text-slate-600 dark:text-slate-400">Click to upload an Image or PDF</p>
            <input id="file-upload" type="file" className="sr-only" ref={fileInputRef} onChange={handleFileChange} accept="image/*,application/pdf" />
          </div>
        </div>
      ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              {/* Left side: Preview & Controls */}
              <div className="space-y-4">
                  <h3 className="text-lg font-medium text-slate-900 dark:text-white">File Preview</h3>
                  <div className="aspect-video rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center p-4">
                      {file.type.startsWith('image/') ? (
                          <img src={filePreview} alt="File preview" className="max-w-full max-h-full object-contain rounded-md" />
                      ) : (
                          <div className="text-center">
                              <PdfFileIcon />
                              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 font-medium break-all">{file.name}</p>
                          </div>
                      )}
                  </div>
                   <div className="flex flex-col gap-3">
                      <button onClick={handleExtract} disabled={isExtracting || isTranslating} className="w-full px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed flex items-center justify-center">
                          {isExtracting && <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" fill="currentColor"></path></svg>}
                          {isExtracting ? 'Extracting...' : '1. Extract Text'}
                      </button>
                      <button onClick={handleClear} className="w-full px-6 py-2 bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600">
                          Clear & Start Over
                      </button>
                  </div>
              </div>

              {/* Right side: Text Areas */}
              <div className="space-y-6">
                  <div>
                      <div className="flex justify-between items-center mb-2">
                         <h3 className="text-lg font-medium text-slate-900 dark:text-white">Extracted Text</h3>
                         {extractedText && <button onClick={() => handleCopy(extractedText, 'input')} className="px-3 py-1 bg-slate-200 text-slate-700 text-xs font-semibold rounded-md hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600">{isInputCopied ? 'Copied!' : 'Copy'}</button>}
                      </div>
                      <textarea readOnly value={isExtracting ? 'Analyzing document...' : extractedText} placeholder="Text from your file will appear here." className="w-full h-40 p-3 border border-slate-300 rounded-lg bg-slate-50 dark:bg-slate-900/50 dark:border-slate-600 dark:text-slate-300" />
                  </div>

                  {extractedText && (
                      <div className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-4 animate-fade-in">
                           <div className="flex flex-col sm:flex-row gap-3 items-center">
                              <select value={targetLanguage} onChange={e => setTargetLanguage(e.target.value)} className="w-full sm:w-auto flex-grow pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                                  {LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                              </select>
                              <button onClick={handleTranslate} disabled={isTranslating || isExtracting} className="w-full sm:w-auto px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-indigo-300 flex items-center justify-center">
                                  {isTranslating && <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" fill="currentColor"></path></svg>}
                                  {isTranslating ? 'Translating...' : '2. Translate'}
                              </button>
                          </div>
                          <div>
                              <div className="flex justify-between items-center mb-2">
                                 <h3 className="text-lg font-medium text-slate-900 dark:text-white">Translated Text</h3>
                                 {translatedText && <button onClick={() => handleCopy(translatedText, 'translated')} className="px-3 py-1 bg-slate-200 text-slate-700 text-xs font-semibold rounded-md hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600">{isTranslatedCopied ? 'Copied!' : 'Copy'}</button>}
                              </div>
                              <textarea readOnly value={isTranslating ? 'Translating text...' : translatedText} placeholder="Translated text will appear here." className="w-full h-40 p-3 border border-slate-300 rounded-lg bg-slate-50 dark:bg-slate-900/50 dark:border-slate-600 dark:text-slate-300" />
                          </div>
                      </div>
                  )}
              </div>
          </div>
      )}
    </>
  );

  const renderTextMode = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Input Text Area */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-medium text-slate-900 dark:text-white">Your Text</h3>
            {inputText && <button onClick={() => handleCopy(inputText, 'input')} className="px-3 py-1 bg-slate-200 text-slate-700 text-xs font-semibold rounded-md hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600">{isInputCopied ? 'Copied!' : 'Copy'}</button>}
          </div>
          <textarea 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter or paste text here to translate..." 
            className="w-full h-56 p-3 border border-slate-300 rounded-lg bg-white dark:bg-slate-900/50 dark:border-slate-600 dark:text-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" 
          />
        </div>

        {/* Translated Text Area */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-medium text-slate-900 dark:text-white">Translated Text</h3>
            {translatedText && <button onClick={() => handleCopy(translatedText, 'translated')} className="px-3 py-1 bg-slate-200 text-slate-700 text-xs font-semibold rounded-md hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600">{isTranslatedCopied ? 'Copied!' : 'Copy'}</button>}
          </div>
          <textarea 
            readOnly 
            value={isTranslating ? 'Translating...' : translatedText} 
            placeholder="Translation will appear here." 
            className="w-full h-56 p-3 border border-slate-300 rounded-lg bg-slate-50 dark:bg-slate-900/50 dark:border-slate-600 dark:text-slate-300" 
          />
        </div>
      </div>
      
      {/* Controls */}
      <div className="pt-6 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <select value={targetLanguage} onChange={e => setTargetLanguage(e.target.value)} className="w-full sm:w-auto flex-grow pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white">
            {LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
        </select>
        <div className="flex gap-3 w-full sm:w-auto">
            <button onClick={handleClear} className="w-full sm:w-auto px-6 py-2 bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600">
                Clear
            </button>
            <button onClick={handleTranslate} disabled={isTranslating || !inputText} className="w-full sm:w-auto px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-indigo-300 flex items-center justify-center">
                {isTranslating && <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" fill="currentColor"></path></svg>}
                Translate
            </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in">
      <button onClick={onBack} className="flex items-center text-sm font-medium text-slate-600 hover:text-indigo-600 mb-6 dark:text-slate-400 dark:hover:text-indigo-400">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Tools
      </button>

      <div className="bg-white rounded-xl shadow-lg p-8 dark:bg-slate-800">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Document & Text Translator</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6">Extract and translate from a file, or enter text directly.</p>

        <div className="flex justify-center border-b border-slate-200 dark:border-slate-700 mb-6">
          <button onClick={() => switchMode('document')} className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${mode === 'document' ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}>Translate Document</button>
          <button onClick={() => switchMode('text')} className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${mode === 'text' ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}>Translate Text</button>
        </div>
        
        {mode === 'document' ? renderDocumentMode() : renderTextMode()}
        
        {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
      </div>
    </div>
  );
};

export default DocumentTranslator;