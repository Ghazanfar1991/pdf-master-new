# Vercel Deployment Guide

## Overview
This project is configured for deployment to Vercel, which allows you to deploy both the frontend and backend API endpoints in a single deployment.

## Deployment Process

### 1. Automatic Deployment
Vercel automatically detects the project configuration and deploys:
- Frontend: React application built with Vite
- Backend: Serverless functions in the `api/` directory

### 2. API Endpoints
The following API endpoints are available after deployment:
- `/api/process-pdf` - PDF text extraction endpoint

### 3. Environment Variables
Set the following environment variables in the Vercel dashboard:
- `GEMINI_API_KEY` (required for Gemini AI OCR)
- `MICROSOFT_VISION_ENDPOINT` (optional for Microsoft OCR)
- `MICROSOFT_VISION_KEY` (optional for Microsoft OCR)

## File Structure
```
/
├── api/
│   └── process-pdf.ts    # Serverless function for PDF processing
├── components/           # React components
├── public/               # Static assets
├── src/                  # Source files
├── vercel.json           # Vercel configuration
└── package.json          # Project dependencies
```

## Current Implementation

### API Function
The current implementation of the PDF processing API returns mock data to ensure the frontend works correctly. This is because:

1. Serverless functions have execution time limits (max 60 seconds)
2. Processing large PDFs with full OCR capabilities would exceed these limits
3. Heavy processing libraries may exceed memory constraints

### Frontend Handling
The frontend gracefully handles API responses:
- Shows loading indicators during processing
- Displays extracted content in a structured format
- Provides download options for text and Word documents
- Shows helpful error messages when API calls fail

## Limitations
The current Vercel implementation uses mock data for PDF processing due to limitations of serverless functions:
1. File system access is limited in serverless functions
2. Heavy processing libraries may exceed execution time limits
3. Memory constraints may affect processing of large PDFs

## For Production Use

For production use with full PDF processing capabilities, consider:

### Option 1: Enhanced Vercel Functions
1. Implement basic PDF text extraction using PDF.js directly in the Vercel function
2. Use lighter-weight processing libraries
3. Implement timeouts and error handling for large files

### Option 2: Separate Backend Service
1. Deploy the original FastAPI backend separately (e.g., on Render, Heroku, or AWS)
2. Update the frontend to call the external API endpoint
3. This approach provides:
   - Full PDF processing capabilities
   - Higher limits for file sizes and processing time
   - Better performance for complex documents

### Option 3: Client-Side Processing
1. Implement PDF processing directly in the browser using libraries like PDF.js
2. This approach provides:
   - No server-side processing costs
   - Immediate processing without network latency
   - Works offline for basic functionality