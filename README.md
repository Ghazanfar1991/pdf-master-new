# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. (Optional) For Microsoft OCR, set `MICROSOFT_VISION_ENDPOINT` and `MICROSOFT_VISION_KEY` in [.env.local](.env.local)
4. Run the app:
   `npm run dev`

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
