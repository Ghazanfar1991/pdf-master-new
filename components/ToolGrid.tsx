import React, { useState, useEffect } from 'react';
import type { Tool } from '../types';
import { ToolId } from '../types';
import ToolCard from './ToolCard';
import { SummarizeIcon, ImageIcon, TextExtractorIcon, BackgroundRemoverIcon, ImageConverterIcon, ImageMergerIcon, ImageCompressorIcon, ImageEditorIcon, SmartConverterIcon, DocumentTranslatorIcon, PdfOcrIcon, PdfSplitMergeIcon, PdfEditorToolIcon } from './icons';

interface ToolGridProps {
  onSelectTool: (tool: Tool) => void;
}

const allTools: Tool[] = [
  {
    id: ToolId.SUMMARIZER,
    title: 'AI Summarizer',
    description: 'Quickly summarize long documents or articles using advanced AI.',
    icon: <SummarizeIcon />,
    premium: false,
  },
  {
    id: ToolId.IMAGE_GENERATOR,
    title: 'AI Image Generator',
    description: 'Create unique images from text descriptions with our creative AI.',
    icon: <ImageIcon />,
    premium: true,
  },
  {
    id: ToolId.DOCUMENT_TRANSLATOR,
    title: 'Document Translator',
    description: 'Extract text from PDFs or images and translate it instantly.',
    icon: <DocumentTranslatorIcon />,
    premium: true,
  },
  {
    id: ToolId.TEXT_EXTRACTOR,
    title: 'AI Text Extractor',
    description: 'Extract written content from any image with high accuracy.',
    icon: <TextExtractorIcon />,
    premium: true,
  },
  {
    id: ToolId.PDF_OCR,
    title: 'PDF OCR',
    description: 'Extract all text content from any PDF file with high accuracy.',
    icon: <PdfOcrIcon />,
    premium: true,
  },
   {
    id: ToolId.PDF_SPLIT_MERGE,
    title: 'PDF Split & Merge',
    description: 'Split a PDF into multiple files or combine several PDFs into one.',
    icon: <PdfSplitMergeIcon />,
    premium: true,
  },
  {
    id: ToolId.PDF_EDITOR,
    title: 'PDF Editor',
    description: 'Edit PDF files with text, shapes, highlights and more advanced tools.',
    icon: <PdfEditorToolIcon />,
    premium: true,
  },

  {
    id: ToolId.BACKGROUND_REMOVER,
    title: 'Background Remover',
    description: 'Instantly remove the background from any image with one click.',
    icon: <BackgroundRemoverIcon />,
    premium: false,
  },
  {
    id: ToolId.IMAGE_EDITOR,
    title: 'Image Editor',
    description: 'Edit images with tools like crop, text, shapes, and background removal.',
    icon: <ImageEditorIcon />,
    premium: true,
  },
  {
    id: ToolId.IMAGE_CONVERTER,
    title: 'Image Converter',
    description: 'Convert images between popular formats like PNG, JPEG, and WEBP.',
    icon: <ImageConverterIcon />,
    premium: false,
  },
  {
    id: ToolId.SMART_CONVERTER,
    title: 'Smart Converter',
    description: 'Convert images to PDF or merge multiple PDF files into one document.',
    icon: <SmartConverterIcon />,
    premium: false,
  },
  {
    id: ToolId.IMAGE_MERGER,
    title: 'Image Merger',
    description: 'Combine multiple images horizontally, vertically, or in a grid.',
    icon: <ImageMergerIcon />,
    premium: false,
  },
  {
    id: ToolId.IMAGE_COMPRESSOR,
    title: 'Image Compressor',
    description: 'Reduce image file size with a quality slider and size preview.',
    icon: <ImageCompressorIcon />,
    premium: false,
  }
];

const categories = [
  { id: 'all', name: 'All Tools' },
  { id: 'ai', name: 'AI Tools' },
  { id: 'pdf', name: 'PDF Tools' },
  { id: 'image', name: 'Image Tools' },
];

const ToolGrid: React.FC<ToolGridProps> = ({ onSelectTool }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTools, setFilteredTools] = useState<Tool[]>(allTools);

  useEffect(() => {
    const filtered = allTools.filter(tool => {
      const matchesCategory = selectedCategory === 'all' ||
        (selectedCategory === 'ai' && [ToolId.SUMMARIZER, ToolId.IMAGE_GENERATOR, ToolId.DOCUMENT_TRANSLATOR, ToolId.TEXT_EXTRACTOR, ToolId.PDF_OCR].includes(tool.id)) ||
        (selectedCategory === 'pdf' && [ToolId.PDF_OCR, ToolId.PDF_SPLIT_MERGE, ToolId.PDF_EDITOR].includes(tool.id)) ||
        (selectedCategory === 'image' && [ToolId.BACKGROUND_REMOVER, ToolId.IMAGE_EDITOR, ToolId.IMAGE_CONVERTER, ToolId.SMART_CONVERTER, ToolId.IMAGE_MERGER, ToolId.IMAGE_COMPRESSOR].includes(tool.id));
      
      const matchesSearch = tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesCategory && matchesSearch;
    });
    
    setFilteredTools(filtered);
  }, [selectedCategory, searchQuery]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 sm:py-12">
      {/* Hero Section */}
      <div className="text-center mb-12 animate-fade-in-up">
        <div className="inline-flex items-center px-4 py-2 bg-primary-100 dark:bg-primary-900/30 rounded-full text-primary-800 dark:text-primary-200 text-sm font-medium mb-4">
          <span className="h-2 w-2 bg-primary-500 rounded-full mr-2 animate-pulse"></span>
          Powerful AI Tools
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gradient-primary mb-4">
          Your All-in-One AI Toolkit
        </h1>
        <p className="max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-400">
          Boost your productivity with our suite of AI-powered tools. Convert, edit, and create with ease.
        </p>
      </div>

      {/* Search and Filter */}
      <div className="mb-12 flex flex-col md:flex-row gap-6 items-center justify-between">
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search tools..."
            className="input w-full pl-10 pr-3 py-3 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap gap-3">
          {categories.map((category) => (
            <button
              key={category.id}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                selectedCategory === category.id
                  ? 'bg-gradient-primary text-white shadow-lg'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 shadow-sm'
              }`}
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Tools Grid */}
      {filteredTools.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTools.map((tool, index) => (
            <div 
              key={tool.id} 
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <ToolCard tool={tool} onSelect={onSelectTool} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 animate-fade-in">
          <div className="mx-auto h-24 w-24 text-slate-400">
            <svg className="h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="mt-6 text-xl font-medium text-slate-900 dark:text-white">No tools found</h3>
          <p className="mt-2 text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Try adjusting your search or filter to find what you're looking for.
          </p>
          <button
            className="mt-6 px-5 py-2.5 rounded-lg bg-gradient-primary text-white hover:shadow-lg transition-all transform hover:scale-105"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
};

export default ToolGrid;