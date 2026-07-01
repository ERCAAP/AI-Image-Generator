import cors from 'cors';
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import Replicate from 'replicate';
import { v4 as uuidv4 } from 'uuid';
import fetch from 'node-fetch';

// Initialize Firebase Admin
admin.initializeApp({
  projectId: 'ai-imagegenerator-f5742',
  storageBucket: 'ai-imagegenerator-f5742.firebasestorage.app'
});
const db = admin.firestore();
const bucket = admin.storage().bucket();

// Initialize CORS
const corsHandler = cors({ origin: true });

// Initialize Replicate with API key from environment
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_KEY || functions.config().replicate?.api_key,
});

// Types
interface User {
  id: string;
  firebaseUID?: string;
  deviceId: string;
  hardwareFingerprint: string;
  credits: number;
  isPremium: boolean;
  createdAt: number;
  lastActiveAt: number;
  settings: {
    language: string;
    notifications: boolean;
    autoSave: boolean;
    quality: 'low' | 'medium' | 'high';
  };
}

interface CreditTransaction {
  id: string;
  userId: string;
  amount: number;
  type: 'earn' | 'spend' | 'refund' | 'purchase';
  reason: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

// Helper functions (currently unused but kept for future use)
// const validateAuth = (context: functions.https.CallableContext) => {
//   if (!context.auth) {
//     throw new functions.https.HttpsError(
//       'unauthenticated',
//       'The function must be called while authenticated.'
//     );
//   }
//   return context.auth.uid;
// };

// const getUser = async (userId: string): Promise<User | null> => {
//   try {
//     const userDoc = await db.collection('users').doc(userId).get();
//     if (!userDoc.exists) {
//       return null;
//     }
//     return userDoc.data() as User;
//   } catch (error) {
//     console.error('Error getting user:', error);
//     return null;
//   }
// };

// Update user credits with atomic transaction
export const updateUserCredits = functions.https.onCall(async (data, context) => {
  try {
    const { userId, amount, operation, reason } = data;
    
    if (!userId || typeof amount !== 'number' || !operation || !reason) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Missing required parameters: userId, amount, operation, reason'
      );
    }

    if (operation !== 'add' && operation !== 'subtract') {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Operation must be either "add" or "subtract"'
      );
    }

    if (amount <= 0) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Amount must be positive'
      );
    }

    // Use Firestore transaction for atomic update
    const result = await db.runTransaction(async (transaction) => {
      const userRef = db.collection('users').doc(userId);
      const userDoc = await transaction.get(userRef);
      
      if (!userDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'User not found');
      }

      const user = userDoc.data() as User;
      let newCredits = user.credits;

      if (operation === 'add') {
        newCredits += amount;
      } else {
        newCredits -= amount;
        if (newCredits < 0) {
          throw new functions.https.HttpsError(
            'failed-precondition',
            'Insufficient credits'
          );
        }
      }

      // Update user credits
      transaction.update(userRef, {
        credits: newCredits,
        lastActiveAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Create credit transaction record
      const transactionData: CreditTransaction = {
        id: db.collection('creditTransactions').doc().id,
        userId,
        amount,
        type: operation === 'add' ? 'earn' : 'spend',
        reason,
        timestamp: Date.now(),
      };

      transaction.set(
        db.collection('creditTransactions').doc(transactionData.id),
        transactionData
      );

      return { credits: newCredits };
    });

    return result;
  } catch (error) {
    console.error('Error updating credits:', error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError('internal', 'Failed to update credits');
  }
});

