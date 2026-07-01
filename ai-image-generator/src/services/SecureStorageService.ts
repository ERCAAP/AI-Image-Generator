import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class SecureStorageService {
  private static readonly PERSISTENT_ID_KEY = 'studiso_persistent_id';
  private static readonly USER_DATA_KEY = 'studiso_user_data';
  private static readonly DEVICE_FINGERPRINT_KEY = 'studiso_device_fingerprint';
  private static readonly FIREBASE_UID_KEY = 'studiso_firebase_uid';
  private static readonly CREDITS_BACKUP_KEY = 'studiso_credits_backup';

  /**
   * Generate and store a persistent UUID that survives app deletion/reinstallation
   */
  static async getPersistentId(): Promise<string> {
    try {
      let persistentId;
      
      if (Platform.OS === 'web') {
        persistentId = await AsyncStorage.getItem(this.PERSISTENT_ID_KEY);
      } else {
        persistentId = await SecureStore.getItemAsync(this.PERSISTENT_ID_KEY);
      }
      
      if (!persistentId) {
        persistentId = this.generateUUID();
        if (Platform.OS === 'web') {
          await AsyncStorage.setItem(this.PERSISTENT_ID_KEY, persistentId);
        } else {
          await SecureStore.setItemAsync(this.PERSISTENT_ID_KEY, persistentId);
        }
      }
      
      return persistentId;
    } catch (error) {
      console.error('Error getting persistent ID:', error);
      // Fallback to generating a new one
      const newId = this.generateUUID();
      try {
        if (Platform.OS === 'web') {
          await AsyncStorage.setItem(this.PERSISTENT_ID_KEY, newId);
        } else {
          await SecureStore.setItemAsync(this.PERSISTENT_ID_KEY, newId);
        }
      } catch (saveError) {
        console.error('Error saving persistent ID:', saveError);
      }
      return newId;
    }
  }

  /**
   * Store device fingerprint securely
   */
  static async storeDeviceFingerprint(fingerprint: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        await AsyncStorage.setItem(this.DEVICE_FINGERPRINT_KEY, fingerprint);
      } else {
        await SecureStore.setItemAsync(this.DEVICE_FINGERPRINT_KEY, fingerprint);
      }
    } catch (error) {
      console.error('Error storing device fingerprint:', error);
      throw error;
    }
  }

  /**
   * Get stored device fingerprint
   */
  static async getDeviceFingerprint(): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        return await AsyncStorage.getItem(this.DEVICE_FINGERPRINT_KEY);
      } else {
        return await SecureStore.getItemAsync(this.DEVICE_FINGERPRINT_KEY);
      }
    } catch (error) {
      console.error('Error getting device fingerprint:', error);
      return null;
    }
  }

  /**
   * Store Firebase UID
   */
  static async storeFirebaseUID(uid: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        await AsyncStorage.setItem(this.FIREBASE_UID_KEY, uid);
      } else {
        await SecureStore.setItemAsync(this.FIREBASE_UID_KEY, uid);
      }
    } catch (error) {
      console.error('Error storing Firebase UID:', error);
      throw error;
    }
  }

  /**
   * Get stored Firebase UID
   */
  static async getFirebaseUID(): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        return await AsyncStorage.getItem(this.FIREBASE_UID_KEY);
      } else {
        return await SecureStore.getItemAsync(this.FIREBASE_UID_KEY);
      }
    } catch (error) {
      console.error('Error getting Firebase UID:', error);
      return null;
    }
  }

  /**
   * Store user data with backup
   */
  static async storeUserData(userData: any): Promise<void> {
    try {
      const serializedData = JSON.stringify(userData);
      if (Platform.OS === 'web') {
        await AsyncStorage.setItem(this.USER_DATA_KEY, serializedData);
      } else {
        await SecureStore.setItemAsync(this.USER_DATA_KEY, serializedData);
      }
    } catch (error) {
      console.error('Error storing user data:', error);
      throw error;
    }
  }

  /**
   * Get stored user data
   */
  static async getUserData(): Promise<any | null> {
    try {
      let serializedData;
      if (Platform.OS === 'web') {
        serializedData = await AsyncStorage.getItem(this.USER_DATA_KEY);
      } else {
        serializedData = await SecureStore.getItemAsync(this.USER_DATA_KEY);
      }
      return serializedData ? JSON.parse(serializedData) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  /**
   * Backup credits locally
   */
  static async backupCredits(credits: number): Promise<void> {
    try {
      const backup = {
        credits,
        timestamp: Date.now(),
        persistentId: await this.getPersistentId()
      };
      if (Platform.OS === 'web') {
        await AsyncStorage.setItem(this.CREDITS_BACKUP_KEY, JSON.stringify(backup));
      } else {
        await SecureStore.setItemAsync(this.CREDITS_BACKUP_KEY, JSON.stringify(backup));
      }
    } catch (error) {
      console.error('Error backing up credits:', error);
    }
  }

  /**
   * Get backed up credits
   */
  static async getBackedUpCredits(): Promise<{ credits: number; timestamp: number } | null> {
    try {
      let backupData;
      if (Platform.OS === 'web') {
        backupData = await AsyncStorage.getItem(this.CREDITS_BACKUP_KEY);
      } else {
        backupData = await SecureStore.getItemAsync(this.CREDITS_BACKUP_KEY);
      }
      return backupData ? JSON.parse(backupData) : null;
    } catch (error) {
      console.error('Error getting backed up credits:', error);
      return null;
    }
  }

  /**
   * Clear all stored data (for debugging/reset)
   */
  static async clearAll(): Promise<void> {
    try {
      const keys = [
        this.PERSISTENT_ID_KEY,
        this.USER_DATA_KEY,
        this.DEVICE_FINGERPRINT_KEY,
        this.FIREBASE_UID_KEY,
        this.CREDITS_BACKUP_KEY
      ];

      if (Platform.OS === 'web') {
        await Promise.all(keys.map(key => AsyncStorage.removeItem(key)));
      } else {
        await Promise.all(keys.map(key => SecureStore.deleteItemAsync(key)));
      }
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  }

  /**
   * Check if SecureStore is available
   */
  static async isAvailable(): Promise<boolean> {
    try {
      if (Platform.OS === 'web') return false;
      await SecureStore.setItemAsync('test_key', 'test_value');
      await SecureStore.deleteItemAsync('test_key');
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Generate UUID v4
   */
  private static generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}