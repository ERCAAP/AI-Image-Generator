import { getAnalytics, isSupported } from 'firebase/analytics';
import { initializeApp } from 'firebase/app';
import { Auth, User as FirebaseUser, connectAuthEmulator, createUserWithEmailAndPassword, getAuth, initializeAuth, onAuthStateChanged, signInAnonymously, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { Firestore, addDoc, collection, connectFirestoreEmulator, doc, getDoc, getDocs, getFirestore, limit, onSnapshot, orderBy, query, setDoc, updateDoc, where, writeBatch } from 'firebase/firestore';
import { Functions, connectFunctionsEmulator, getFunctions, httpsCallable } from 'firebase/functions';
import { ApiResponse } from '../types/api';
import { CreditTransaction, User } from '../types/user';

// Conditional imports for React Native
let AsyncStorage: any = null;
let getReactNativePersistence: any = null;

try {
  // Try to import React Native specific modules
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
  getReactNativePersistence = require('firebase/auth').getReactNativePersistence;
} catch (error) {
  // Web environment - these imports will fail, which is expected
  console.log('Running in web environment');
}

// Firebase configuration
const firebaseConfig = {
  apiKey: "REDACTED",
  authDomain: "ai-imagegenerator-f5742.firebaseapp.com",
  projectId: "ai-imagegenerator-f5742",
  storageBucket: "ai-imagegenerator-f5742.firebasestorage.app",
  messagingSenderId: "476396843079",
  appId: "1:476396843079:web:18d92469c58558f3710162",
  measurementId: "G-003617XP92"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with proper typing and environment detection
let auth: Auth;
try {
  if (getReactNativePersistence && AsyncStorage) {
    // React Native environment
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage)
    });
  } else {
    // Web environment
    auth = getAuth(app);
  }
} catch (error) {
  // If already initialized, get the existing instance
  auth = getAuth(app);
}

// Initialize Firestore with optimized settings
const db: Firestore = getFirestore(app);
const functions: Functions = getFunctions(app);

// Configure Firestore settings for better performance
try {
  // Enable offline persistence for better reliability
  if (typeof window !== 'undefined') {
    // Web environment - enable persistence
    console.log('🔧 Configuring Firestore for web environment');
  } else {
    // React Native environment
    console.log('🔧 Configuring Firestore for React Native environment');
  }
} catch (error) {
  console.warn('⚠️ Failed to configure Firestore settings:', error);
}

// Connect to Firebase emulators in development (only if explicitly enabled)
if (typeof window !== 'undefined' && process.env.EXPO_PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
  try {
    // Connect to Firestore emulator
    connectFirestoreEmulator(db, '127.0.0.1', 8080);
    console.log('✅ Connected to Firestore emulator');
    
    // Connect to Auth emulator
    connectAuthEmulator(auth, 'http://127.0.0.1:9099');
    console.log('✅ Connected to Auth emulator');
    
    // Connect to Functions emulator
    connectFunctionsEmulator(functions, '127.0.0.1', 5001);
    console.log('✅ Connected to Functions emulator');
  } catch (error) {
    console.warn('⚠️ Failed to connect to Firebase emulators:', error);
    console.log('📡 Using production Firebase services');
  }
} else {
  console.log('📡 Using production Firebase services');
}

// Initialize Analytics only in supported environments
let analytics: any = null;
if (typeof window !== 'undefined') {
  // Check if analytics is supported before initializing
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
      console.log('✅ Firebase Analytics initialized');
    } else {
      console.log('⚠️ Firebase Analytics not supported in this environment');
    }
  }).catch((error) => {
    console.warn('⚠️ Failed to check Analytics support:', error);
  });
}

export class FirebaseService {
  private static readonly USERS_COLLECTION = 'users';
  private static readonly CREDIT_TRANSACTIONS_COLLECTION = 'creditTransactions';
  private static readonly MODELS_COLLECTION = 'models';
  private static readonly GENERATIONS_COLLECTION = 'generations';

  /**
   * Initialize Firebase services
   */
  static async initialize(): Promise<void> {
    try {
      // Set up real-time listeners
      await this.setupRealtimeListeners();
      console.log('✅ Firebase services initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Firebase services:', error);
      throw error;
    }
  }

