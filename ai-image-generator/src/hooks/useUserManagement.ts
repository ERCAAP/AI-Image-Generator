import { useEffect } from 'react';
import { UserManagementService } from '../services/UserManagementService';
import { useUserStore } from '../store/userStore';
import { User } from '../types/user';

export function useUserManagement() {
  const {
    currentUser,
    isInitialized,
    isLoading,
    credits,
    setUser,
    setInitialized,
    setLoading,
    setCredits,
    reset
  } = useUserStore();

  // Initialize user management on mount
  useEffect(() => {
    if (!isInitialized && !isLoading) {
      initializeUser();
    }
  }, [isInitialized, isLoading]);

  const initializeUser = async () => {
    setLoading(true);
    try {
      const user = await UserManagementService.initialize();
      setUser(user);
      setInitialized(true);
      console.log('✅ User management initialized');
    } catch (error) {
      console.error('❌ Failed to initialize user:', error);
      
      // Always mark as initialized to prevent infinite loading
      setInitialized(true);
      
      // Create an emergency fallback user if the service failed completely
      try {
        console.log('🚨 Creating emergency fallback user...');
        const emergencyUser: User = {
          id: 'emergency-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
          firebaseUID: undefined,
          deviceId: 'emergency-device',
          hardwareFingerprint: 'emergency-fingerprint',
          credits: 3, // Give some credits for basic functionality
          isPremium: false,
          createdAt: Date.now(),
          lastActiveAt: Date.now(),
          settings: {
            language: 'tr',
            notifications: true,
            autoSave: true,
            quality: 'medium' as const
          }
        };
        setUser(emergencyUser);
        console.log('✅ Emergency fallback user created - app can continue');
      } catch (fallbackError) {
        console.error('❌ Failed to create emergency fallback user:', fallbackError);
        // Even if fallback fails, we still mark as initialized
        // The app can function with null user (very limited mode)
        console.log('🚨 App will continue in extremely limited mode');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateCredits = async (
    amount: number, 
    operation: 'add' | 'subtract', 
    reason: string
  ): Promise<boolean> => {
    try {
      const success = await UserManagementService.updateCredits(amount, operation, reason);
      if (success) {
        const updatedUser = UserManagementService.getCurrentUser();
        if (updatedUser) {
          setCredits(updatedUser.credits);
        }
      }
      return success;
    } catch (error) {
      console.error('Error updating credits:', error);
      return false;
    }
  };

  const syncUserData = async (): Promise<boolean> => {
    try {
      const success = await UserManagementService.syncUserData();
      if (success) {
        const updatedUser = UserManagementService.getCurrentUser();
        if (updatedUser) {
          setUser(updatedUser);
        }
      }
      return success;
    } catch (error) {
      console.error('Error syncing user data:', error);
      return false;
    }
  };

  const updateSettings = async (settings: Partial<User['settings']>): Promise<boolean> => {
    try {
      const success = await UserManagementService.updateSettings(settings);
      if (success) {
        const updatedUser = UserManagementService.getCurrentUser();
        if (updatedUser) {
          setUser(updatedUser);
        }
      }
      return success;
    } catch (error) {
      console.error('Error updating settings:', error);
      return false;
    }
  };

  const emergencyRecovery = async (): Promise<boolean> => {
    try {
      return await UserManagementService.emergencyCreditRecovery();
    } catch (error) {
      console.error('Error in emergency recovery:', error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await UserManagementService.logout();
      reset();
      setInitialized(false);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const getRecoveryData = async () => {
    try {
      return await UserManagementService.getRecoveryData();
    } catch (error) {
      console.error('Error getting recovery data:', error);
      return null;
    }
  };

  return {
    // State
    currentUser,
    isInitialized,
    isLoading,
    credits,
    
    // Actions
    initializeUser,
    updateCredits,
    syncUserData,
    updateSettings,
    emergencyRecovery,
    logout,
    getRecoveryData
  };
}