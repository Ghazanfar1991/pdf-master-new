import { removeBackground } from '@imgly/background-removal';
import Tesseract from 'tesseract.js';
import fetch from 'node-fetch';

const LIBRE_TRANSLATE_URL = 'https://libretranslate.de/translate';
const HF_SUMMARIZATION_URL = 'https://api-inference.huggingface.co/models/t5-base';
const HF_IMAGE_GENERATION_URL = 'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2';

// Set Hugging Face API key (free tier available but limited)
const HF_API_KEY = process.env.HF_API_KEY || '';

/** Summarize text using Hugging Face (T5) */
export const summarizeText = async (text: string): Promise<string> => {
  if (!text.trim()) throw new Error("Input text cannot be empty.");

  const response = await fetch(HF_SUMMARIZATION_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${HF_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ inputs: `summarize: ${text}` })
  });

  const result = await response.json();
  if (result.error) throw new Error(`Summarization failed: ${result.error}`);
  return result[0]?.summary_text || 'No summary generated.';
};

/** Generate image using Stable Diffusion (Hugging Face) */
export const generateImage = async (prompt: string): Promise<string> => {
  if (!prompt.trim()) throw new Error("Image prompt cannot be empty.");

  const response = await fetch(HF_IMAGE_GENERATION_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${HF_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ inputs: prompt })
  });

  const arrayBuffer = await response.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString('base64');
  return `data:image/png;base64,${base64}`;
};

/** Extract text from image using Tesseract.js */
export const extractTextFromImage = async (imageFile: File): Promise<string> => {
  if (!imageFile) throw new Error("Please provide an image file.");
  if (!imageFile.type.startsWith('image/')) throw new Error("Invalid file type.");

  const result = await Tesseract.recognize(imageFile, 'eng', { logger: () => {} });
  return result.data.text.trim();
};

/** Extract text from file (image or PDF) using Tesseract.js */
export const extractTextFromFile = async (file: File): Promise<string> => {
  if (!file) throw new Error("Please provide a file.");
  if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
    throw new Error("Invalid file type. Please upload an image or a PDF.");
  }

  const result = await Tesseract.recognize(file, 'eng', { logger: () => {} });
  return result.data.text.trim();
};

/** Translate text using LibreTranslate */
export const translateText = async (text: string, targetLanguage: string): Promise<string> => {
  if (!text.trim()) return "";

  const response = await fetch(LIBRE_TRANSLATE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ q: text, source: 'auto', target: targetLanguage, format: 'text' })
  });

  const data = await response.json();
  if (data.error) throw new Error(`Translation failed: ${data.error}`);
  return data.translatedText || '';
};

/** Remove image background (already free, no change) */
export const removeImageBackground = async (imageFile: File): Promise<string> => {
  if (!imageFile) throw new Error("Please provide an image file.");
  if (!imageFile.type.startsWith('image/')) throw new Error("Invalid file type.");

  const blob = await removeBackground(imageFile, { output: { format: 'image/png' } });
  return URL.createObjectURL(blob);
};