  /**
   * Sign in anonymously with timeout and retry
   */
  static async signInAnonymously(): Promise<ApiResponse<{ uid: string }>> {
    const maxRetries = 3;
    const timeout = 10000; // 10 seconds
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔐 Attempting anonymous sign in (attempt ${attempt}/${maxRetries})...`);
        
        // Create a timeout promise
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Sign in timeout')), timeout);
        });
        
        // Race between sign in and timeout
        const userCredential = await Promise.race([
          signInAnonymously(auth),
          timeoutPromise
        ]) as any;
        
        console.log('✅ Anonymous sign in successful');
        return {
          success: true,
          data: { uid: userCredential.user.uid }
        };
      } catch (error: any) {
        console.error(`❌ Sign in attempt ${attempt} failed:`, error.message);
        
        if (attempt === maxRetries) {
          return {
            success: false,
            error: `Failed to sign in anonymously after ${maxRetries} attempts: ${error.message}`
          };
        }
        
        // Wait before retry (exponential backoff)
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        console.log(`⏳ Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    return {
      success: false,
      error: 'Failed to sign in anonymously'
    };
  }

  /**
   * Sign out
   */
  static async signOut(): Promise<ApiResponse<void>> {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      console.error('Error signing out:', error);
      return {
        success: false,
        error: 'Failed to sign out'
      };
    }
  }

  /**
   * Create user with email and password
   */
  static async createUserWithEmailAndPassword(
    email: string, 
    password: string
  ): Promise<ApiResponse<{ uid: string; email: string }>> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return {
        success: true,
        data: { 
          uid: userCredential.user.uid,
          email: userCredential.user.email || email
        }
      };
    } catch (error: any) {
      console.error('Error creating user with email and password:', error);
      let errorMessage = 'Failed to create user';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email is already in use';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Sign in with email and password
   */
  static async signInWithEmailAndPassword(
    email: string, 
    password: string
  ): Promise<ApiResponse<{ uid: string; email: string }>> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return {
        success: true,
        data: { 
          uid: userCredential.user.uid,
          email: userCredential.user.email || email
        }
      };
    } catch (error: any) {
      console.error('Error signing in with email and password:', error);
      let errorMessage = 'Failed to sign in';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'User not found';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'User account has been disabled';
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Get current authenticated user
   */
  static getCurrentUser(): FirebaseUser | null {
    return auth.currentUser;
  }

  /**
   * Set up auth state listener
   */
  static onAuthStateChanged(callback: (user: FirebaseUser | null) => void): () => void {
    return onAuthStateChanged(auth, callback);
  }

  /**
   * Create user with timeout and retry
   */
  static async createUser(user: User): Promise<ApiResponse<User>> {
    const maxRetries = 3;
    const timeout = 8000; // 8 second timeout for creation
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`💾 Creating user (attempt ${attempt}/${maxRetries})`);
        
        // Create a timeout promise
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Firebase operation timeout')), timeout);
        });

        const userRef = doc(db, this.USERS_COLLECTION, user.id);
        await Promise.race([
          setDoc(userRef, user),
          timeoutPromise
        ]);

        console.log('✅ User created successfully');
        return {
          success: true,
          data: user
        };
      } catch (error: any) {
        console.error(`❌ Create attempt ${attempt} failed:`, error.message);
        
        if (attempt === maxRetries) {
          return {
            success: false,
            error: `Failed to create user after ${maxRetries} attempts: ${error.message}`
          };
        }
        
        // Wait before retry (exponential backoff)
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 3000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    return {
      success: false,
      error: 'Failed to create user'
    };
  }

  /**
   * Get user by persistent ID with timeout and retry
   */
  static async getUserByPersistentId(persistentId: string): Promise<ApiResponse<User>> {
    const maxRetries = 2;
    const timeout = 5000; // Reduced timeout
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔍 Getting user by persistent ID (attempt ${attempt}/${maxRetries})`);
        
        // Create a timeout promise
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Firebase operation timeout')), timeout);
        });

        const userRef = doc(db, this.USERS_COLLECTION, persistentId);
        const docSnap = await Promise.race([
          getDoc(userRef),
          timeoutPromise
        ]);

        if (docSnap.exists()) {
          console.log('✅ User found by persistent ID');
          return {
            success: true,
            data: docSnap.data() as User
          };
        }

        return {
          success: false,
          error: 'User not found'
        };
      } catch (error: any) {
        console.error(`❌ Attempt ${attempt} failed:`, error.message);
        
        if (attempt === maxRetries) {
          return {
            success: false,
            error: `Failed after ${maxRetries} attempts: ${error.message}`
          };
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return {
      success: false,
      error: 'Failed to get user by persistent ID'
    };
  }

  /**
   * Get user by Firebase UID with timeout and retry
   */
  static async getUserByFirebaseUID(firebaseUID: string): Promise<ApiResponse<User>> {
    const maxRetries = 2;
    const timeout = 5000; // Reduced timeout
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔍 Getting user by Firebase UID (attempt ${attempt}/${maxRetries})`);
        
        // Create a timeout promise
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Firebase operation timeout')), timeout);
        });

        const usersRef = collection(db, this.USERS_COLLECTION);
        const q = query(usersRef, where('firebaseUID', '==', firebaseUID), limit(1));
        const snapshot = await Promise.race([
          getDocs(q),
          timeoutPromise
        ]);

        if (!snapshot.empty) {
          const docSnap = snapshot.docs[0];
          console.log('✅ User found by Firebase UID');
          return {
            success: true,
            data: docSnap.data() as User
          };
        }

        return {
          success: false,
          error: 'User not found'
        };
      } catch (error: any) {
        console.error(`❌ Attempt ${attempt} failed:`, error.message);
        
        if (attempt === maxRetries) {
          return {
            success: false,
            error: `Failed after ${maxRetries} attempts: ${error.message}`
          };
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return {
      success: false,
      error: 'Failed to get user by Firebase UID'
    };
  }

  /**
   * Get user by device fingerprint with timeout and retry
   */
  static async getUserByFingerprint(fingerprint: string): Promise<ApiResponse<User>> {
    const maxRetries = 2;
    const timeout = 5000; // Reduced timeout
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔍 Getting user by fingerprint (attempt ${attempt}/${maxRetries})`);
        
        // Create a timeout promise
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Firebase operation timeout')), timeout);
        });

        const usersRef = collection(db, this.USERS_COLLECTION);
        const q = query(usersRef, where('hardwareFingerprint', '==', fingerprint), limit(1));
        const snapshot = await Promise.race([
          getDocs(q),
          timeoutPromise
        ]);

        if (!snapshot.empty) {
          const docSnap = snapshot.docs[0];
          console.log('✅ User found by fingerprint');
          return {
            success: true,
            data: docSnap.data() as User
          };
        }

        return {
          success: false,
          error: 'User not found'
        };
      } catch (error: any) {
        console.error(`❌ Attempt ${attempt} failed:`, error.message);
        
        if (attempt === maxRetries) {
          return {
            success: false,
            error: `Failed after ${maxRetries} attempts: ${error.message}`
          };
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return {
      success: false,
      error: 'Failed to get user by fingerprint'
    };
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId: string): Promise<ApiResponse<User>> {
    try {
      const userRef = doc(db, this.USERS_COLLECTION, userId);
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        return {
          success: true,
          data: docSnap.data() as User
        };
      }

      return {
        success: false,
        error: 'User not found'
      };
    } catch (error) {
      console.error('Error getting user by ID:', error);
      return {
        success: false,
        error: 'Failed to get user'
      };
    }
  }

  /**
   * Update user with timeout and retry
   */
  static async updateUser(userId: string, updates: Partial<User>): Promise<ApiResponse<User>> {
    const maxRetries = 2;
    const timeout = 6000; // 6 second timeout for updates
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`📝 Updating user (attempt ${attempt}/${maxRetries})`);
        
        // Create a timeout promise
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Firebase operation timeout')), timeout);
        });

        const userRef = doc(db, this.USERS_COLLECTION, userId);
        await Promise.race([
          updateDoc(userRef, updates),
          timeoutPromise
        ]);

        // Get updated user
        const updatedUser = await this.getUserByPersistentId(userId);
        if (updatedUser.success && updatedUser.data) {
          console.log('✅ User updated successfully');
          return {
            success: true,
            data: updatedUser.data
          };
        }

        return {
          success: false,
          error: 'Failed to retrieve updated user'
        };
      } catch (error: any) {
        console.error(`❌ Update attempt ${attempt} failed:`, error.message);
        
        if (attempt === maxRetries) {
          return {
            success: false,
            error: `Failed to update user after ${maxRetries} attempts: ${error.message}`
          };
        }
        
        // Wait before retry
        const delay = 1000 * attempt;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    return {
      success: false,
      error: 'Failed to update user'
    };
  }

  /**
   * Update user credits with collision-safe operations
   */
  static async updateUserCredits(
    userId: string, 
    amount: number, 
    operation: 'add' | 'subtract',
    reason: string
  ): Promise<ApiResponse<{ credits: number }>> {
    try {
      // Use a Cloud Function for atomic credit operations
      const updateCredits = httpsCallable(functions, 'updateUserCredits');
      
      const result = await updateCredits({
        userId,
        amount,
        operation,
        reason,
        timestamp: Date.now()
      });

      return {
        success: true,
        data: result.data as { credits: number }
      };
    } catch (error) {
      console.error('Error updating credits:', error);
      return {
        success: false,
        error: 'Failed to update credits'
      };
    }
  }

  /**
   * Get credit transaction history
   */
  static async getCreditTransactions(userId: string, limitCount = 50): Promise<ApiResponse<CreditTransaction[]>> {
    try {
      const transactionsRef = collection(db, this.CREDIT_TRANSACTIONS_COLLECTION);
      const q = query(
        transactionsRef,
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
      const snapshot = await getDocs(q);

      const transactions = snapshot.docs.map(doc => doc.data() as CreditTransaction);

      return {
        success: true,
        data: transactions
      };
    } catch (error) {
      console.error('Error getting credit transactions:', error);
      return {
        success: false,
        error: 'Failed to get credit transactions'
      };
    }
  }

  /**
   * Generate image using Replicate API (via Cloud Function)
   */
  static async generateImage(
    prompt: string, 
    model: string, 
    settings: Record<string, any>
  ): Promise<ApiResponse<{ imageUrl: string; metadata: any }>> {
    try {
      const generateImage = httpsCallable(functions, 'generateImage');
      
      const result = await generateImage({
        prompt,
        model,
        settings,
        timestamp: Date.now()
      });

      return {
        success: true,
        data: result.data as { imageUrl: string; metadata: any }
      };
    } catch (error) {
      console.error('Error generating image:', error);
      return {
        success: false,
        error: 'Failed to generate image'
      };
    }
  }

  /**
   * Get available models
   */
  static async getModels(): Promise<ApiResponse<any[]>> {
    try {
      const modelsRef = collection(db, this.MODELS_COLLECTION);
      const q = query(
        modelsRef,
        where('isActive', '==', true),
        orderBy('category')
      );
      const snapshot = await getDocs(q);

      const models = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      return {
        success: true,
        data: models
      };
    } catch (error) {
      console.error('Error getting models:', error);
      return {
        success: false,
        error: 'Failed to get models'
      };
    }
  }

  /**
   * Save generation result
   */
  static async saveGeneration(generation: any): Promise<ApiResponse<any>> {
    try {
      const generationsRef = collection(db, this.GENERATIONS_COLLECTION);
      const docRef = await addDoc(generationsRef, generation);

      return {
        success: true,
        data: { id: docRef.id, ...generation }
      };
    } catch (error) {
      console.error('Error saving generation:', error);
      return {
        success: false,
        error: 'Failed to save generation'
      };
    }
  }

  /**
   * Get user generations
   */
  static async getUserGenerations(userId: string, limitCount = 20): Promise<ApiResponse<any[]>> {
    try {
      const generationsRef = collection(db, this.GENERATIONS_COLLECTION);
      const q = query(
        generationsRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      const snapshot = await getDocs(q);

      const generations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      return {
        success: true,
        data: generations
      };
    } catch (error) {
      console.error('Error getting user generations:', error);
      return {
        success: false,
        error: 'Failed to get user generations'
      };
    }
  }

  /**
   * Setup real-time listeners for user data synchronization
   */
  private static async setupRealtimeListeners(): Promise<void> {
    // This will be implemented when we have the current user context
    // The listener will sync user data changes in real-time
  }

  /**
   * Set up real-time user data listener
   */
  static setupUserListener(userId: string, callback: (user: User) => void): () => void {
    const userRef = doc(db, this.USERS_COLLECTION, userId);
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        callback(docSnap.data() as User);
      }
    }, (error) => {
      console.error('Error in user listener:', error);
    });

    return unsubscribe;
  }

  /**
   * Backup user data to multiple recovery points
   */
  static async backupUserData(user: User): Promise<ApiResponse<void>> {
    try {
      const batch = writeBatch(db);

      // Backup with different keys for recovery
      const backupData = {
        ...user,
        backupTimestamp: Date.now()
      };

      // Primary backup by user ID
      const primaryBackupRef = doc(db, 'userBackups', user.id);
      batch.set(primaryBackupRef, backupData);

      // Backup by Firebase UID
      if (user.firebaseUID) {
        const firebaseBackupRef = doc(db, 'userBackups', `firebase_${user.firebaseUID}`);
        batch.set(firebaseBackupRef, backupData);
      }

      // Backup by device fingerprint
      const fingerprintBackupRef = doc(db, 'userBackups', `fingerprint_${user.hardwareFingerprint}`);
      batch.set(fingerprintBackupRef, backupData);

      await batch.commit();

      return { success: true };
    } catch (error) {
      console.error('Error backing up user data:', error);
      return {
        success: false,
        error: 'Failed to backup user data'
      };
    }
  }
}