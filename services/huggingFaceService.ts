import { HfInference } from '@huggingface/inference';
import { removeBackground } from '@imgly/background-removal';
import Tesseract from 'tesseract.js';

const LIBRE_TRANSLATE_URL = 'https://libretranslate.de/translate';
const HF_SUMMARIZATION_MODEL = 'facebook/bart-large-cnn';
const HF_IMAGE_GENERATION_MODEL = 'stabilityai/stable-diffusion-xl-base-1.0';

// Set Hugging Face API key
const HF_API_KEY = process.env.HF_API_KEY || '';

let hf: HfInference | null = null;
if (HF_API_KEY) {
  hf = new HfInference(HF_API_KEY);
}

/** Summarize text using Hugging Face */
export const summarizeText = async (text: string, maxLength?: number, minLength?: number): Promise<string> => {
  if (!text.trim()) throw new Error("Input text cannot be empty.");
  
  // Check if HF API key is configured
  if (!hf) {
    throw new Error("Hugging Face API key is not configured. Please check your environment variables.");
  }

  // Set default values for summary length with better ranges
  const maxLen = maxLength && maxLength > 0 ? Math.min(maxLength, 500) : 150;
  const minLen = minLength && minLength > 0 ? Math.min(minLength, maxLen - 10) : Math.max(30, Math.floor(maxLen * 0.3));

  // For very short texts, return the text itself
  const wordCount = text.trim().split(/\s+/).length;
  if (wordCount < 15) {
    return text.trim();
  }

  try {
    // Try the summarization endpoint first
    const response = await hf.summarization({
      inputs: text,
      model: HF_SUMMARIZATION_MODEL,
      parameters: {
        max_length: maxLen,
        min_length: minLen,
        do_sample: false,
        truncation: "only_first"
      },
    });

    console.log("Summarization response:", JSON.stringify(response, null, 2));

    // Extract summary with comprehensive approach
    let summary = '';
    
    // Handle array response
    if (Array.isArray(response) && response.length > 0) {
      const firstItem = response[0];
      if (firstItem) {
        // If it's an object, look for text properties
        if (typeof firstItem === 'object' && firstItem !== null) {
          // Check common property names
          if ('summary_text' in firstItem && typeof firstItem.summary_text === 'string') {
            summary = firstItem.summary_text;
          } else if ('generated_text' in firstItem && typeof firstItem.generated_text === 'string') {
            summary = firstItem.generated_text;
          } else {
            // Try any string property
            for (const key in firstItem) {
              if (typeof firstItem[key] === 'string' && firstItem[key].trim()) {
                summary = firstItem[key];
                break;
              }
            }
          }
        } 
        // If it's a string directly
        else if (typeof firstItem === 'string') {
          summary = firstItem;
        }
      }
    } 
    // Handle object response
    else if (response && typeof response === 'object') {
      // Check common property names
      if ('summary_text' in response && typeof response.summary_text === 'string') {
        summary = response.summary_text;
      } else if ('generated_text' in response && typeof response.generated_text === 'string') {
        summary = response.generated_text;
      } else {
        // Try any string property
        for (const key in response) {
          if (typeof response[key] === 'string' && response[key].trim()) {
            summary = response[key];
            break;
          }
        }
      }
    }
    // Handle string response
    else if (typeof response === 'string') {
      summary = response;
    }
    
    // Process the summary
    if (summary && summary.trim()) {
      let cleanSummary = summary.trim();
      
      // Basic formatting
      if (!cleanSummary.endsWith('.') && !cleanSummary.endsWith('!') && !cleanSummary.endsWith('?')) {
        cleanSummary += '.';
      }
      
      if (cleanSummary.charAt(0) === cleanSummary.charAt(0).toLowerCase()) {
        cleanSummary = cleanSummary.charAt(0).toUpperCase() + cleanSummary.slice(1);
      }
      
      return cleanSummary;
    }
    
    // If we couldn't extract a summary, return a more specific message
    return 'Summary generated but content could not be extracted. The model may have returned an unexpected format.';
  } catch (error: any) {
    console.error("Error summarizing text with Hugging Face:", error);
    
    // Handle specific error cases
    if (error.message && error.message.includes('401')) {
      throw new Error("Invalid Hugging Face API key. Please check your HF_API_KEY environment variable.");
    }
    
    if (error.message && error.message.includes('limit')) {
      throw new Error("You've hit the rate limit for Hugging Face API. Please wait a moment and try again.");
    }
    
    if (error.message && error.message.includes('model')) {
      throw new Error("The summarization model is temporarily unavailable. Please try again later.");
    }
    
    // For text that's too long, suggest a solution
    if (error.message && (error.message.includes('token') || error.message.includes('length'))) {
      throw new Error("Text is too long for summarization. Please try with a shorter text or break it into smaller parts.");
    }
    
    throw new Error(`Summarization failed: ${error.message || 'Unknown error'}`);
  }
};

