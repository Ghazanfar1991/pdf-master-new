
import React, { useState, useCallback, useMemo } from 'react';
import { summarizeText } from '../services/huggingFaceService';

interface SummarizerProps {
  onBack: () => void;
}

const Summarizer: React.FC<SummarizerProps> = ({ onBack }) => {
  const [inputText, setInputText] = useState('');
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [summaryLength, setSummaryLength] = useState<number | ''>(100);

  // Calculate word count
  useMemo(() => {
    const words = inputText.trim() ? inputText.trim().split(/\s+/) : [];
    setWordCount(words.length);
  }, [inputText]);

  const handleSummarize = useCallback(async () => {
    if (!inputText.trim()) {
      setError('Please enter some text to summarize.');
      return;
    }
    
    if (wordCount < 5) {
      setError('Text is too short to summarize. Please enter at least 5 words.');
      return;
    }
    
    setError('');
    setIsLoading(true);
    setSummary('');
    
    try {
      // Calculate max length based on user input or default to 150
      const maxLength = summaryLength && typeof summaryLength === 'number' && summaryLength > 0 ? Math.min(summaryLength, 500) : 150;
      // Set min length to about 30% of max length, but at least 30 words and not more than max length
      const minLength = Math.min(Math.max(30, Math.floor(maxLength * 0.3)), maxLength - 10);
      
      console.log('Summarizing with parameters:', { maxLength, minLength, wordCount });
      const result = await summarizeText(inputText, maxLength, minLength);
      console.log('Summarization result:', result);
      
      // Check if result indicates a parsing issue
      if (result.includes('could not be parsed') || result.includes('technical issue') || result.includes('could not be extracted')) {
        setError(`The summarization service is currently experiencing technical issues. Please try again later, use different text, or adjust the summary length.`);
        return;
      }
      
      setSummary(result);
    } catch (err: any) {
      console.error('Summarization error:', err);
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [inputText, summaryLength, wordCount]);

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
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">AI Text Summarizer</h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Paste your text below to get a quick and accurate summary powered by advanced AI.
          </p>
        </div>
        
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <label htmlFor="inputText" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Enter your text
            </label>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {wordCount} words
            </span>
          </div>
          <textarea
            id="inputText"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste your article, report, or any long text here..."
            className="textarea w-full min-h-[200px]"
            disabled={isLoading}
          />
        </div>
        
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="summaryLength" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Approximate Summary Length (words)
            </label>
            <input
              type="number"
              id="summaryLength"
              value={summaryLength}
              onChange={(e) => setSummaryLength(e.target.value ? parseInt(e.target.value) : '')}
              min="20"
              max="500"
              placeholder="100"
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              disabled={isLoading}
            />
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Enter desired word count for summary (20-500 words)
            </p>
          </div>
          
          <div className="flex items-end">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 w-full">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">Tip</h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                For best results, use texts with at least 50 words. Very short texts may be returned as-is.
              </p>
            </div>
          </div>
        </div>
        
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-error-50 dark:bg-error-900/20 text-error-700 dark:text-error-300">
            <div className="flex items-center">
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          </div>
        )}
        
        <div className="flex justify-end">
          <button
            onClick={handleSummarize}
            disabled={isLoading || !inputText.trim() || wordCount < 5}
            className="btn btn-primary btn-lg flex items-center"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Summarizing...
              </>
            ) : (
              <>
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Summarize Text
              </>
            )}
          </button>
        </div>

        {summary && (
          <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Summary</h3>
              <div className="flex items-center space-x-2">
                {summaryLength && typeof summaryLength === 'number' && (
                  <span className="badge badge-info">Target: ~{summaryLength} words</span>
                )}
                <span className="badge badge-success">AI Generated</span>
              </div>
            </div>
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <div className="whitespace-pre-wrap rounded-xl bg-slate-50 dark:bg-slate-800/50 p-6 text-slate-700 dark:text-slate-300">
                {summary}
              </div>
            </div>
            <div className="mt-4 flex justify-between items-center">
              <div className="text-sm text-slate-500 dark:text-slate-400">
                {summary.trim().split(/\s+/).filter(Boolean).length} words
                {summaryLength && typeof summaryLength === 'number' && wordCount > 50 && summary.trim().split(/\s+/).filter(Boolean).length < summaryLength * 0.7 && (
                  <span className="ml-2 text-amber-600 dark:text-amber-400">• Summary is shorter than requested. Try increasing the target length or using longer input text.</span>
                )}
              </div>
              <button 
                onClick={() => navigator.clipboard.writeText(summary)}
                className="btn btn-outline flex items-center"
              >
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy to Clipboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Summarizer;
