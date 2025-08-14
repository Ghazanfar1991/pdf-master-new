import type React from 'react';

export enum ToolId {
  SUMMARIZER = 'summarizer',
  IMAGE_GENERATOR = 'image_generator',
  TEXT_EXTRACTOR = 'text_extractor',
  BACKGROUND_REMOVER = 'background_remover',
  IMAGE_CONVERTER = 'image_converter',
  IMAGE_MERGER = 'image_merger',
  IMAGE_COMPRESSOR = 'image_compressor',
  IMAGE_EDITOR = 'image_editor',
  SMART_CONVERTER = 'smart_converter',
  DOCUMENT_TRANSLATOR = 'document_translator',
  PDF_OCR = 'pdf_ocr',
  PDF_SPLIT_MERGE = 'pdf_split_merge',
  PDF_EDITOR = 'pdf_editor',
}

export interface Tool {
  id: ToolId;
  title: string;
  description: string;
  icon: React.ReactNode;
  premium: boolean;
}