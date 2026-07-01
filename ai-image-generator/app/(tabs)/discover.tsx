import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useCallback } from 'react';
import {
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, {
    FadeInDown,
    FadeInRight,
    FadeInUp,
    useAnimatedStyle,
    useSharedValue,
    withSpring
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Text } from '../../src/components/common';
import { Colors, Layout, Spacing } from '../../src/constants';
import { useUserStore } from '../../src/store/userStore';

const MAIN_FEATURES = [
  {
    id: 'ai-models',
    title: 'AI Models',
    subtitle: 'Choose from powerful AI models',
    icon: 'hardware-chip',
    route: '/ai-models',
    gradient: Colors.gradients.accent,
  },
  {
    id: 'create',
    title: 'Create',
    subtitle: 'Generate amazing images',
    icon: 'add-circle',
    route: '/generation',
    gradient: ['#FF6B6B', '#FF8E53', '#FF6B9D'] as const,
  },
  {
    id: 'ai-tools',
    title: 'AI Tools',
    subtitle: 'Advanced AI utilities',
    icon: 'construct',
    route: '/ai-tools',
    gradient: ['#4ECDC4', '#44A08D', '#093637'] as const,
  },
  {
    id: 'styles',
    title: 'Styles',
    subtitle: 'Explore art styles',
    icon: 'color-palette',
    route: '/styles',
    gradient: ['#667eea', '#764ba2', '#f093fb'] as const,
  },
];

const QUICK_ACTIONS = [
  {
    id: 'explore',
    title: 'Explore',
    icon: 'compass',
    route: '/styles',
  },
  {
    id: 'creations',
    title: 'My Creations',
    icon: 'images',
    route: '/creations',
  },
  {
    id: 'favorites',
    title: 'Favorites',
    icon: 'heart',
    route: '/creations',
  },
  {
    id: 'settings',
    title: 'Settings',
    icon: 'settings',
    route: '/settings',
  },
];

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export default function DiscoverScreen() {
  const { credits } = useUserStore();

  const createFeatureCard = useCallback((feature: typeof MAIN_FEATURES[0], index: number) => {
    const scale = useSharedValue(1);
    
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => {
      scale.value = withSpring(0.95);
    };

    const handlePressOut = () => {
      scale.value = withSpring(1);
    };

    return (
      <AnimatedTouchableOpacity
        key={feature.id}
        style={[styles.featureCard, animatedStyle]}
        entering={FadeInDown.delay(300 + index * 100).springify()}
        onPress={() => router.push(feature.route as any)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <LinearGradient
          colors={feature.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.featureGradient}
        >
          <View style={styles.featureIcon}>
            <Ionicons 
              name={feature.icon as any} 
              size={32} 
              color={Colors.text.primary} 
            />
          </View>
          <Text variant="h5" color="primary" weight="bold" style={styles.featureTitle}>
            {feature.title}
          </Text>
          <Text variant="body2" color="primary" style={styles.featureSubtitle}>
            {feature.subtitle}
          </Text>
        </LinearGradient>
      </AnimatedTouchableOpacity>
    );
  }, []);

  const createQuickAction = useCallback((action: typeof QUICK_ACTIONS[0], index: number) => {
    const scale = useSharedValue(1);
    
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => {
      scale.value = withSpring(0.95);
    };

    const handlePressOut = () => {
      scale.value = withSpring(1);
    };

    return (
      <AnimatedTouchableOpacity
        key={action.id}
        style={[styles.quickAction, animatedStyle]}
        entering={FadeInRight.delay(600 + index * 50).springify()}
        onPress={() => router.push(action.route as any)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <View style={styles.quickActionIcon}>
          <Ionicons 
            name={action.icon as any} 
            size={24} 
            color={Colors.primary} 
          />
        </View>
        <Text variant="body2" color="primary" weight="medium" style={styles.quickActionTitle}>
          {action.title}
        </Text>
      </AnimatedTouchableOpacity>
          );
  }, []);

  return (
    <LinearGradient colors={Colors.gradients.primary} style={styles.container}>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text variant="h2" color="primary" weight="bold">
                Welcome to
              </Text>
              <Text variant="h1" color="accent" weight="bold">
                Studişo
              </Text>
            </View>
            <View style={styles.creditsContainer}>
              <Ionicons name="diamond" size={16} color={Colors.primary} />
              <Text variant="body1" color="primary" weight="bold">
                {credits}
              </Text>
            </View>
          </View>
        </Animated.View>

        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Main Features Grid */}
          <View style={styles.section}>
            <Animated.View entering={FadeInDown.delay(200).springify()}>
              <Text variant="h4" color="primary" weight="bold" style={styles.sectionTitle}>
                Create with AI
              </Text>
              <Text variant="body1" color="secondary" style={styles.sectionSubtitle}>
                Choose your creative tool and start generating
              </Text>
            </Animated.View>
            
            <View style={styles.featuresGrid}>
              {MAIN_FEATURES.map(createFeatureCard)}
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Animated.View entering={FadeInDown.delay(500).springify()}>
              <Text variant="h5" color="primary" weight="semiBold" style={styles.sectionTitle}>
                Quick Actions
              </Text>
            </Animated.View>
            
            <View style={styles.quickActionsGrid}>
              {QUICK_ACTIONS.map(createQuickAction)}
            </View>
          </View>

          {/* Recent Activity Placeholder */}
          <Animated.View entering={FadeInUp.delay(700).springify()} style={styles.section}>
            <Text variant="h5" color="primary" weight="semiBold" style={styles.sectionTitle}>
              Recent Activity
            </Text>
            <Card variant="outlined" style={styles.emptyCard}>
              <View style={styles.emptyState}>
                <Ionicons name="time" size={48} color={Colors.text.tertiary} />
                <Text variant="h6" color="secondary" weight="medium">
                  No recent activity
                </Text>
                <Text variant="body2" color="tertiary" style={styles.emptyText}>
                  Your generated images will appear here
                </Text>
              </View>
            </Card>
          </Animated.View>

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  creditsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Layout.borderRadius.lg,
    gap: Spacing.xs,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing['2xl'],
  },
  section: {
    marginBottom: Spacing['3xl'],
  },
  sectionTitle: {
    paddingHorizontal: Layout.screenPadding,
    marginBottom: Spacing.sm,
  },
  sectionSubtitle: {
    paddingHorizontal: Layout.screenPadding,
    marginBottom: Spacing.xl,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Layout.screenPadding,
    gap: Spacing.md,
  },
  featureCard: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: Layout.borderRadius.xl,
    overflow: 'hidden',
  },
  featureGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  featureIcon: {
    marginBottom: Spacing.sm,
  },
  featureTitle: {
    textAlign: 'center',
  },
  featureSubtitle: {
    textAlign: 'center',
    opacity: 0.9,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    paddingHorizontal: Layout.screenPadding,
    gap: Spacing.md,
  },
  quickAction: {
    flex: 1,
    backgroundColor: Colors.surface.primary,
    borderRadius: Layout.borderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border.primary,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surface.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionTitle: {
    textAlign: 'center',
    fontSize: 12,
  },
  emptyCard: {
    marginHorizontal: Layout.screenPadding,
    padding: Spacing['2xl'],
  },
  emptyState: {
    alignItems: 'center',
    gap: Spacing.md,
  },
  emptyText: {
    textAlign: 'center',
    maxWidth: 200,
  },
  bottomSpacing: {
    height: Spacing['4xl'],
  },
});