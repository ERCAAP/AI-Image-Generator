import { useState } from 'react';
import { FirebaseService } from '../services/FirebaseService';
import { useAppStore } from '../store/appStore';
import { useUserStore } from '../store/userStore';
import { GenerationRequest } from '../types/user';

interface GenerationOptions {
  prompt: string;
  model: string;
  settings?: Record<string, any>;
  type: 'text-to-image' | 'image-to-image';
  imageUrl?: string; // For image-to-image
}

export function useImageGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { currentUser, addGeneration, updateGeneration } = useUserStore();
  const { setGenerating } = useAppStore();

  const generateImage = async (options: GenerationOptions): Promise<string | null> => {
    if (!currentUser) {
      setError('No user found');
      return null;
    }

    setIsGenerating(true);
    setGenerating(true);
    setError(null);

    try {
      // Create generation request
      const generationRequest: GenerationRequest = {
        id: `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: currentUser.id,
        type: options.type,
        prompt: options.prompt,
        model: options.model,
        settings: options.settings || {},
        status: 'pending',
        creditsUsed: 1, // This should be based on the model
        createdAt: Date.now()
      };

      // Add to local state
      addGeneration(generationRequest);

      // Generate image via Firebase Function
      const result = await FirebaseService.generateImage(
        options.prompt,
        options.model,
        {
          ...options.settings,
          type: options.type,
          imageUrl: options.imageUrl
        }
      );

      if (result.success && result.data) {
        // Update generation with result
        updateGeneration(generationRequest.id, {
          status: 'completed',
          result: result.data.imageUrl
        });

        // Save to backend
        await FirebaseService.saveGeneration({
          ...generationRequest,
          status: 'completed',
          result: result.data.imageUrl,
          metadata: result.data.metadata
        });

        return result.data.imageUrl;
      } else {
        // Update generation with error
        updateGeneration(generationRequest.id, {
          status: 'failed'
        });
        
        setError(result.error || 'Generation failed');
        return null;
      }

    } catch (error) {
      console.error('Error generating image:', error);
      setError('Generation failed');
      return null;
    } finally {
      setIsGenerating(false);
      setGenerating(false);
    }
  };

  const generateFromTemplate = async (template: any): Promise<string | null> => {
    return generateImage({
      prompt: template.prompt,
      model: template.model,
      settings: template.settings,
      type: 'text-to-image'
    });
  };

  const enhanceImage = async (imageUrl: string, prompt: string): Promise<string | null> => {
    return generateImage({
      prompt,
      model: 'image-enhancer', // Default enhancer model
      type: 'image-to-image',
      imageUrl
    });
  };

  const clearError = () => setError(null);

  return {
    // State
    isGenerating,
    error,
    
    // Actions
    generateImage,
    generateFromTemplate,
    enhanceImage,
    clearError
  };
} 