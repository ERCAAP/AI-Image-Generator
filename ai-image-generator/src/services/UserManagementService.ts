import { User, UserRecoveryData } from '../types/user';
import { DeviceFingerprintService } from './DeviceFingerprintService';
import { FirebaseService } from './FirebaseService';
import { SecureStorageService } from './SecureStorageService';

export class UserManagementService {
  private static currentUser: User | null = null;
  private static isInitialized = false;

  /**
   * Initialize user management system
   * Implements 3-stage fallback recovery system
   */
  static async initialize(): Promise<User> {
    if (this.isInitialized && this.currentUser) {
      return this.currentUser;
    }

    try {
      console.log('🔄 Initializing User Management System...');
      
      // Stage 1: Try to recover user with persistent ID
      const user = await this.recoverUserWithPersistentId();
      if (user) {
        console.log('✅ User recovered with persistent ID');
        this.currentUser = user;
        this.isInitialized = true;
        return user;
      }

      // Stage 2: Try to recover with device fingerprint
      const userByFingerprint = await this.recoverUserWithFingerprint();
      if (userByFingerprint) {
        console.log('✅ User recovered with device fingerprint');
        this.currentUser = userByFingerprint;
        this.isInitialized = true;
        return userByFingerprint;
      }

      // Stage 3: Try to recover with Firebase UID
      const userByFirebase = await this.recoverUserWithFirebaseUID();
      if (userByFirebase) {
        console.log('✅ User recovered with Firebase UID');
        this.currentUser = userByFirebase;
        this.isInitialized = true;
        return userByFirebase;
      }

      // Stage 4: Create new user
      console.log('🆕 Creating new user...');
      const newUser = await this.createNewUser();
      this.currentUser = newUser;
      this.isInitialized = true;
      return newUser;

    } catch (error) {
      console.error('❌ Failed to initialize user management:', error);
      
      // Create a fallback user to prevent app crash
      return await this.createFallbackUser();
    }
  }

  /**
   * Create a guaranteed fallback user that will always work
   */
  private static async createFallbackUser(): Promise<User> {
    try {
      console.log('🔄 Creating fallback user for offline functionality...');
      
      let persistentId: string;
      try {
        persistentId = await SecureStorageService.getPersistentId();
      } catch (error) {
        console.warn('⚠️ Could not get persistent ID, generating new one:', error);
        persistentId = 'fallback-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
      }
      
      const fallbackUser: User = {
        id: persistentId,
        firebaseUID: undefined,
        deviceId: 'offline-device',
        hardwareFingerprint: 'offline-fingerprint',
        credits: 3, // Limited credits for offline mode
        isPremium: false,
        createdAt: Date.now(),
        lastActiveAt: Date.now(),
        settings: {
          language: 'tr',
          notifications: true,
          autoSave: true,
          quality: 'medium'
        }
      };
      
      this.currentUser = fallbackUser;
      this.isInitialized = true;
      
      // Try to save locally, but don't fail if it doesn't work
      try {
        await SecureStorageService.storeUserData(fallbackUser);
      } catch (storageError) {
        console.warn('⚠️ Could not save fallback user to storage:', storageError);
      }
      
      console.log('✅ Fallback user created, app can continue with limited functionality');
      return fallbackUser;
      
    } catch (fallbackError) {
      console.error('❌ Failed to create fallback user:', fallbackError);
      
      // Last resort: create minimal in-memory user
      const emergencyUser: User = {
        id: 'emergency-' + Date.now(),
        firebaseUID: undefined,
        deviceId: 'emergency-device',
        hardwareFingerprint: 'emergency-fingerprint',
        credits: 1, // Minimal credits
        isPremium: false,
        createdAt: Date.now(),
        lastActiveAt: Date.now(),
        settings: {
          language: 'tr',
          notifications: true,
          autoSave: true,
          quality: 'medium'
        }
      };
      
      this.currentUser = emergencyUser;
      this.isInitialized = true;
      
      console.log('🚨 Emergency user created - app will have very limited functionality');
      return emergencyUser;
    }
  }

  /**
   * Stage 1: Recover user with persistent ID
   */
  private static async recoverUserWithPersistentId(): Promise<User | null> {
    try {
      const persistentId = await SecureStorageService.getPersistentId();
      if (!persistentId) return null;

      console.log('🔍 Attempting recovery with persistent ID:', persistentId);
      
      // Add timeout for this recovery stage
      const timeoutPromise = new Promise<null>((resolve) => {
        setTimeout(() => {
          console.warn('⚠️ Persistent ID recovery timeout');
          resolve(null);
        }, 10000); // 10 second timeout for recovery
      });
      
      const response = await Promise.race([
        FirebaseService.getUserByPersistentId(persistentId),
        timeoutPromise
      ]);
      
      if (response && response.success && response.data) {
        // Update local storage with recovered data
        await this.updateLocalStorage(response.data);
        return response.data;
      }

      return null;
    } catch (error) {
      console.error('Error in persistent ID recovery:', error);
      return null;
    }
  }

