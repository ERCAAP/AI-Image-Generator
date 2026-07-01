import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { Component, ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Colors, Layout, Spacing } from '../../constants';
import { Button } from './Button';
import { Text } from './Text';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to analytics/crash reporting service
    console.error('Error caught by boundary:', error, errorInfo);
    
    // TODO: Send to crash reporting service (e.g., Sentry)
    // logErrorToService(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    // TODO: Implement app reload
    console.log('App reload requested');
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <LinearGradient
          colors={Colors.gradients.primary}
          style={styles.container}
        >
          <View style={styles.content}>
            {/* Error Icon */}
            <View style={styles.iconContainer}>
              <Ionicons 
                name="warning" 
                size={64} 
                color={Colors.status.error} 
              />
            </View>

            {/* Error Message */}
            <Text variant="h3" color="primary" style={styles.title}>
              Bir Hata Oluştu
            </Text>
            
            <Text variant="body1" color="secondary" style={styles.description}>
              Beklenmedik bir hata meydana geldi. Lütfen uygulamayı yeniden başlatmayı deneyin.
            </Text>

            {/* Error Details (Development only) */}
            {__DEV__ && this.state.error && (
              <View style={styles.errorDetails}>
                <Text variant="overline" color="tertiary" style={styles.errorTitle}>
                  Hata Detayları (Geliştirme)
                </Text>
                <Text variant="mono" color="error" style={styles.errorText}>
                  {this.state.error.toString()}
                </Text>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <Button
                variant="gradient"
                size="large"
                onPress={this.handleRetry}
                icon={<Ionicons name="refresh" size={20} color={Colors.text.primary} />}
                style={styles.button}
              >
                Tekrar Dene
              </Button>
              
              <Button
                variant="secondary"
                size="large"
                onPress={this.handleReload}
                icon={<Ionicons name="reload" size={20} color={Colors.text.primary} />}
                style={styles.button}
              >
                Uygulamayı Yenile
              </Button>
            </View>
          </View>
        </LinearGradient>
      );
    }

    return this.props.children;
  }
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
  description: {
    textAlign: 'center',
    marginBottom: Spacing['2xl'],
    lineHeight: 24,
  },
  errorDetails: {
    width: '100%',
    padding: Spacing.md,
    backgroundColor: Colors.surface.secondary,
    borderRadius: Layout.borderRadius.md,
    marginBottom: Spacing.xl,
  },
  errorTitle: {
    marginBottom: Spacing.sm,
  },
  errorText: {
    fontSize: 12,
    lineHeight: 16,
  },
  buttonContainer: {
    width: '100%',
    gap: Spacing.md,
  },
  button: {
    width: '100%',
  },
});