import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import { Colors, Spacing } from '../../constants';
import { Text } from './Text';

interface LoadingScreenProps {
  message?: string;
  showProgress?: boolean;
  progress?: number; // 0-1
}

export function LoadingScreen({ 
  message = 'Yükleniyor...', 
  showProgress = false,
  progress = 0 
}: LoadingScreenProps) {
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.7);

  useEffect(() => {
    // Rotation animation
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 2000,
        easing: Easing.linear,
      }),
      -1,
      false
    );

    // Scale animation
    scale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      true
    );

    // Opacity animation
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000 }),
        withTiming(0.7, { duration: 1000 })
      ),
      -1,
      true
    );
  }, []);

  const animatedIconStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: `${rotation.value}deg` },
        { scale: scale.value },
      ],
      opacity: opacity.value,
    };
  });

  const progressStyle = useAnimatedStyle(() => {
    return {
      width: `${progress * 100}%`,
    };
  });

  return (
    <LinearGradient
      colors={Colors.gradients.primary}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Animated Logo */}
        <View style={styles.logoContainer}>
          <LinearGradient
            colors={Colors.gradients.accent}
            style={styles.logoBackground}
          >
            <Animated.View style={[styles.iconWrapper, animatedIconStyle]}>
              <Ionicons 
                name="sparkles" 
                size={64} 
                color={Colors.text.primary} 
              />
            </Animated.View>
          </LinearGradient>
        </View>

        {/* App Name */}
        <Text variant="h1" color="primary" style={styles.appName}>
          Studişo
        </Text>

        {/* Loading Message */}
        <Text variant="body1" color="secondary" style={styles.message}>
          {message}
        </Text>

        {/* Progress Bar */}
        {showProgress && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBackground}>
              <Animated.View 
                style={[styles.progressFill, progressStyle]}
              />
            </View>
            <Text variant="caption" color="tertiary" style={styles.progressText}>
              {Math.round(progress * 100)}%
            </Text>
          </View>
        )}

        {/* Loading Dots */}
        <View style={styles.dotsContainer}>
          <Animated.View 
            style={[
              styles.dot, 
              { backgroundColor: Colors.primary },
              animatedIconStyle
            ]} 
          />
          <Animated.View 
            style={[
              styles.dot, 
              { backgroundColor: Colors.primary },
              { ...animatedIconStyle, transform: [{ scale: scale.value * 0.8 }] }
            ]} 
          />
          <Animated.View 
            style={[
              styles.dot, 
              { backgroundColor: Colors.primary },
              { ...animatedIconStyle, transform: [{ scale: scale.value * 0.6 }] }
            ]} 
          />
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    maxWidth: 300,
  },
  logoContainer: {
    marginBottom: Spacing['2xl'],
  },
  logoBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  appName: {
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    marginBottom: Spacing.xl,
    opacity: 0.8,
  },
  progressContainer: {
    width: '100%',
    marginBottom: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  progressBackground: {
    width: '100%',
    height: 4,
    backgroundColor: Colors.surface.secondary,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  progressText: {
    fontWeight: '600',
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
}); 