import Tesseract from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';

// Set the worker path for pdfjs (matching the pattern used in other components)
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// Function to convert PDF to images
const convertPdfToImages = async (file: File): Promise<HTMLCanvasElement[]> => {
  try {
    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Load PDF document
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    const canvasArray: HTMLCanvasElement[] = [];
    
    // Process each page
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      
      // Set viewport
      const viewport = page.getViewport({ scale: 2.0 }); // Scale up for better OCR
      
      // Create canvas
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      if (!context) {
        throw new Error('Could not get canvas context');
      }
      
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      // Render PDF page to canvas
      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise;
      
      canvasArray.push(canvas);
    }
    
    return canvasArray;
  } catch (error) {
    console.error('PDF conversion error:', error);
    throw new Error('Failed to convert PDF to images. The file may be corrupted or password-protected.');
  }
};

// Tesseract OCR implementation for images
const extractTextFromImage = async (image: File | HTMLCanvasElement): Promise<string> => {
  try {
    const result = await Tesseract.recognize(
      image,
      'eng',
      {
        logger: (m) => console.log('Tesseract progress:', m),
      }
    );
    
    return result.data.text;
  } catch (error) {
    console.error('Tesseract OCR error:', error);
    throw new Error('Failed to extract text with Tesseract. The image may not contain readable text or may be corrupted.');
  }
};

// Tesseract OCR implementation
export const extractTextWithTesseract = async (file: File): Promise<string> => {
  try {
    // Check if it's a PDF file
    if (file.type === 'application/pdf') {
      // Convert PDF to images
      const canvasArray = await convertPdfToImages(file);
      
      // Extract text from each page
      let fullText = '';
      for (let i = 0; i < canvasArray.length; i++) {
        const pageText = await extractTextFromImage(canvasArray[i]);
        fullText += `\n\n--- Page ${i + 1} ---\n\n${pageText}`;
      }
      
      return fullText.trim();
    } else {
      // For image files, process directly
      return await extractTextFromImage(file);
    }
  } catch (error) {
    console.error('Tesseract OCR error:', error);
    throw new Error(`Failed to extract text: ${error.message || 'Unknown error occurred'}`);
  }
};