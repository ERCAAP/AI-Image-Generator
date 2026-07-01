export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export interface ReplicateModel {
  id: string;
  name: string;
  description: string;
  category: string;
  creditsPerGeneration: number;
  maxPromptLength: number;
  supportedFormats: string[];
  isActive: boolean;
}

export interface GenerationResult {
  id: string;
  imageUrl: string;
  prompt: string;
  model: string;
  metadata: Record<string, any>;
  timestamp: number;
} 