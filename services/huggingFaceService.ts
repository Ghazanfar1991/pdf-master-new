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

  // Convert word counts to token counts (roughly 1 word = 1.3 tokens on average)
  // Also set reasonable bounds since models have token limits
  const maxWords = maxLength && maxLength > 0 ? Math.min(maxLength, 500) : 150;
  const minWords = minLength && minLength > 0 ? Math.min(minLength, maxWords - 10) : Math.max(30, Math.floor(maxWords * 0.4));
  
  // Convert to tokens (1 word ≈ 1.3 tokens)
  const maxTokens = Math.min(Math.floor(maxWords * 1.4), 512); // BART limit is 1024 but let's be safe
  const minTokens = Math.max(Math.floor(minWords * 1.2), 20);

  // For very short texts, return the text itself
  const wordCount = text.trim().split(/\s+/).length;
  if (wordCount < 15) {
    return text.trim();
  }

  try {
    // Handle long texts by truncating to prevent API errors
    let processedText = text.trim();
    if (processedText.length > 3000) {
      // Truncate to first 3000 characters but try to end at a sentence boundary
      processedText = processedText.substring(0, 3000);
      const lastSentenceEnd = Math.max(
        processedText.lastIndexOf('.'),
        processedText.lastIndexOf('!'),
        processedText.lastIndexOf('?')
      );
      if (lastSentenceEnd > 2000) {
        processedText = processedText.substring(0, lastSentenceEnd + 1);
      }
    }

    // Try the summarization endpoint with properly tuned parameters
    const response = await hf.summarization({
      inputs: processedText,
      model: 'facebook/bart-large-cnn',
      parameters: {
        max_length: maxTokens,
        min_length: minTokens,
        do_sample: false,
        truncation: "only_first",
        early_stopping: true,
        length_penalty: 2.0 // Higher penalty encourages outputs closer to max_length
      },
    });

    console.log("Summarization response:", JSON.stringify(response, null, 2));
    console.log("Requested - Min words:", minWords, "Max words:", maxWords);
    console.log("Converted - Min tokens:", minTokens, "Max tokens:", maxTokens);

    // Extract summary with comprehensive approach
    let summary = '';
    
    // Handle array response - most common format
    if (Array.isArray(response) && response.length > 0) {
      const firstItem = response[0];
      if (firstItem && typeof firstItem === 'object' && firstItem !== null) {
        // Look for summary_text (primary) or generated_text (secondary)
        if ('summary_text' in firstItem && typeof firstItem.summary_text === 'string' && firstItem.summary_text.trim()) {
          summary = firstItem.summary_text.trim();
        } else if ('generated_text' in firstItem && typeof firstItem.generated_text === 'string' && firstItem.generated_text.trim()) {
          summary = firstItem.generated_text.trim();
        } else {
          // Try any non-empty string property
          for (const key in firstItem) {
            if (typeof firstItem[key] === 'string' && firstItem[key].trim()) {
              summary = firstItem[key].trim();
              break;
            }
          }
        }
      } else if (typeof firstItem === 'string' && firstItem.trim()) {
        // Direct string in array
        summary = firstItem.trim();
      }
    } 
    // Handle direct object response
    else if (response && typeof response === 'object' && response !== null) {
      if ('summary_text' in response && typeof response.summary_text === 'string' && response.summary_text.trim()) {
        summary = response.summary_text.trim();
      } else if ('generated_text' in response && typeof response.generated_text === 'string' && response.generated_text.trim()) {
        summary = response.generated_text.trim();
      } else {
        // Try any non-empty string property
        for (const key in response) {
          if (typeof response[key] === 'string' && response[key].trim()) {
            summary = response[key].trim();
            break;
          }
        }
      }
    }
    // Handle direct string response
    else if (typeof response === 'string' && response.trim()) {
      summary = response.trim();
    }
    
    // Process and format the summary if we found content
    if (summary) {
      // Clean up the text
      let cleanSummary = summary.trim();
      
      // Add periods at the end of sentences if missing
      if (!cleanSummary.endsWith('.') && !cleanSummary.endsWith('!') && !cleanSummary.endsWith('?')) {
        cleanSummary += '.';
      }
      
      // Capitalize first letter if not already capitalized
      if (cleanSummary && cleanSummary.charAt(0) === cleanSummary.charAt(0).toLowerCase()) {
        cleanSummary = cleanSummary.charAt(0).toUpperCase() + cleanSummary.slice(1);
      }
      
      // Check if summary is significantly shorter than requested and try to improve it
      const resultWordCount = cleanSummary.trim().split(/\s+/).length;
      if (resultWordCount < minWords * 0.5 && maxWords > 50) { // If result is less than half the minimum requested
        console.log("Summary is shorter than expected, attempting to generate a longer version");
        
        // Try with adjusted parameters to encourage longer output
        try {
          const secondResponse = await hf.summarization({
            inputs: processedText,
            model: 'facebook/bart-large-cnn',
            parameters: {
              max_length: Math.min(maxTokens + 100, 512),
              min_length: Math.max(minTokens, 50),
              do_sample: false,
              truncation: "only_first",
              early_stopping: true,
              length_penalty: 1.5
            },
          });
          
          // Extract from second attempt
          let secondSummary = '';
          if (Array.isArray(secondResponse) && secondResponse.length > 0 && secondResponse[0].summary_text) {
            secondSummary = secondResponse[0].summary_text.trim();
            if (secondSummary) {
              // Format the second summary
              let formattedSecond = secondSummary.trim();
              if (!formattedSecond.endsWith('.')) {
                formattedSecond += '.';
              }
              if (formattedSecond.charAt(0) === formattedSecond.charAt(0).toLowerCase()) {
                formattedSecond = formattedSecond.charAt(0).toUpperCase() + formattedSecond.slice(1);
              }
              
              // Use the second summary if it's longer
              const secondWordCount = formattedSecond.trim().split(/\s+/).length;
              if (secondWordCount > resultWordCount) {
                return formattedSecond;
              }
            }
          }
        } catch (secondError) {
          console.log("Second attempt failed, using original summary");
        }
      }
      
      return cleanSummary;
    }
    
    // If we get here and still have no summary, it's a real issue
    console.warn("Could not extract summary from response:", response);
    return 'Summary generated successfully, but the content could not be extracted properly. Please try with different text or adjust the summary length.';
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
      throw new Error("Text is too long for summarization. The system has automatically truncated it, but you may want to break it into smaller parts manually.");
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
    "Arabic": "ar",
    "Bengali": "bn",
    "Chinese (Simplified)": "zh",
    "Czech": "cs",
    "Danish": "da",
    "Dutch": "nl",
    "English": "en",
    "Esperanto": "eo",
    "Finnish": "fi",
    "French": "fr",
    "German": "de",
    "Greek": "el",
    "Hindi": "hi",
    "Hungarian": "hu",
    "Indonesian": "id",
    "Italian": "it",
    "Japanese": "ja",
    "Korean": "ko",
    "Persian": "fa",
    "Polish": "pl",
    "Portuguese": "pt",
    "Romanian": "ro",
    "Russian": "ru",
    "Slovak": "sk",
    "Spanish": "es",
    "Swedish": "sv",
    "Turkish": "tr",
    "Ukrainian": "uk",
    "Urdu": "ur",
    "Vietnamese": "vi"
  };

  const targetCode = languageMap[targetLanguage] || "en";

  // Handle long texts by truncating to prevent API errors (LibreTranslate has limits)
  let processedText = text.trim();
  const MAX_TEXT_LENGTH = 5000; // Safe limit for most LibreTranslate instances
  
  if (processedText.length > MAX_TEXT_LENGTH) {
    processedText = processedText.substring(0, MAX_TEXT_LENGTH);
    // Try to end at a sentence boundary
    const lastSentenceEnd = Math.max(
      processedText.lastIndexOf('.'),
      processedText.lastIndexOf('!'),
      processedText.lastIndexOf('?')
    );
    if (lastSentenceEnd > MAX_TEXT_LENGTH * 0.9) {
      processedText = processedText.substring(0, lastSentenceEnd + 1);
    }
  }

  try {
    // Use a CORS proxy that's known to work
    const proxyUrl = 'https://corsproxy.io/?';
    const targetUrl = 'https://libretranslate.de/translate';
    
    const response = await fetch(proxyUrl + encodeURIComponent(targetUrl), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        q: processedText, 
        source: 'auto', 
        target: targetCode, 
        format: 'text'
      })
    });

    // Check if response is OK before parsing JSON
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Translation API error response:", errorText);
      throw new Error(`Translation service error: ${response.status} - ${response.statusText}`);
    }

    // Check content type before parsing
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const errorText = await response.text();
      console.error("Non-JSON response:", errorText);
      throw new Error("Translation service returned unexpected response format.");
    }

    const data = await response.json();
    
    if (data.error) {
      if (data.error.includes('limit') || data.error.includes('quota')) {
        throw new Error("Translation service rate limit reached. Please try again in a moment.");
      }
      throw new Error(`Translation failed: ${data.error}`);
    }
    
    return data.translatedText || '';
  } catch (error: any) {
    console.error("Error translating text:", error);
    
    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error("Network error connecting to translation service. Please check your internet connection.");
    }
    
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