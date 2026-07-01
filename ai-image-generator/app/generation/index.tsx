import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useCallback } from 'react';
import {
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, {
    FadeInDown,
    FadeInRight,
    useAnimatedStyle,
    useSharedValue,
    withSpring
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Text } from '../../src/components/common';
import { Colors, Layout, Spacing } from '../../src/constants';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

// Updated generation options with Replicate models
const GENERATION_OPTIONS = [
  {
    id: 'text-to-image',
    title: 'Text to Image',
    description: 'Create images from text descriptions using advanced AI models',
    icon: 'image',
         gradient: ['#667eea', '#764ba2'] as const,
    models: ['Google Imagen 4', 'NVIDIA Sana'],
    route: '/create',
    params: { type: 'text-to-image' }
  },
  {
    id: 'text-to-video',
    title: 'Text to Video',
    description: 'Generate videos from text prompts with AI video models',
    icon: 'videocam',
         gradient: ['#f093fb', '#f5576c'] as const,
    models: ['Google Veo 3', 'Kling v1.6', 'MiniMax Video'],
    route: '/create',
    params: { type: 'text-to-video' },
    isNew: true
  },
  {
    id: 'image-to-image',
    title: 'Image to Image',
    description: 'Transform and edit images with AI-powered tools',
    icon: 'color-wand',
         gradient: ['#4facfe', '#00f2fe'] as const,
    models: ['Runway Gen-4', 'SeedEdit 3.0', 'FLUX Kontext'],
    route: '/create',
    params: { type: 'image-to-image' }
  },
  {
    id: 'image-to-video',
    title: 'Image to Video',
    description: 'Animate static images into dynamic video content',
    icon: 'play-circle',
         gradient: ['#43e97b', '#38f9d7'] as const,
    models: ['MiniMax Video', 'Pixverse v4.5', 'Seedance'],
    route: '/create',
    params: { type: 'image-to-video' },
    isNew: true
  },
  {
    id: 'background-removal',
    title: 'Background Removal',
    description: 'Remove backgrounds from images instantly',
    icon: 'cut',
         gradient: ['#fa709a', '#fee140'] as const,
    models: ['Remove-BG Pro'],
    route: '/create',
    params: { type: 'background-removal' }
  },
  {
    id: 'video-enhancement',
    title: 'Video Enhancement',
    description: 'Enhance and upscale video quality with AI',
    icon: 'trending-up',
         gradient: ['#a8edea', '#fed6e3'] as const,
    models: ['Coming Soon'],
    route: '/create',
    params: { type: 'video-enhancement' },
    comingSoon: true
  }
];

// Featured templates with Replicate-based examples
const FEATURED_TEMPLATES = [
  {
    id: 'portrait',
    title: 'AI Portrait',
    description: 'Professional portraits',
    thumbnail: 'person',
    category: 'text-to-image',
    prompt: 'Professional headshot of a person, studio lighting, high quality'
  },
  {
    id: 'landscape',
    title: 'Landscape',
    description: 'Beautiful scenery',
    thumbnail: 'leaf',
    category: 'text-to-image',
    prompt: 'Breathtaking mountain landscape at sunset, cinematic'
  },
  {
    id: 'animation',
    title: 'Animation',
    description: 'Character animations',
    thumbnail: 'play',
    category: 'text-to-video',
    prompt: 'Animated character walking, smooth motion, 5 seconds'
  },
  {
    id: 'product',
    title: 'Product Shot',
    description: 'Commercial photography',
    thumbnail: 'cube',
    category: 'text-to-image',
    prompt: 'Modern product photography, clean background, studio lighting'
  },
  {
    id: 'cinematic',
    title: 'Cinematic Video',
    description: 'Movie-style clips',
    thumbnail: 'film',
    category: 'text-to-video',
    prompt: 'Cinematic establishing shot, dramatic lighting, film grain'
  },
  {
    id: 'abstract',
    title: 'Abstract Art',
    description: 'Creative abstracts',
    thumbnail: 'color-palette',
    category: 'text-to-image',
    prompt: 'Abstract digital art, vibrant colors, geometric shapes'
  }
];

// Popular models with Replicate data
const FEATURED_MODELS = [
  {
    id: 'google-veo-3',
    name: 'Google Veo 3',
    type: 'Video Generation',
    description: 'State-of-the-art video with audio',
    icon: 'videocam',
    popularity: '123K+ runs',
    category: 'video'
  },
  {
    id: 'google-imagen-4',
    name: 'Google Imagen 4',
    type: 'Text to Image',
    description: 'Latest Google image model',
    icon: 'image',
    popularity: 'New Release',
    category: 'image'
  },
  {
    id: 'kling-v16',
    name: 'Kling v1.6',
    type: 'Video Generation',
    description: '720p videos at 30fps',
    icon: 'film',
    popularity: '1M+ runs',
    category: 'video'
  },
  {
    id: 'runway-gen4',
    name: 'Runway Gen-4',
    type: 'Image Editing',
    description: 'Advanced image transformation',
    icon: 'color-wand',
    popularity: 'Popular',
    category: 'editing'
  }
];

export default function GenerationScreen() {

  const renderGenerationOption = useCallback((option: typeof GENERATION_OPTIONS[0], index: number) => {
    const scale = useSharedValue(1);
    
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => {
      scale.value = withSpring(0.98);
    };

    const handlePressOut = () => {
      scale.value = withSpring(1);
    };

    return (
      <AnimatedTouchableOpacity
        key={option.id}
        style={[styles.generationCard, animatedStyle]}
        entering={FadeInDown.delay(200 + index * 100).springify()}
        onPress={() => router.push({ pathname: option.route as any, params: option.params })}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <LinearGradient
          colors={option.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.generationGradient}
        >
          {option.isNew && (
            <View style={styles.newBadge}>
              <Text variant="caption" color="primary" weight="bold">
                NEW
              </Text>
            </View>
          )}
          
          <View style={styles.generationIcon}>
            <Ionicons 
              name={option.icon as any} 
              size={32} 
              color={Colors.text.primary} 
            />
          </View>
          
          <View style={styles.generationContent}>
            <Text variant="h5" color="primary" weight="bold" style={styles.generationTitle}>
              {option.title}
            </Text>
            <Text variant="body2" color="primary" style={styles.generationDescription}>
              {option.description}
            </Text>
            <Text variant="caption" color="primary" style={styles.generationModels}>
              {option.models.slice(0, 2).join(', ')}
            </Text>
          </View>
        </LinearGradient>
      </AnimatedTouchableOpacity>
    );
  }, []);

  const renderTemplateCard = useCallback((template: typeof FEATURED_TEMPLATES[0], index: number) => {
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
        key={template.id}
        style={[styles.templateCard, animatedStyle]}
        entering={FadeInRight.delay(300 + index * 50).springify()}
        onPress={() => router.push({ 
          pathname: '/create' as any, 
          params: { 
            type: template.category,
            template: template.id,
            prompt: template.prompt 
          } 
        })}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <Card variant="elevated" style={styles.templateContent}>
          <View style={styles.templateIcon}>
            <Ionicons 
              name={template.thumbnail as any} 
              size={24} 
              color={Colors.primary} 
            />
          </View>
          <Text variant="body1" color="primary" weight="semiBold" numberOfLines={1}>
            {template.title}
          </Text>
          <Text variant="caption" color="secondary" numberOfLines={2}>
            {template.description}
          </Text>
        </Card>
      </AnimatedTouchableOpacity>
    );
  }, []);

  const renderFeaturedModel = useCallback((model: typeof FEATURED_MODELS[0], index: number) => {
    const scale = useSharedValue(1);
    
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => {
      scale.value = withSpring(0.98);
    };

    const handlePressOut = () => {
      scale.value = withSpring(1);
    };

    return (
      <AnimatedTouchableOpacity
        key={model.id}
        style={[styles.modelCard, animatedStyle]}
        entering={FadeInDown.delay(400 + index * 50).springify()}
        onPress={() => router.push({ 
          pathname: '/create' as any, 
          params: { 
            type: model.category,
            modelId: model.id,
            modelName: model.name 
          } 
        })}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <Card variant="elevated" style={styles.modelContent}>
          <View style={styles.modelHeader}>
            <View style={styles.modelIconContainer}>
              <Ionicons 
                name={model.icon as any} 
                size={20} 
                color={Colors.primary} 
              />
            </View>
            <Text variant="caption" color="accent" weight="semiBold">
              {model.popularity}
            </Text>
          </View>
          
          <Text variant="body1" color="primary" weight="semiBold" numberOfLines={1}>
            {model.name}
          </Text>
          <Text variant="caption" color="secondary" numberOfLines={1}>
            {model.type}
          </Text>
          <Text variant="caption" color="tertiary" numberOfLines={2} style={styles.modelDescription}>
            {model.description}
          </Text>
        </Card>
      </AnimatedTouchableOpacity>
    );
  }, []);

  return (
    <LinearGradient colors={Colors.gradients.primary} style={styles.container}>
      <SafeAreaView style={styles.container}>
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={Layout.iconSize.md} color={Colors.text.primary} />
          </TouchableOpacity>
          <Text variant="navigationTitle" color="primary" weight="bold">
            Create with AI
          </Text>
          <TouchableOpacity onPress={() => router.push('/ai-models' as any)} style={styles.modelsButton}>
            <Ionicons name="apps" size={Layout.iconSize.md} color={Colors.text.secondary} />
          </TouchableOpacity>
        </Animated.View>

        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          {/* Generation Options */}
          <Animated.View entering={FadeInDown.delay(200).springify()}>
            <Text variant="h4" color="primary" weight="bold" style={styles.sectionTitle}>
              Choose Generation Type
            </Text>
            <Text variant="body1" color="secondary" style={styles.sectionSubtitle}>
              Select the type of AI generation you want to create
            </Text>
          </Animated.View>

          <View style={styles.generationGrid}>
            {GENERATION_OPTIONS.map((option, index) => renderGenerationOption(option, index))}
          </View>

          {/* Quick Templates */}
          <Animated.View entering={FadeInDown.delay(400).springify()}>
            <View style={styles.sectionHeader}>
              <Text variant="h5" color="primary" weight="semiBold">
                Quick Templates
              </Text>
              <Text variant="body2" color="secondary">
                Get started faster
              </Text>
            </View>
          </Animated.View>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.templatesContainer}
          >
            {FEATURED_TEMPLATES.map((template, index) => renderTemplateCard(template, index))}
          </ScrollView>

          {/* Featured Models */}
          <Animated.View entering={FadeInDown.delay(500).springify()}>
            <View style={styles.sectionHeader}>
              <Text variant="h5" color="primary" weight="semiBold">
                Featured Models
              </Text>
              <TouchableOpacity onPress={() => router.push('/ai-models' as any)}>
                <Text variant="body2" color="accent" weight="medium">
                  View All
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          <View style={styles.modelsGrid}>
            {FEATURED_MODELS.map((model, index) => renderFeaturedModel(model, index))}
          </View>

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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  backButton: {
    padding: Spacing.sm,
  },
  modelsButton: {
    padding: Spacing.sm,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: Spacing['2xl'],
  },
  sectionTitle: {
    paddingHorizontal: Layout.screenPadding,
    marginBottom: Spacing.sm,
  },
  sectionSubtitle: {
    paddingHorizontal: Layout.screenPadding,
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: Layout.screenPadding,
    marginBottom: Spacing.lg,
  },
  generationGrid: {
    paddingHorizontal: Layout.screenPadding,
    gap: Spacing.md,
    marginBottom: Spacing['3xl'],
  },
  generationCard: {
    borderRadius: Layout.borderRadius.xl,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  generationGradient: {
    padding: Spacing.lg,
    minHeight: 120,
    position: 'relative',
  },
  newBadge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: Colors.status.success,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Layout.borderRadius.sm,
  },
  generationIcon: {
    marginBottom: Spacing.md,
  },
  generationContent: {
    gap: Spacing.xs,
  },
  generationTitle: {
    lineHeight: 24,
  },
  generationDescription: {
    opacity: 0.9,
    lineHeight: 20,
  },
  generationModels: {
    opacity: 0.8,
    marginTop: Spacing.xs,
  },
  templatesContainer: {
    paddingHorizontal: Layout.screenPadding,
    gap: Spacing.md,
    marginBottom: Spacing['3xl'],
  },
  templateCard: {
    width: 140,
  },
  templateContent: {
    padding: Spacing.md,
    alignItems: 'center',
    gap: Spacing.sm,
    minHeight: 120,
  },
  templateIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  modelsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Layout.screenPadding,
    gap: Spacing.md,
  },
  modelCard: {
    width: '48%',
  },
  modelContent: {
    padding: Spacing.md,
    gap: Spacing.xs,
    minHeight: 120,
  },
  modelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  modelIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surface.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modelDescription: {
    marginTop: Spacing.xs,
    lineHeight: 16,
  },
  bottomSpacing: {
    height: Spacing['4xl'],
  },
}); 