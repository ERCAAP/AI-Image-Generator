export interface User {
  id: string;
  firebaseUID?: string;
  deviceId: string;
  hardwareFingerprint: string;
  credits: number;
  isPremium: boolean;
  createdAt: number;
  lastActiveAt: number;
  settings: UserSettings;
}

export interface UserSettings {
  language: string;
  notifications: boolean;
  autoSave: boolean;
  quality: 'low' | 'medium' | 'high';
}

export interface DeviceFingerprint {
  deviceId: string;
  brand: string;
  model: string;
  systemName: string;
  systemVersion: string;
  buildNumber: string;
  bundleId: string;
  uniqueId: string;
  fingerprint: string;
}

export interface CreditTransaction {
  id: string;
  userId: string;
  amount: number;
  type: 'earn' | 'spend' | 'refund' | 'purchase';
  reason: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface UserRecoveryData {
  persistentId: string;
  deviceFingerprint: string;
  firebaseUID?: string;
  lastKnownCredits: number;
  recoveryMethods: ('persistent_id' | 'device_fingerprint' | 'firebase_uid')[];
}

export interface GenerationRequest {
  id: string;
  userId: string;
  type: 'text-to-image' | 'image-to-image';
  prompt: string;
  model: string;
  settings: Record<string, any>;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: string;
  creditsUsed: number;
  createdAt: number;
} 