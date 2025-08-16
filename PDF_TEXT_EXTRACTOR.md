# PDF Text Extractor Tool

## Overview
The PDF Text Extractor tool is a comprehensive solution for extracting and formatting content from PDF documents. It works with both digital PDFs (text-based) and scanned PDFs (image-based), accurately extracting text, tables, and images, then presenting the output in a well-formatted, structured manner.

## Features
- Extracts text from both digital and scanned PDFs
- Identifies and extracts tables with structured data
- Extracts images and converts them to base64 format
- Classifies content elements (titles, headers, paragraphs, etc.)
- Provides formatted output in JSON structure
- Supports downloading extracted content as plain text or Word documents

## How It Works

### 1. PDF Type Detection
The tool first determines if a PDF is digital (text-based) or scanned (image-based) by analyzing the first page:
- If extracted text is less than 10 characters → Scanned PDF
- Otherwise → Digital PDF

### 2. Digital PDF Processing
For digital PDFs, the tool uses:
- **PDF.js**: Extracts text and basic document structure
- Custom algorithms to identify content elements

### 3. Scanned PDF Processing
For scanned PDFs, the tool uses:
- Client-side OCR processing for basic text extraction
- Content analysis to group text elements into paragraphs

### 4. Content Formatting
The extracted content is formatted into structured JSON elements:
```json
[
  { "type": "Title", "text": "Document Title" },
  { "type": "Header", "text": "Section Header" },
  { "type": "Paragraph", "text": "Paragraph content..." },
  { "type": "Table", "data": [[ "Col1", "Col2" ], [ "Val1", "Val2" ]] },
  { "type": "Image", "src": "base64encodedimage" }
]
```

## API Endpoint
**POST /api/process-pdf**
- Input: A .pdf file (uploaded via multipart/form-data)
- Output: JSON containing structured document elements

## Frontend Features
- File upload component for PDF selection
- Loading indicator during processing
- Results display with proper formatting
- Download options for text (.txt) or Word (.docx) formats
- Responsive design that works on all devices

## Deployment Options

### Vercel (Recommended)
- Frontend and API deployed together
- Serverless functions handle PDF processing
- Easy deployment with Git integration
- See [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md) for details

### Self-hosted Backend
For full PDF processing capabilities:
- Use the original FastAPI implementation
- Deploy separately from frontend
- Requires Tesseract OCR and Poppler system dependencies
- Higher processing limits for large documents