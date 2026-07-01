import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
    ActivityIndicator,
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Text } from '../../src/components/common';
import { Colors, Layout, Spacing } from '../../src/constants';
import { useAppStore } from '../../src/store/appStore';
import { useUserManagement } from '../../src/hooks/useUserManagement';
import { useAuth } from '../../src/hooks/useAuth';

const { width, height } = Dimensions.get('window');

interface OnboardingStep {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  gradient: readonly string[];
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'ai-power',
    title: 'AI Gücüyle\nGörsel Üretin',
    subtitle: 'Yapay Zeka Teknolojisi',
    description: 'Sadece birkaç kelime ile hayal ettiğiniz görselleri oluşturun. Güçlü AI modelleri ile sınırsız yaratıcılık.',
    icon: 'sparkles',
    gradient: Colors.gradients.accent,
  },
  {
    id: 'capabilities',
    title: 'Sınırsız\nPosibilités',
    subtitle: 'Ne Yapabilirsiniz?',
    description: 'Text-to-Image, Image-to-Image dönüşümü, profesyonel template\'ler ve daha fazlası. Yaratıcılığınızın sınırını zorlayın.',
    icon: 'infinite',
    gradient: Colors.gradients.secondary,
  },
  {
    id: 'community',
    title: 'Bizi\nDestekleyin',
    subtitle: 'Birlikte Büyüyoruz',
    description: 'Studişo\'yu seviyorsanız, App Store\'da bizi değerlendirin ve arkadaşlarınızla paylaşın. Desteğiniz bizim için çok değerli!',
    icon: 'heart',
    gradient: Colors.gradients.primary,
  },
];

export default function OnboardingScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isInitializing, setIsInitializing] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const { setOnboardingCompleted } = useAppStore();
  const { initializeUser } = useUserManagement();
  const { user } = useAuth();
  
  // Redirect to login if user is not authenticated
  React.useEffect(() => {
    if (!user) {
      router.replace('/auth/login');
    }
  }, [user]);
  
  const progressValue = useSharedValue(0);

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      scrollViewRef.current?.scrollTo({
        x: nextStep * width,
        animated: true,
      });
      progressValue.value = withSpring((nextStep + 1) / ONBOARDING_STEPS.length);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      scrollViewRef.current?.scrollTo({
        x: prevStep * width,
        animated: true,
      });
      progressValue.value = withSpring((prevStep + 1) / ONBOARDING_STEPS.length);
    }
  };

  const handleSkip = () => {
    finishOnboarding();
  };

  const handleGetStarted = () => {
    finishOnboarding();
  };

  const finishOnboarding = async () => {
    try {
      setIsInitializing(true);
      
      // Mark onboarding as completed first
      setOnboardingCompleted(true);
      
      // Initialize user management (Firebase connections)
      await initializeUser();
      
      // Navigate to main app
      router.replace('/(tabs)/discover');
    } catch (error) {
      console.error('Error during initialization:', error);
      // Even if initialization fails, still proceed to app
      // The app will work with fallback user
      router.replace('/(tabs)/discover');
    } finally {
      setIsInitializing(false);
    }
  };

  const onScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const step = Math.round(contentOffset / width);
    if (step !== currentStep && step >= 0 && step < ONBOARDING_STEPS.length) {
      setCurrentStep(step);
      progressValue.value = withSpring((step + 1) / ONBOARDING_STEPS.length);
    }
  };

  const progressStyle = useAnimatedStyle(() => {
    return {
      width: `${progressValue.value * 100}%`,
    };
  });

  React.useEffect(() => {
    progressValue.value = withSpring(1 / ONBOARDING_STEPS.length);
  }, []);

  const renderStep = (step: OnboardingStep, index: number) => (
    <View key={step.id} style={styles.stepContainer}>
      <LinearGradient
        colors={step.gradient as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.iconContainer}
      >
        <Ionicons 
          name={step.icon} 
          size={80} 
          color={Colors.text.primary}
        />
      </LinearGradient>

      <View style={styles.textContainer}>
        <Text variant="overline" color="secondary" style={styles.subtitle}>
          {step.subtitle}
        </Text>
        
        <Text variant="h1" color="primary" style={styles.title}>
          {step.title}
        </Text>
        
        <Text variant="body1" color="secondary" style={styles.description}>
          {step.description}
        </Text>
      </View>
    </View>
  );

  return (
    <LinearGradient
      colors={Colors.gradients.primary}
      style={styles.container}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}
          >
            <Text variant="body2" color="tertiary">
              Geç
            </Text>
          </TouchableOpacity>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBackground}>
              <Animated.View 
                style={[styles.progressFill, progressStyle]}
              />
            </View>
          </View>

          <View style={styles.placeholder} />
        </View>

        {/* Content */}
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
          bounces={false}
          style={styles.scrollView}
        >
          {ONBOARDING_STEPS.map(renderStep)}
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.dotsContainer}>
            {ONBOARDING_STEPS.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === currentStep && styles.activeDot,
                ]}
              />
            ))}
          </View>

          <View style={styles.buttonContainer}>
            {currentStep > 0 && (
              <TouchableOpacity
                style={styles.backButton}
                onPress={handlePrevious}
              >
                <Ionicons 
                  name="arrow-back" 
                  size={24} 
                  color={Colors.text.secondary} 
                />
              </TouchableOpacity>
            )}

            <View style={styles.buttonSpacer} />

            {currentStep < ONBOARDING_STEPS.length - 1 ? (
              <Button
                variant="gradient"
                size="large"
                onPress={handleNext}
                style={styles.nextButton}
                icon={<Ionicons name="arrow-forward" size={20} color={Colors.text.primary} />}
              >
                İleri
              </Button>
            ) : (
              <Button
                variant="gradient"
                size="large"
                onPress={handleGetStarted}
                style={styles.getStartedButton}
                disabled={isInitializing}
                icon={
                  isInitializing ? (
                    <ActivityIndicator size="small" color={Colors.text.primary} />
                  ) : (
                    <Ionicons name="rocket" size={20} color={Colors.text.primary} />
                  )
                }
              >
                {isInitializing ? 'Hazırlanıyor...' : 'Başlayalım'}
              </Button>
            )}
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  skipButton: {
    padding: Spacing.sm,
    minWidth: 60,
  },
  placeholder: {
    minWidth: 60,
  },
  progressContainer: {
    flex: 1,
    marginHorizontal: Spacing.lg,
  },
  progressBackground: {
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
  scrollView: {
    flex: 1,
  },
  stepContainer: {
    width,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Layout.screenPadding,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing['3xl'],
  },
  textContainer: {
    alignItems: 'center',
    maxWidth: '90%',
  },
  subtitle: {
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 44,
  },
  description: {
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 280,
  },
  footer: {
    paddingHorizontal: Layout.screenPadding,
    paddingBottom: Spacing.xl,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.surface.secondary,
  },
  activeDot: {
    backgroundColor: Colors.primary,
    width: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surface.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonSpacer: {
    flex: 1,
  },
  nextButton: {
    paddingHorizontal: Spacing['2xl'],
  },
  getStartedButton: {
    paddingHorizontal: Spacing['2xl'],
  },
});