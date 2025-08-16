# Deployment Guide for PDF Text Extractor Tool

## Prerequisites
- Node.js (v14 or higher)
- Python (v3.8 or higher)
- Tesseract OCR
- Poppler

## Local Development Deployment

### 1. Frontend Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Start backend server
uvicorn main:app --reload
```

## Production Deployment

### Frontend (Vercel)
1. Push code to GitHub/GitLab
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard:
   - `GEMINI_API_KEY` (required)
   - `MICROSOFT_VISION_ENDPOINT` (optional)
   - `MICROSOFT_VISION_KEY` (optional)

### Backend (Any Python-compatible hosting)
1. Install system dependencies on server:
   - Tesseract OCR
   - Poppler
2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Start server with:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000
   ```

## Environment Variables

### Frontend
- `GEMINI_API_KEY`: Required for Gemini AI OCR
- `MICROSOFT_VISION_ENDPOINT`: Optional for Microsoft OCR
- `MICROSOFT_VISION_KEY`: Optional for Microsoft OCR

### Backend
- `TESSERACT_PATH`: Path to Tesseract executable (if not in PATH)
- `POPPLER_PATH`: Path to Poppler binaries (if not in PATH)

## API Endpoints

### Process PDF
- **URL**: `/process-pdf/`
- **Method**: POST
- **Content-Type**: multipart/form-data
- **Parameters**: `file` (PDF file)
- **Response**: JSON array of extracted elements

## Troubleshooting

### Common Issues
1. **Tesseract not found**: Ensure Tesseract is installed and in PATH, or set `TESSERACT_PATH`
2. **Poppler not found**: Ensure Poppler is installed and in PATH, or set `POPPLER_PATH`
3. **CORS errors**: Check that frontend and backend URLs are properly configured
4. **Large file processing**: For large PDFs, increase timeout settings in both frontend and backend

### Performance Optimization
1. Use production mode for frontend: `npm run build` and `npm run preview`
2. Use production server for backend: `uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4`
3. Consider using a CDN for static assets
4. Implement caching for frequently processed documents