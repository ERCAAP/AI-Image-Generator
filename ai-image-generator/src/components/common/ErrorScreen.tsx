import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Colors, Layout, Spacing } from '../../constants';
import { Button } from './Button';
import { Text } from './Text';

type ErrorType = 'network' | 'server' | 'unauthorized' | 'not-found' | 'rate-limit' | 'generic';

interface ErrorScreenProps {
  type?: ErrorType;
  title?: string;
  message?: string;
  onRetry?: () => void;
  onGoBack?: () => void;
  showRetryButton?: boolean;
  showBackButton?: boolean;
}

const ERROR_CONFIGS = {
  network: {
    icon: 'wifi-off',
    title: 'Bağlantı Hatası',
    message: 'İnternet bağlantınızı kontrol edin ve tekrar deneyin.',
    color: Colors.status.warning,
  },
  server: {
    icon: 'server-outline',
    title: 'Sunucu Hatası',
    message: 'Şu anda sunucularımızda bir sorun var. Lütfen daha sonra tekrar deneyin.',
    color: Colors.status.error,
  },
  unauthorized: {
    icon: 'lock-closed',
    title: 'Erişim Reddedildi',
    message: 'Bu işlemi gerçekleştirmek için yetkiniz yok.',
    color: Colors.status.warning,
  },
  'not-found': {
    icon: 'search',
    title: 'İçerik Bulunamadı',
    message: 'Aradığınız sayfa veya içerik bulunamadı.',
    color: Colors.text.secondary,
  },
  'rate-limit': {
    icon: 'timer',
    title: 'Çok Fazla İstek',
    message: 'Çok hızlı işlem yapıyorsunuz. Lütfen biraz bekleyip tekrar deneyin.',
    color: Colors.status.warning,
  },
  generic: {
    icon: 'alert-circle',
    title: 'Bir Hata Oluştu',
    message: 'Beklenmedik bir hata meydana geldi. Lütfen tekrar deneyin.',
    color: Colors.status.error,
  },
} as const;

export function ErrorScreen({
  type = 'generic',
  title,
  message,
  onRetry,
  onGoBack,
  showRetryButton = true,
  showBackButton = false,
}: ErrorScreenProps) {
  const config = ERROR_CONFIGS[type];
  
  const displayTitle = title || config.title;
  const displayMessage = message || config.message;

  return (
    <LinearGradient
      colors={Colors.gradients.primary}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Error Icon */}
        <View style={styles.iconContainer}>
          <Ionicons 
            name={config.icon as any} 
            size={64} 
            color={config.color} 
          />
        </View>

        {/* Error Content */}
        <Text variant="h3" color="primary" style={styles.title}>
          {displayTitle}
        </Text>
        
        <Text variant="body1" color="secondary" style={styles.message}>
          {displayMessage}
        </Text>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          {showRetryButton && onRetry && (
            <Button
              variant="gradient"
              size="large"
              onPress={onRetry}
              icon={<Ionicons name="refresh" size={20} color={Colors.text.primary} />}
              style={styles.button}
            >
              Tekrar Dene
            </Button>
          )}
          
          {showBackButton && onGoBack && (
            <Button
              variant="secondary"
              size="large"
              onPress={onGoBack}
              icon={<Ionicons name="arrow-back" size={20} color={Colors.text.primary} />}
              style={styles.button}
            >
              Geri Dön
            </Button>
          )}
        </View>

        {/* Tips based on error type */}
        {type === 'network' && (
          <View style={styles.tipsContainer}>
            <Text variant="overline" color="tertiary" style={styles.tipsTitle}>
              İpuçları
            </Text>
            <Text variant="caption" color="tertiary" style={styles.tip}>
              • Wi-Fi veya mobil verinin açık olduğundan emin olun
            </Text>
            <Text variant="caption" color="tertiary" style={styles.tip}>
              • Başka uygulamalarda internet çalışıyor mu kontrol edin
            </Text>
            <Text variant="caption" color="tertiary" style={styles.tip}>
              • Uçak modunu açıp kapatmayı deneyin
            </Text>
          </View>
        )}

        {type === 'rate-limit' && (
          <View style={styles.tipsContainer}>
            <Text variant="overline" color="tertiary" style={styles.tipsTitle}>
              Bekleme Süresi
            </Text>
            <Text variant="caption" color="tertiary" style={styles.tip}>
              Lütfen 1-2 dakika bekleyip tekrar deneyin
            </Text>
          </View>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Layout.screenPadding,
  },
  content: {
    alignItems: 'center',
    maxWidth: 350,
  },
  iconContainer: {
    marginBottom: Spacing['2xl'],
  },
  title: {
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  message: {
    textAlign: 'center',
    marginBottom: Spacing['2xl'],
    lineHeight: 24,
  },
  buttonContainer: {
    width: '100%',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  button: {
    width: '100%',
  },
  tipsContainer: {
    width: '100%',
    padding: Spacing.md,
    backgroundColor: Colors.surface.secondary,
    borderRadius: Layout.borderRadius.md,
    alignItems: 'flex-start',
  },
  tipsTitle: {
    marginBottom: Spacing.sm,
    alignSelf: 'center',
  },
  tip: {
    marginBottom: Spacing.xs,
    lineHeight: 16,
  },
});