// Generate image using Replicate API
export const generateImage = functions
  .runWith({
    timeoutSeconds: 540, // 9 minutes
    memory: '1GB',
  })
  .https.onCall(async (data, context) => {
    try {
      const { prompt, model, settings } = data;
      
      if (!prompt || typeof prompt !== 'string') {
        throw new functions.https.HttpsError(
          'invalid-argument',
          'Prompt is required and must be a string'
        );
      }

      if (!model || typeof model !== 'string') {
        throw new functions.https.HttpsError(
          'invalid-argument',
          'Model is required and must be a string'
        );
      }

      // Validate prompt length
      if (prompt.length > 1000) {
        throw new functions.https.HttpsError(
          'invalid-argument',
          'Prompt too long (max 1000 characters)'
        );
      }

      // Default model mapping
      const modelMapping: Record<string, string> = {
        'text-to-image': 'stability-ai/stable-diffusion:27b93a2413e7f36cd83da926f3656280b2931564ff050bf9575f1fdf9bcd7478',
        'image-to-image': 'tencentarc/gfpgan:26a2e25ab48d38856ddd2d1fec4d1b48e5d8e38b7f03d3bc2c42d8f4b0c8b3c8',
        'image-enhancer': 'tencentarc/gfpgan:26a2e25ab48d38856ddd2d1fec4d1b48e5d8e38b7f03d3bc2c42d8f4b0c8b3c8',
      };

      const replicateModel = modelMapping[model] || modelMapping['text-to-image'];

      // Prepare input based on generation type
      let input: any = {
        prompt: prompt,
        num_outputs: 1,
        guidance_scale: 7.5,
        num_inference_steps: 50,
        ...settings,
      };

      // For image-to-image, add image input
      if (settings?.type === 'image-to-image' && settings?.imageUrl) {
        input.image = settings.imageUrl;
        input.strength = settings.strength || 0.8;
      }

      console.log('Generating image with Replicate:', {
        model: replicateModel,
        prompt: prompt.substring(0, 100) + '...',
      });

      // Generate image using Replicate
      const output = await replicate.run(replicateModel as `${string}/${string}`, { input });

      // Handle different output formats
      let imageUrl: string;
      if (Array.isArray(output)) {
        imageUrl = output[0];
      } else if (typeof output === 'string') {
        imageUrl = output;
      } else {
        throw new Error('Unexpected output format from Replicate');
      }

      const result = {
        imageUrl,
        metadata: {
          model: replicateModel,
          prompt,
          settings,
          generatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
      };

      console.log('Image generation successful');
      return result;

    } catch (error) {
      console.error('Error generating image:', error);
      
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      
      // Handle Replicate-specific errors
      const errorMessage = (error as Error).message;
      if (errorMessage?.includes('rate limit')) {
        throw new functions.https.HttpsError(
          'resource-exhausted',
          'Rate limit exceeded. Please try again later.'
        );
      }
      
      if (errorMessage?.includes('content policy')) {
        throw new functions.https.HttpsError(
          'invalid-argument',
          'Content violates policy. Please modify your prompt.'
        );
      }

      throw new functions.https.HttpsError(
        'internal',
        'Failed to generate image. Please try again.'
      );
    }
  });

// Get available models from Firestore
export const getModels = functions.https.onCall(async (data, context) => {
  try {
    const modelsSnapshot = await db
      .collection('models')
      .where('isActive', '==', true)
      .orderBy('category')
      .get();

    const models = modelsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return { models };
  } catch (error) {
    console.error('Error getting models:', error);
    throw new functions.https.HttpsError('internal', 'Failed to get models');
  }
});

// Initialize default models on first deployment
export const initializeModels = functions.https.onCall(async (data, context) => {
  try {
    // Only allow this in development or by admin
    if (!context.auth || context.auth.token.admin !== true) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Only admins can initialize models'
      );
    }

    const defaultModels = [
      {
        id: 'stable-diffusion',
        name: 'Stable Diffusion',
        description: 'High-quality text-to-image generation',
        category: 'general',
        creditsPerGeneration: 1,
        maxPromptLength: 1000,
        supportedFormats: ['text-to-image'],
        isActive: true,
      },
      {
        id: 'dall-e-3',
        name: 'DALL-E 3',
        description: 'Advanced AI image generation',
        category: 'premium',
        creditsPerGeneration: 2,
        maxPromptLength: 1000,
        supportedFormats: ['text-to-image'],
        isActive: true,
      },
      {
        id: 'image-enhancer',
        name: 'Image Enhancer',
        description: 'Enhance and restore images',
        category: 'enhancement',
        creditsPerGeneration: 1,
        maxPromptLength: 500,
        supportedFormats: ['image-to-image'],
        isActive: true,
      },
    ];

    const batch = db.batch();
    defaultModels.forEach(model => {
      const modelRef = db.collection('models').doc(model.id);
      batch.set(modelRef, model);
    });

    await batch.commit();
    return { success: true, message: 'Models initialized successfully' };
  } catch (error) {
    console.error('Error initializing models:', error);
    throw new functions.https.HttpsError('internal', 'Failed to initialize models');
  }
});

