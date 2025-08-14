
import React, { useState, useCallback } from 'react';
import { summarizeText } from '../services/geminiService';

interface SummarizerProps {
  onBack: () => void;
}

const Summarizer: React.FC<SummarizerProps> = ({ onBack }) => {
  const [inputText, setInputText] = useState('');
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSummarize = useCallback(async () => {
    if (!inputText) {
      setError('Please enter some text to summarize.');
      return;
    }
    setError('');
    setIsLoading(true);
    setSummary('');
    try {
      const result = await summarizeText(inputText);
      setSummary(result);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [inputText]);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in">
      <button onClick={onBack} className="flex items-center text-sm font-medium text-slate-600 hover:text-indigo-600 mb-6 dark:text-slate-400 dark:hover:text-indigo-400">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Tools
      </button>

      <div className="bg-white rounded-xl shadow-lg p-8 dark:bg-slate-800">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">AI Text Summarizer</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6">Paste your text below to get a quick and accurate summary.</p>
        
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Paste your article, report, or any long text here..."
          className="w-full h-48 p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400"
          disabled={isLoading}
        />
        
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSummarize}
            disabled={isLoading || !inputText}
            className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-300 disabled:cursor-not-allowed dark:disabled:bg-indigo-800 dark:disabled:text-slate-400 flex items-center"
          >
            {isLoading && (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {isLoading ? 'Summarizing...' : 'Summarize'}
          </button>
        </div>

        {summary && (
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Summary:</h3>
            <div className="whitespace-pre-wrap rounded-lg bg-slate-100 p-4 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300">
                {summary}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Summarizer;
