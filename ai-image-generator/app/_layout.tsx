import { SplashScreen, Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from '../src/components/common';
import { Colors } from '../src/constants';
import { useAuth } from '../src/hooks/useAuth';
import { configureReanimated } from '../src/utils/reanimatedConfig';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        {children}
        <StatusBar style="light" backgroundColor={Colors.background.primary} />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    configureReanimated();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
      if (user) {
        // User is signed in, navigate to home
        router.replace('/(tabs)/discover');
      } else {
        // User is not signed in, navigate to login
        router.replace('/auth/login');
      }
    }
  }, [isLoading, user]);
  
  // Render a loading screen or nothing while checking auth state
  if (isLoading) {
    return null; // Or a custom loading component
  }

  return (
    <ErrorBoundary>
      <AppProviders>
        <Stack 
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: Colors.background.primary },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen 
            name="auth/login" 
            options={{
              presentation: 'modal',
              animation: 'fade_from_bottom',
            }}
          />
        </Stack>
      </AppProviders>
    </ErrorBoundary>
  );
}
