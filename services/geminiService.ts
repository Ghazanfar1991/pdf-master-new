import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { removeBackground } from '@imgly/background-removal';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set. Please ensure it is configured.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

// Helper function to convert File to base64 for the Gemini API
const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

export const summarizeText = async (text: string): Promise<string> => {
  if (!text.trim()) {
    throw new Error("Input text cannot be empty.");
  }
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Summarize the following text. Be concise, clear, and capture the main points. Format the output nicely using markdown if appropriate (e.g., bullet points for lists).\n\n---\n\n${text}`,
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });
    return response.text;
  } catch (error) {
    console.error("Error summarizing text:", error);
    throw new Error("Failed to generate summary. The AI service may be busy or unavailable.");
  }
};

export const generateImage = async (prompt: string): Promise<string> => {
    if (!prompt.trim()) {
        throw new Error("Image prompt cannot be empty.");
    }

    try {
        const response = await ai.models.generateImages({
            model: 'imagen-3.0-generate-002',
            prompt: prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '1:1',
            },
        });
        
        if (!response.generatedImages || response.generatedImages.length === 0) {
            throw new Error("The AI did not return an image. It might be due to a safety policy violation.");
        }

        const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
        return `data:image/jpeg;base64,${base64ImageBytes}`;

    } catch (error) {
        console.error("Error generating image:", error);
        throw new Error("Failed to generate image. Please try a different prompt or check the service status.");
    }
};

export const extractTextFromImage = async (imageFile: File): Promise<string> => {
  if (!imageFile) {
    throw new Error("Please provide an image file.");
  }
  if (!imageFile.type.startsWith('image/')) {
    throw new Error("Invalid file type. Please upload an image.");
  }

  try {
    const imagePart = await fileToGenerativePart(imageFile);
    const textPart = { text: "Extract all text from this image. Provide only the text content, without any extra commentary or formatting." };
    
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [imagePart, textPart] },
    });
    
    return response.text;
  } catch (error) {
    console.error("Error extracting text from image:", error);
    throw new Error("Failed to extract text. The AI service may be busy or the image may not contain readable text.");
  }
};

export const extractTextFromFile = async (file: File): Promise<string> => {
    if (!file) {
      throw new Error("Please provide a file.");
    }
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      throw new Error("Invalid file type. Please upload an image or a PDF.");
    }
  
    try {
      const filePart = await fileToGenerativePart(file);
      const textPart = { text: "You are a highly accurate OCR engine. Extract all text from this document. Provide only the text content, without any extra commentary, formatting, or explanations." };
      
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [filePart, textPart] },
      });
      
      return response.text;
    } catch (error) {
      console.error("Error extracting text from file:", error);
      throw new Error("Failed to extract text. The AI service may be busy or the document may not contain readable text.");
    }
  };
  
  export const translateText = async (text: string, targetLanguage: string): Promise<string> => {
    if (!text.trim()) {
      return ""; // Return empty string if no text to translate
    }
    try {
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Translate the following text to ${targetLanguage}. Provide only the translated text, without any additional comments or explanations.\n\n---\n\n${text}`,
        config: {
          thinkingConfig: { thinkingBudget: 0 }
        }
      });
      return response.text;
    } catch (error) {
      console.error("Error translating text:", error);
      throw new Error(`Failed to translate text to ${targetLanguage}. The AI service may be busy or unavailable.`);
    }
  };

export const removeImageBackground = async (imageFile: File): Promise<string> => {
  if (!imageFile) {
    throw new Error("Please provide an image file.");
  }
  if (!imageFile.type.startsWith('image/')) {
    throw new Error("Invalid file type. Please upload an image.");
  }

  try {
    const blob = await removeBackground(imageFile, {
        output: {
            format: 'image/png' // to preserve transparency
        }
    });
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("Error removing background:", error);
    throw new Error("Failed to remove background. The image might be unsupported or corrupted.");
  }
};