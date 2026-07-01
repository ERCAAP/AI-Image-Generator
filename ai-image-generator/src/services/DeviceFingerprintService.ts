import * as Device from 'expo-device';
import * as Application from 'expo-application';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { DeviceFingerprint } from '../types/user';

export class DeviceFingerprintService {
  /**
   * Generate a comprehensive device fingerprint
   */
  static async generateFingerprint(): Promise<DeviceFingerprint> {
    try {
      const deviceId = this.getDeviceId();
      const brand = Device.brand || 'unknown';
      const model = Device.modelName || 'unknown';
      const systemName = Device.osName || Platform.OS;
      const systemVersion = Device.osVersion || 'unknown';
      const buildNumber = Device.osBuildId || 'unknown';
      const bundleId = Application.applicationId || 'unknown';
      const uniqueId = await this.getUniqueId();

      const fingerprintData = {
        deviceId,
        brand,
        model,
        systemName,
        systemVersion,
        buildNumber,
        bundleId,
        uniqueId,
        platform: Platform.OS,
        isDevice: Device.isDevice,
        deviceType: Device.deviceType
      };

      const fingerprint = this.createHash(JSON.stringify(fingerprintData));

      return {
        deviceId,
        brand,
        model,
        systemName,
        systemVersion,
        buildNumber,
        bundleId,
        uniqueId,
        fingerprint
      };
    } catch (error) {
      console.error('Error generating device fingerprint:', error);
      // Return a fallback fingerprint
      return this.getFallbackFingerprint();
    }
  }

  /**
   * Get device ID using Expo APIs
   */
  private static getDeviceId(): string {
    if (Platform.OS === 'ios') {
      return Device.modelId || 'unknown';
    } else {
      return Device.modelName || 'unknown';
    }
  }

  /**
   * Get a stable unique ID for the device
   */
  private static async getUniqueId(): Promise<string> {
    try {
      // For iOS, use identifierForVendor equivalent
      if (Platform.OS === 'ios') {
        const installationId = Constants.installationId;
        if (installationId) {
          return installationId;
        }
      }

      // For Android, try to get Android ID equivalent
      if (Platform.OS === 'android') {
        const installationId = Constants.installationId;
        if (installationId) {
          return installationId;
        }
      }

      // Fallback: generate a consistent ID based on device info
      const deviceInfo = {
        brand: Device.brand,
        model: Device.modelName,
        systemVersion: Device.osVersion,
        buildNumber: Device.osBuildId,
        deviceType: Device.deviceType
      };

      return this.createHash(JSON.stringify(deviceInfo));
    } catch (error) {
      console.error('Error getting unique ID:', error);
      return this.createHash(`fallback-${Date.now()}`);
    }
  }

  /**
   * Create a fallback fingerprint when device info is not available
   */
  private static getFallbackFingerprint(): DeviceFingerprint {
    const timestamp = Date.now().toString();
    const fallbackId = this.createHash(`fallback-${timestamp}`);

    return {
      deviceId: fallbackId,
      brand: 'unknown',
      model: 'unknown',
      systemName: Platform.OS,
      systemVersion: 'unknown',
      buildNumber: 'unknown',
      bundleId: 'unknown',
      uniqueId: fallbackId,
      fingerprint: fallbackId
    };
  }

  /**
   * Compare two fingerprints to check if they match
   */
  static compareFingerprints(fp1: DeviceFingerprint, fp2: DeviceFingerprint): {
    isMatch: boolean;
    similarity: number;
    matchingFields: string[];
  } {
    const fields = ['deviceId', 'brand', 'model', 'systemName', 'systemVersion', 'bundleId', 'uniqueId'];
    const matchingFields: string[] = [];
    
    for (const field of fields) {
      if (fp1[field as keyof DeviceFingerprint] === fp2[field as keyof DeviceFingerprint]) {
        matchingFields.push(field);
      }
    }

    const similarity = matchingFields.length / fields.length;
    
    // Consider it a match if similarity is > 70% or exact fingerprint match
    const isMatch = similarity > 0.7 || fp1.fingerprint === fp2.fingerprint;

    return {
      isMatch,
      similarity,
      matchingFields
    };
  }

  /**
   * Validate if a fingerprint is still current
   */
  static async validateFingerprint(storedFingerprint: DeviceFingerprint): Promise<boolean> {
    try {
      const currentFingerprint = await this.generateFingerprint();
      const comparison = this.compareFingerprints(storedFingerprint, currentFingerprint);
      
      return comparison.isMatch;
    } catch (error) {
      console.error('Error validating fingerprint:', error);
      return false;
    }
  }

  /**
   * Simple hash function for creating fingerprints
   */
  private static createHash(input: string): string {
    let hash = 0;
    if (input.length === 0) return hash.toString();
    
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(36);
  }

  /**
   * Get device information for debugging
   */
  static async getDeviceInfo(): Promise<Record<string, any>> {
    try {
      return {
        deviceId: this.getDeviceId(),
        brand: Device.brand,
        model: Device.modelName,
        systemName: Device.osName,
        systemVersion: Device.osVersion,
        buildNumber: Device.osBuildId,
        bundleId: Application.applicationId,
        uniqueId: await this.getUniqueId(),
        platform: Platform.OS,
        isDevice: Device.isDevice,
        deviceType: Device.deviceType,
        deviceName: Device.deviceName,
        installationId: Constants.installationId
      };
    } catch (error) {
      console.error('Error getting device info:', error);
      return {};
    }
  }
}