  /**
   * Stage 2: Recover user with device fingerprint
   */
  private static async recoverUserWithFingerprint(): Promise<User | null> {
    try {
      const currentFingerprint = await DeviceFingerprintService.generateFingerprint();
      const storedFingerprintString = await SecureStorageService.getDeviceFingerprint();
      
      console.log('🔍 Attempting recovery with device fingerprint');
      
      // Add timeout for this recovery stage
      const timeoutPromise = new Promise<null>((resolve) => {
        setTimeout(() => {
          console.warn('⚠️ Fingerprint recovery timeout');
          resolve(null);
        }, 10000);
      });
      
      const response = await Promise.race([
        FirebaseService.getUserByFingerprint(currentFingerprint.fingerprint),
        timeoutPromise
      ]);
      
      if (response && response.success && response.data) {
        // Verify fingerprint similarity
        const storedFingerprint = storedFingerprintString ? 
          JSON.parse(storedFingerprintString) : null;
        
        if (storedFingerprint) {
          const comparison = DeviceFingerprintService.compareFingerprints(
            currentFingerprint, 
            storedFingerprint
          );
          
          if (comparison.isMatch) {
            await this.updateLocalStorage(response.data);
            return response.data;
          }
        } else {
          // First time with this device, save fingerprint
          try {
            await SecureStorageService.storeDeviceFingerprint(
              JSON.stringify(currentFingerprint)
            );
          } catch (storageError) {
            console.warn('⚠️ Could not store device fingerprint:', storageError);
          }
          await this.updateLocalStorage(response.data);
          return response.data;
        }
      }

      return null;
    } catch (error) {
      console.error('Error in fingerprint recovery:', error);
      return null;
    }
  }

  /**
   * Stage 3: Recover user with Firebase UID
   */
  private static async recoverUserWithFirebaseUID(): Promise<User | null> {
    try {
      // Add timeout for this recovery stage
      const timeoutPromise = new Promise<null>((resolve) => {
        setTimeout(() => {
          console.warn('⚠️ Firebase UID recovery timeout');
          resolve(null);
        }, 15000); // Longer timeout for auth operations
      });
      
      // Try to sign in anonymously first
      const authResult = await Promise.race([
        FirebaseService.signInAnonymously(),
        timeoutPromise
      ]);
      
      if (!authResult || !authResult.success || !authResult.data?.uid) {
        console.warn('⚠️ Firebase anonymous sign-in failed or timed out');
        return null;
      }

      console.log('🔍 Attempting recovery with Firebase UID:', authResult.data.uid);
      
      const response = await Promise.race([
        FirebaseService.getUserByFirebaseUID(authResult.data.uid),
        timeoutPromise
      ]);
      
      if (response && response.success && response.data) {
        await this.updateLocalStorage(response.data);
        return response.data;
      }

      return null;
    } catch (error) {
      console.error('Error in Firebase UID recovery:', error);
      return null;
    }
  }

  /**
   * Create a completely new user
   */
  private static async createNewUser(): Promise<User> {
    try {
      // Generate required IDs
      const persistentId = await SecureStorageService.getPersistentId();
      const deviceFingerprint = await DeviceFingerprintService.generateFingerprint();
      
      // Sign in anonymously to Firebase with timeout
      const authResult = await Promise.race([
        FirebaseService.signInAnonymously(),
        new Promise<any>((_, reject) => 
          setTimeout(() => reject(new Error('Auth timeout')), 12000)
        )
      ]);
      
      if (!authResult.success || !authResult.data?.uid) {
        throw new Error('Failed to create Firebase anonymous user');
      }

      const newUser: User = {
        id: persistentId,
        firebaseUID: authResult.data.uid,
        deviceId: deviceFingerprint.deviceId,
        hardwareFingerprint: deviceFingerprint.fingerprint,
        credits: 10, // Initial credits
        isPremium: false,
        createdAt: Date.now(),
        lastActiveAt: Date.now(),
        settings: {
          language: 'tr',
          notifications: true,
          autoSave: true,
          quality: 'medium'
        }
      };

      // Save to backend with timeout
      const saveResponse = await Promise.race([
        FirebaseService.createUser(newUser),
        new Promise<any>((_, reject) => 
          setTimeout(() => reject(new Error('Save timeout')), 15000)
        )
      ]);
      
      if (!saveResponse.success) {
        throw new Error('Failed to save user to backend');
      }

      // Save to local storage
      await this.updateLocalStorage(newUser);
      await SecureStorageService.storeDeviceFingerprint(JSON.stringify(deviceFingerprint));
      await SecureStorageService.storeFirebaseUID(authResult.data.uid);

      console.log('✅ New user created successfully');
      return newUser;

    } catch (error) {
      console.error('Error creating new user:', error);
      throw error;
    }
  }