/** Generate image using Stable Diffusion (Hugging Face) */
export const generateImage = async (prompt: string): Promise<string> => {
  if (!prompt.trim()) throw new Error("Image prompt cannot be empty.");
  
  // Check if HF API key is configured
  if (!hf) {
    throw new Error("Hugging Face API key is not configured. Please check your environment variables.");
  }

  try {
    const response = await hf.textToImage({
      inputs: prompt,
      model: HF_IMAGE_GENERATION_MODEL,
      parameters: {
        negative_prompt: 'blurry, low quality, text, watermark',
        num_inference_steps: 30,
      },
    });

    // Convert blob to base64
    const arrayBuffer = await response.arrayBuffer();
    // For browser environments, we need to handle base64 conversion differently
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.readAsDataURL(new Blob([arrayBuffer]));
    });
  } catch (error: any) {
    console.error("Error generating image with Hugging Face:", error);
    
    // Provide more specific error messages
    if (error.message && error.message.includes('401')) {
      throw new Error("Invalid Hugging Face API key. Please check your HF_API_KEY environment variable.");
    }
    
    if (error.message && error.message.includes('limit')) {
      throw new Error("You've hit the rate limit for Hugging Face API. Please wait a moment and try again.");
    }
    
    if (error.message && error.message.includes('model')) {
      throw new Error("The image generation model is temporarily unavailable. Please try again later or use a different prompt.");
    }
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error("Network error while connecting to Hugging Face. Please check your internet connection and try again.");
    }
    
    throw new Error(`Failed to generate image with Hugging Face: ${error.message || 'Unknown error'}. Please try a different prompt or check the service status.`);
  }
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

  // Map language names to codes for LibreTranslate
  const languageMap: Record<string, string> = {
    "Chinese (Simplified)": "zh",
    "English": "en",
    "French": "fr",
    "German": "de",
    "Hindi": "hi",
    "Italian": "it",
    "Japanese": "ja",
    "Korean": "ko",
    "Portuguese": "pt",
    "Russian": "ru",
    "Spanish": "es",
    "Urdu": "ur"
  };

  const targetCode = languageMap[targetLanguage] || "en";

  try {
    const response = await fetch(LIBRE_TRANSLATE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: text, source: 'auto', target: targetCode, format: 'text' })
    });

    const data = await response.json();
    if (data.error) throw new Error(`Translation failed: ${data.error}`);
    return data.translatedText || '';
  } catch (error: any) {
    console.error("Error translating text:", error);
    throw new Error(`Translation failed: ${error.message || 'Unknown error'}`);
  }
};

/** Remove image background (already free, no change) */
export const removeImageBackground = async (imageFile: File): Promise<string> => {
  if (!imageFile) throw new Error("Please provide an image file.");
  if (!imageFile.type.startsWith('image/')) throw new Error("Invalid file type.");

  const blob = await removeBackground(imageFile, { output: { format: 'image/png' } });
  return URL.createObjectURL(blob);
};