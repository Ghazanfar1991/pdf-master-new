
import React, { useState, useCallback, useEffect } from 'react';
import { generateImage } from '../services/huggingFaceService';

interface StoredImage {
  id: string;
  prompt: string;
  style: string;
  imageUrl: string;
  timestamp: number;
}

interface ImageGeneratorProps {
  onBack: () => void;
}

const ImageGenerator: React.FC<ImageGeneratorProps> = ({ onBack }) => {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('realistic');
  const [dimensions, setDimensions] = useState('1024x768');
  const [imageUrl, setImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [storedImages, setStoredImages] = useState<StoredImage[]>([]);

  // Style options with clearer descriptions
  const styleOptions = [
    { value: 'realistic', label: 'Realistic', description: 'Photorealistic images' },
    { value: 'anime', label: 'Anime', description: 'Japanese animation style' },
    { value: 'cartoon', label: 'Cartoon', description: 'Western cartoon style' },
    { value: 'oil painting', label: 'Oil Painting', description: 'Classic oil painting style' },
    { value: 'watercolor', label: 'Watercolor', description: 'Soft watercolor painting' },
    { value: 'sketch', label: 'Sketch', description: 'Pencil or pen sketch' },
    { value: 'digital art', label: 'Digital Art', description: 'Modern digital artwork' },
    { value: 'photography', label: 'Photography', description: 'Photographic style' },
    { value: '3d render', label: '3D Render', description: 'Three-dimensional rendering' },
    { value: 'cyberpunk', label: 'Cyberpunk', description: 'Futuristic neon style' },
  ];

  // Dimension options with clearer labels for social media and common uses
  const dimensionOptions = [
    { value: '1024x768', label: 'Landscape (4:3)', size: '1024×768 - Standard Desktop' },
    { value: '768x1024', label: 'Portrait (3:4)', size: '768×1024 - Standard Portrait' },
    { value: '1024x1024', label: 'Square (1:1)', size: '1024×1024 - Social Media, Instagram' },
    { value: '1280x720', label: 'Widescreen (16:9)', size: '1280×720 - HD Video, YouTube' },
    { value: '1920x1080', label: 'Full HD (16:9)', size: '1920×1080 - Full HD Video' },
    { value: '1200x630', label: 'Facebook Post', size: '1200×630 - Facebook, LinkedIn' },
    { value: '1080x1080', label: 'Instagram Post', size: '1080×1080 - Instagram, Square' },
    { value: '1080x1350', label: 'Instagram Story', size: '1080×1350 - Instagram Stories' },
    { value: '1200x628', label: 'Twitter Post', size: '1200×628 - Twitter, X' },
    { value: '800x600', label: 'Standard (4:3)', size: '800×600 - Basic Web Use' },
  ];

  // Load stored images from localStorage on component mount
  useEffect(() => {
    const loadStoredImages = () => {
      try {
        const stored = localStorage.getItem('generatedImages');
        if (stored) {
          const parsed = JSON.parse(stored);
          // Filter out images older than 3 days (259200000 ms)
          const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000;
          const recentImages = parsed.filter((img: StoredImage) => img.timestamp > threeDaysAgo);
          setStoredImages(recentImages);
          
          // Update localStorage with only recent images
          if (recentImages.length !== parsed.length) {
            localStorage.setItem('generatedImages', JSON.stringify(recentImages));
          }
        }
      } catch (err) {
        console.error('Error loading stored images:', err);
      }
    };

    loadStoredImages();
  }, []);

  // Save image to localStorage
  const saveImageToStorage = useCallback((imageUrl: string, prompt: string, style: string) => {
    try {
      const newImage: StoredImage = {
        id: Date.now().toString(),
        prompt,
        style,
        imageUrl,
        timestamp: Date.now()
      };

      // Get existing images
      const stored = localStorage.getItem('generatedImages');
      const existingImages: StoredImage[] = stored ? JSON.parse(stored) : [];
      
      // Filter out images older than 3 days
      const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000;
      const recentImages = existingImages.filter(img => img.timestamp > threeDaysAgo);
      
      // Add new image and keep only the most recent 10 images
      const updatedImages = [newImage, ...recentImages].slice(0, 10);
      
      // Save to localStorage
      localStorage.setItem('generatedImages', JSON.stringify(updatedImages));
      setStoredImages(updatedImages);
    } catch (err) {
      console.error('Error saving image to storage:', err);
    }
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!prompt) {
      setError('Please enter a prompt to generate an image.');
      return;
    }
    setError('');
    setIsLoading(true);
    setImageUrl('');
    try {
      // Enhance the prompt with style information
      const enhancedPrompt = `${prompt}, ${style} style`;
      const result = await generateImage(enhancedPrompt);
      if (result.startsWith('data:')) {
        setImageUrl(result);
        // Save to localStorage
        saveImageToStorage(result, prompt, style);
      } else {
        setImageUrl(result);
        // Save to localStorage
        saveImageToStorage(result, prompt, style);
      }
    } catch (err: any) {
      console.error("Image generation error:", err);
      setError(err.message || 'An unknown error occurred. Please try again with a different prompt.');
    } finally {
      setIsLoading(false);
    }
  }, [prompt, style, saveImageToStorage]);

  const handleDownload = () => {
    if (!imageUrl) return;
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `generated-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openModal = () => {
    if (imageUrl) setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const viewStoredImage = (imageUrl: string) => {
    setImageUrl(imageUrl);
  };

  const deleteStoredImage = (id: string) => {
    try {
      const stored = localStorage.getItem('generatedImages');
      if (stored) {
        const existingImages: StoredImage[] = JSON.parse(stored);
        const updatedImages = existingImages.filter(img => img.id !== id);
        localStorage.setItem('generatedImages', JSON.stringify(updatedImages));
        setStoredImages(updatedImages);
      }
    } catch (err) {
      console.error('Error deleting stored image:', err);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in">
      <button onClick={onBack} className="flex items-center text-sm font-medium text-slate-600 hover:text-indigo-600 mb-6 dark:text-slate-400 dark:hover:text-indigo-400">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Tools
      </button>

      <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 dark:bg-slate-800">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">AI Image Generator</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6">Create stunning images from your imagination with AI.</p>


        {/* Prompt Input */}
        <div className="mb-6">
          <label htmlFor="prompt" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Image Description
          </label>
          <input
            id="prompt"
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., A majestic lion in the savannah at sunset"
            className="w-full p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400"
            disabled={isLoading}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleGenerate();
              }
            }}
          />
        </div>

        {/* Style and Dimensions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="style" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Art Style
            </label>
            <select
              id="style"
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              disabled={isLoading}
            >
              {styleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {styleOptions.find(opt => opt.value === style)?.description}
            </p>
          </div>

          <div>
            <label htmlFor="dimensions" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Image Dimensions
            </label>
            <select
              id="dimensions"
              value={dimensions}
              onChange={(e) => setDimensions(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              disabled={isLoading}
            >
              {dimensionOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {dimensionOptions.find(opt => opt.value === dimensions)?.size}
            </p>
          </div>
        </div>

        {/* Generate Button */}
        <div className="flex justify-center">
          <button
            onClick={handleGenerate}
            disabled={isLoading || !prompt}
            className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-300 disabled:cursor-not-allowed dark:disabled:bg-indigo-800 dark:disabled:text-slate-400 flex items-center justify-center w-full sm:w-auto"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : (
              <>
                <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Generate Image
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <div className="flex items-start">
              <svg className="h-5 w-5 text-red-500 dark:text-red-400 mt-0.5 mr-2 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Image Generation Failed</h3>
                <p className="mt-1 text-sm text-red-700 dark:text-red-300">{error}</p>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                  <p>Try these solutions:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Check your internet connection</li>
                    <li>Try a simpler or different prompt</li>
                    <li>Wait a moment and try again (rate limit)</li>
                    <li>Verify your Hugging Face API key is valid</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Generated Image Preview */}
        {imageUrl && !isLoading && (
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Generated Image</h3>
            <div className="flex flex-col items-center">
              <div 
                className="relative rounded-lg overflow-hidden cursor-pointer shadow-lg hover:shadow-xl transition-shadow duration-300"
                onClick={openModal}
              >
                <img 
                  src={imageUrl} 
                  alt={prompt} 
                  className="max-w-full h-auto max-h-[500px] object-contain rounded-lg"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                  <div className="opacity-0 hover:opacity-100 text-white font-semibold flex items-center bg-black bg-opacity-50 px-4 py-2 rounded-lg">
                    <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Click to view larger
                  </div>
                </div>
              </div>
              
              <div className="mt-4 flex gap-3">
                <button
                  onClick={openModal}
                  className="px-4 py-2 bg-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 flex items-center"
                >
                  <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  View Larger
                </button>
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 flex items-center"
                >
                  <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stored Images Section */}
        {storedImages.length > 0 && (
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Recent Images</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Stored for 3 days • {storedImages.length} images
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {storedImages.map((image) => (
                <div key={image.id} className="relative group">
                  <div 
                    className="aspect-square rounded-lg overflow-hidden cursor-pointer shadow hover:shadow-md transition-shadow"
                    onClick={() => viewStoredImage(image.imageUrl)}
                  >
                    <img 
                      src={image.imageUrl} 
                      alt={image.prompt} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 text-white text-center p-2">
                        <p className="text-xs font-medium truncate">{image.prompt}</p>
                        <p className="text-xs mt-1 opacity-75">{image.style}</p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteStoredImage(image.id);
                    }}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    aria-label="Delete image"
                  >
                    <svg className="h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700 flex justify-center">
            <div className="w-full max-w-lg bg-slate-200 rounded-lg animate-pulse dark:bg-slate-700 flex flex-col justify-center items-center text-center p-8">
              <svg className="h-16 w-16 text-slate-400 dark:text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
              <p className="mt-4 text-lg font-medium text-slate-700 dark:text-slate-300">Creating your masterpiece...</p>
              <p className="mt-2 text-slate-500 dark:text-slate-400">This may take 10-30 seconds</p>
            </div>
          </div>
        )}
      </div>

      {/* Modal for Large Image View */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4 overflow-hidden">
          <div className="relative max-w-full max-h-full flex items-center justify-center">
            <button
              onClick={closeModal}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 focus:outline-none"
            >
              <svg className="h-10 w-10" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="max-h-[90vh] max-w-[90vw] flex items-center justify-center">
              <img 
                src={imageUrl} 
                alt={prompt} 
                className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageGenerator;