// Upload image to Storage
export const uploadImage = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'The function must be called while authenticated.'
      );
    }

    const { imageData, fileName, folder = 'generated-images' } = data;
    
    if (!imageData || !fileName) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'imageData and fileName are required'
      );
    }

    // Generate unique filename
    const uniqueFileName = `${folder}/${context.auth.uid}/${uuidv4()}_${fileName}`;
    const file = bucket.file(uniqueFileName);

    // Convert base64 to buffer if needed
    let buffer: Buffer;
    if (typeof imageData === 'string') {
      // Remove data URL prefix if present
      const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
      buffer = Buffer.from(base64Data, 'base64');
    } else {
      buffer = Buffer.from(imageData);
    }

    // Upload file
    await file.save(buffer, {
      metadata: {
        contentType: 'image/jpeg',
        metadata: {
          uploadedBy: context.auth.uid,
          uploadedAt: new Date().toISOString(),
        },
      },
    });

    // Make file publicly readable
    await file.makePublic();

    // Get public URL
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${uniqueFileName}`;

    return {
      success: true,
      url: publicUrl,
      fileName: uniqueFileName,
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new functions.https.HttpsError('internal', 'Failed to upload image');
  }
});

// Download and save image from URL to Storage
export const saveImageFromUrl = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'The function must be called while authenticated.'
      );
    }

    const { imageUrl, fileName, folder = 'generated-images' } = data;
    
    if (!imageUrl || !fileName) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'imageUrl and fileName are required'
      );
    }

    // Download image from URL
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    const imageBuffer = await response.buffer();
    
    // Generate unique filename
    const uniqueFileName = `${folder}/${context.auth.uid}/${uuidv4()}_${fileName}`;
    const file = bucket.file(uniqueFileName);

    // Upload file
    await file.save(imageBuffer, {
      metadata: {
        contentType: response.headers.get('content-type') || 'image/jpeg',
        metadata: {
          uploadedBy: context.auth.uid,
          uploadedAt: new Date().toISOString(),
          originalUrl: imageUrl,
        },
      },
    });

    // Make file publicly readable
    await file.makePublic();

    // Get public URL
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${uniqueFileName}`;

    return {
      success: true,
      url: publicUrl,
      fileName: uniqueFileName,
    };
  } catch (error) {
    console.error('Error saving image from URL:', error);
    throw new functions.https.HttpsError('internal', 'Failed to save image from URL');
  }
});

// Delete image from Storage
export const deleteImage = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'The function must be called while authenticated.'
      );
    }

    const { fileName } = data;
    
    if (!fileName) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'fileName is required'
      );
    }

    // Check if user owns the file (basic security check)
    if (!fileName.includes(context.auth.uid)) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'You can only delete your own files'
      );
    }

    const file = bucket.file(fileName);
    await file.delete();

    return {
      success: true,
      message: 'Image deleted successfully',
    };
  } catch (error) {
    console.error('Error deleting image:', error);
    throw new functions.https.HttpsError('internal', 'Failed to delete image');
  }
});

// Get user's uploaded images
export const getUserImages = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'The function must be called while authenticated.'
      );
    }

    const { folder = 'generated-images', limit = 50 } = data;
    const prefix = `${folder}/${context.auth.uid}/`;

    const [files] = await bucket.getFiles({
      prefix,
      maxResults: limit,
    });

    const images = files.map(file => ({
      name: file.name,
      url: `https://storage.googleapis.com/${bucket.name}/${file.name}`,
      metadata: file.metadata,
      created: file.metadata.timeCreated,
      updated: file.metadata.updated,
    }));

    return {
      success: true,
      images,
      count: images.length,
    };
  } catch (error) {
    console.error('Error getting user images:', error);
    throw new functions.https.HttpsError('internal', 'Failed to get user images');
  }
});

// Health check endpoint
export const healthCheck = functions.https.onRequest((request, response) => {
  corsHandler(request, response, () => {
    response.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    });
  });
});