  /**
   * Update local storage with user data
   */
  private static async updateLocalStorage(user: User): Promise<void> {
    try {
      await Promise.all([
        SecureStorageService.storeUserData(user),
        SecureStorageService.backupCredits(user.credits),
        user.firebaseUID ? SecureStorageService.storeFirebaseUID(user.firebaseUID) : Promise.resolve()
      ]);
    } catch (error) {
      console.error('Error updating local storage:', error);
    }
  }

  /**
   * Get current user
   */
  static getCurrentUser(): User | null {
    return this.currentUser;
  }

  /**
   * Update user credits with collision-safe operations
   */
  static async updateCredits(amount: number, operation: 'add' | 'subtract', reason: string): Promise<boolean> {
    if (!this.currentUser) {
      throw new Error('No current user found');
    }

    try {
      const response = await FirebaseService.updateUserCredits(
        this.currentUser.id,
        amount,
        operation,
        reason
      );

      if (response.success && response.data) {
        // Update local user
        this.currentUser.credits = response.data.credits;
        this.currentUser.lastActiveAt = Date.now();
        
        // Update local storage
        await this.updateLocalStorage(this.currentUser);
        
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error updating credits:', error);
      return false;
    }
  }

  /**
   * Sync user data with backend
   */
  static async syncUserData(): Promise<boolean> {
    if (!this.currentUser) return false;

    try {
      const response = await FirebaseService.getUserById(this.currentUser!.id);
             if (response.success && response.data) {
         this.currentUser = response.data;
         await this.updateLocalStorage(this.currentUser!);
         return true;
       }
       return false;
     } catch (error) {
       console.error('Error syncing user data:', error);
       return false;
     }
   }

   /**
    * Update user settings
    */
   static async updateSettings(settings: Partial<User['settings']>): Promise<boolean> {
     if (!this.currentUser) return false;

     try {
       const updatedUser = {
         ...this.currentUser,
         settings: { ...this.currentUser.settings, ...settings },
         lastActiveAt: Date.now()
       };

       const response = await FirebaseService.updateUser(updatedUser);
       if (response.success && response.data) {
         this.currentUser = response.data;
         await this.updateLocalStorage(this.currentUser!);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating settings:', error);
      return false;
    }
  }

  /**
   * Force logout and clear all data
   */
  static async logout(): Promise<void> {
    try {
      await FirebaseService.signOut();
      await SecureStorageService.clearAll();
      this.currentUser = null;
      this.isInitialized = false;
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }

  /**
   * Get recovery data for debugging
   */
  static async getRecoveryData(): Promise<UserRecoveryData | null> {
    try {
      const [persistentId, fingerprint, firebaseUID, creditsBackup] = await Promise.all([
        SecureStorageService.getPersistentId(),
        SecureStorageService.getDeviceFingerprint(),
        SecureStorageService.getFirebaseUID(),
        SecureStorageService.getBackedUpCredits()
      ]);

      return {
        persistentId,
        deviceFingerprint: fingerprint || 'none',
        firebaseUID: firebaseUID || undefined,
        lastKnownCredits: creditsBackup?.credits || 0,
        recoveryMethods: [
          persistentId ? 'persistent_id' : null,
          fingerprint ? 'device_fingerprint' : null,
          firebaseUID ? 'firebase_uid' : null
        ].filter(Boolean) as any[]
      };
    } catch (error) {
      console.error('Error getting recovery data:', error);
      return null;
    }
  }

  /**
   * Emergency credit recovery from local backup
   */
  static async emergencyCreditRecovery(): Promise<boolean> {
    if (!this.currentUser) return false;

    try {
      const creditsBackup = await SecureStorageService.getBackedUpCredits();
      if (creditsBackup && creditsBackup.credits > this.currentUser.credits) {
        // Use the higher credit amount
        const success = await this.updateCredits(
          creditsBackup.credits - this.currentUser.credits,
          'add',
          'Emergency recovery from local backup'
        );
        
        if (success) {
          console.log('✅ Emergency credit recovery successful');
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error in emergency credit recovery:', error);
      return false;
    }
  }
}