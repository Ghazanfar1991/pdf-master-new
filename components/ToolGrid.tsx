import React from 'react';
import type { Tool } from '../types';
import { ToolId } from '../types';
import ToolCard from './ToolCard';
import { SummarizeIcon, ImageIcon, TextExtractorIcon, BackgroundRemoverIcon, ImageConverterIcon, ImageMergerIcon, ImageCompressorIcon, ImageEditorIcon, SmartConverterIcon, DocumentTranslatorIcon, PdfOcrIcon, PdfSplitMergeIcon, PdfEditorToolIcon } from './icons';

interface ToolGridProps {
  onSelectTool: (tool: Tool) => void;
}

const tools: Tool[] = [
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
    description: 'Add text, shapes, and other annotations directly to your PDF pages.',
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

const ToolGrid: React.FC<ToolGridProps> = ({ onSelectTool }) => {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-12 sm:py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl dark:text-white">Your All-in-One AI Toolkit</h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-400">
          Boost your productivity with our suite of AI-powered tools. Convert, edit, and create with ease.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <ToolCard key={tool.id} tool={tool} onSelect={onSelectTool} />
        ))}
      </div>
    </div>
  );
};

export default ToolGrid;