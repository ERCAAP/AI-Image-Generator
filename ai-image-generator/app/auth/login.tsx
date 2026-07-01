import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Linking,
    StatusBar,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '../../src/components/common/Button';
import Text from '../../src/components/common/Text';
import { Colors, Spacing } from '../../src/constants';
import { useAuth } from '../../src/hooks/useAuth';
import { useAppStore } from '../../src/store/appStore';

export default function LoginScreen() {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const insets = useSafeAreaInsets();
  
  const { signInWithGoogle, signInWithApple, signInAnonymously } = useAuth();
  const { hasCompletedOnboarding } = useAppStore();

  const handleAuth = async (authType: 'google' | 'apple' | 'anonymous') => {
    setIsLoading(authType);
    try {
      switch (authType) {
        case 'google':
          await signInWithGoogle();
          break;
        case 'apple':
          await signInWithApple();
          break;
        case 'anonymous':
          await signInAnonymously();
          break;
      }
      // navigateAfterAuth(); // This is now handled by the RootLayout
    } catch (error: any) {
      if (error.code !== 'ERR_REQUEST_CANCELED') {
        Alert.alert('Hata', error.message || 'Giriş yapılırken bir hata oluştu.');
      }
    } finally {
      setIsLoading(null);
    }
  };
  /*
  const navigateAfterAuth = () => {
    if (hasCompletedOnboarding) {
      router.replace('/(tabs)/discover');
    } else {
      router.replace('/onboarding');
    }
  };
  */

  return (
    <LinearGradient
      colors={Colors.gradients.primary}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />
      {/* Top placeholder for video */}
      <View style={styles.videoPlaceholder}>
          <Text variant='h1' color='primary' style={{opacity: 0.1}}>Studişo</Text>
      </View>

      {/* Bottom Sheet */}
      <View style={[styles.bottomSheet, { paddingBottom: insets.bottom + Spacing.xl }]}>
        <View style={styles.sheetHeader}>
          <Text variant="h3" color="primary">Giriş Yap</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
            <Ionicons name="close" size={28} color={Colors.text.primary} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.buttonContainer}>
          <Button
            variant="outline"
            size="large"
            onPress={() => handleAuth('apple')}
            loading={isLoading === 'apple'}
            disabled={!!isLoading}
            icon={<Ionicons name="logo-apple" size={24} color={Colors.text.primary} />}
          >
            Apple ile Giriş Yap
          </Button>
          <Button
            variant="outline"
            size="large"
            onPress={() => handleAuth('google')}
            loading={isLoading === 'google'}
            disabled={!!isLoading}
            icon={<Ionicons name="logo-google" size={22} color={Colors.text.primary} />}
          >
            Google ile Giriş Yap
          </Button>
          <Button
            variant="ghost"
            size="medium"
            onPress={() => handleAuth('anonymous')}
            loading={isLoading === 'anonymous'}
            disabled={!!isLoading}
          >
            <Text variant="body1" color="secondary">Misafir Olarak Devam Et</Text>
          </Button>
        </View>

        <Text variant="caption" color="secondary" style={styles.footerText}>
          Devam ederek, Studișo'nun {' '}
          <Text variant="caption" color="primary" onPress={() => Linking.openURL('#')}>
            Kullanım Koşulları'nı
          </Text>
          {' ve '}
          <Text variant="caption" color="primary" onPress={() => Linking.openURL('#')}>
            Gizlilik Politikası'nı
          </Text>
          {' kabul etmiş olursunuz.'}
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  videoPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomSheet: {
    backgroundColor: Colors.surface.primary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    borderTopWidth: 1,
    borderColor: Colors.border.secondary,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  buttonContainer: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  footerText: {
    textAlign: 'center',
    lineHeight: 18,
  },
});