import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useAppStore } from '../src/store/appStore';
import { useAuth } from '../src/hooks/useAuth';
import { Colors } from '../src/constants';

export default function Index() {
  const { hasCompletedOnboarding } = useAppStore();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return; // Wait for auth state to load
    
    // If user is not authenticated, go to login
    if (!user) {
      router.replace('/auth/login');
      return;
    }
    
    // If user is authenticated, check onboarding status
    if (hasCompletedOnboarding) {
      router.replace('/(tabs)/discover');
    } else {
      router.replace('/onboarding');
    }
  }, [user, isLoading, hasCompletedOnboarding]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background.primary }}>
      <ActivityIndicator size="large" color={Colors.primary.main} />
    </View>
  );
}
