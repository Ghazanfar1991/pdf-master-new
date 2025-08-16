# Run and deploy your AI Studio app

This contains everything you need to run your app locally and deploy to Vercel.

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. (Optional) For Microsoft OCR, set `MICROSOFT_VISION_ENDPOINT` and `MICROSOFT_VISION_KEY` in [.env.local](.env.local)
4. Run the app:
   `npm run dev`

## Deploy to Vercel

This project is configured for deployment to Vercel, including both frontend and backend API endpoints.

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Connect the repository to Vercel
3. Set environment variables in the Vercel dashboard:
   - `GEMINI_API_KEY` (required)
   - `MICROSOFT_VISION_ENDPOINT` (optional)
   - `MICROSOFT_VISION_KEY` (optional)
4. Vercel will automatically detect the configuration and deploy both frontend and API endpoints

See [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md) for detailed deployment instructions.

## OCR Engines

This app supports multiple OCR engines for text extraction:

1. **Gemini AI** (Default) - Powered by Google Gemini AI, provides high accuracy with complex layouts
2. **Tesseract** (Free) - Powered by Tesseract.js, a free offline OCR engine
3. **Microsoft OCR** - Powered by Microsoft Computer Vision, high accuracy with handwritten text support

To use Microsoft OCR, you'll need to:
1. Create a Computer Vision resource in Azure
2. Get your endpoint and API key
3. Add them to your environment variables:
   ```
   MICROSOFT_VISION_ENDPOINT=https://your-resource-name.cognitiveservices.azure.com/
   MICROSOFT_VISION_KEY=your-api-key
   ```

## PDF Text Extraction Tool

This project now includes a comprehensive PDF text extraction tool with both frontend and backend components:

### Backend (Vercel Serverless Functions)
- Handles PDF processing using serverless functions
- Provides a REST API endpoint at `/api/process-pdf`
- Integrated directly with the frontend for seamless deployment

### Frontend (React)
- Allows users to upload PDF files
- Displays extracted content with proper formatting
- Supports downloading in both text and Word formats
