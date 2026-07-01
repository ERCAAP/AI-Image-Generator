import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, {
    FadeInDown,
    useAnimatedStyle,
    useSharedValue,
    withSpring
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Text } from '../../src/components/common';
import { Colors, Layout, Spacing } from '../../src/constants';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

// AI Models data with Replicate's most popular models
const AI_MODELS = [
  // Video Generation Models (Most Popular)
  {
    id: 'google-veo-3',
    name: 'Google Veo 3',
    description: 'State-of-the-art video generation with audio support',
    thumbnail: 'videocam',
    category: 'video-generation',
    provider: 'Google',
    runs: '123.1K',
    features: ['Text-to-Video', 'Audio Generation', 'High Quality'],
    endpoint: 'google/veo-3',
    maxDuration: '60s',
    resolution: '1080p'
  },
  {
    id: 'kling-v16-standard',
    name: 'Kling v1.6 Standard',
    description: '720p video generation at 30fps with excellent quality',
    thumbnail: 'film',
    category: 'video-generation',
    provider: 'KuaiShou',
    runs: '1M+',
    features: ['5s-10s Videos', '720p', 'High FPS'],
    endpoint: 'kwaivgi/kling-v1.6-standard',
    maxDuration: '10s',
    resolution: '720p'
  },
  {
    id: 'minimax-video-01',
    name: 'MiniMax Video-01 (Hailuo)',
    description: 'Generate 6s videos with prompts or images',
    thumbnail: 'play-circle',
    category: 'video-generation',
    provider: 'MiniMax',
    runs: '547.5K',
    features: ['Text-to-Video', 'Image-to-Video', 'Character Reference'],
    endpoint: 'minimax/video-01',
    maxDuration: '6s',
    resolution: '720p'
  },
  {
    id: 'seedance-1-lite',
    name: 'Seedance 1 Lite',
    description: 'Fast video generation with text and image input',
    thumbnail: 'play',
    category: 'video-generation',
    provider: 'ByteDance',
    runs: '152.9K',
    features: ['5s-10s Videos', '480p-720p', 'Fast Generation'],
    endpoint: 'bytedance/seedance-1-lite',
    maxDuration: '10s',
    resolution: '720p'
  },
  {
    id: 'pixverse-v45',
    name: 'Pixverse v4.5',
    description: 'Enhanced motion and complex action handling',
    thumbnail: 'camera',
    category: 'video-generation',
    provider: 'Pixverse',
    runs: '95.1K',
    features: ['5s-8s Videos', 'Enhanced Motion', '1080p'],
    endpoint: 'pixverse/pixverse-v4.5',
    maxDuration: '8s',
    resolution: '1080p'
  },
  {
    id: 'hunyuan-video',
    name: 'Hunyuan Video',
    description: 'Open-source text-to-video with realistic motion',
    thumbnail: 'videocam-outline',
    category: 'video-generation',
    provider: 'Tencent',
    runs: '108.9K',
    features: ['Open Source', 'Realistic Motion', 'High Quality'],
    endpoint: 'tencent/hunyuan-video',
    maxDuration: '5s',
    resolution: '720p'
  },
  
  // Text-to-Image Models (Specified)
  {
    id: 'google-imagen-4',
    name: 'Google Imagen 4',
    description: 'Latest Google text-to-image model with superior quality',
    thumbnail: 'image',
    category: 'text-to-image',
    provider: 'Google',
    runs: 'New',
    features: ['High Quality', 'Fast Generation', 'Prompt Adherence'],
    endpoint: 'google/imagen-4',
    resolution: '1024x1024'
  },
  {
    id: 'nvidia-sana',
    name: 'NVIDIA Sana Sprint 1.6B',
    description: 'Efficient text-to-image generation with excellent quality',
    thumbnail: 'brush',
    category: 'text-to-image',
    provider: 'NVIDIA',
    runs: 'Featured',
    features: ['Efficient', 'High Quality', 'Fast'],
    endpoint: 'nvidia/sana-sprint-1.6b',
    resolution: '1024x1024'
  },
  
  // Image-to-Image Models (Specified)
  {
    id: 'runway-gen4',
    name: 'Runway Gen-4 Image',
    description: 'Advanced image-to-image transformation model',
    thumbnail: 'color-wand',
    category: 'image-to-image',
    provider: 'Runway',
    runs: 'Popular',
    features: ['Style Transfer', 'High Quality', 'Creative Control'],
    endpoint: 'runwayml/gen4-image',
    resolution: '1024x1024'
  },
  {
    id: 'seededit-30',
    name: 'SeedEdit 3.0',
    description: 'Precise image editing with seed-based control',
    thumbnail: 'create',
    category: 'image-to-image',
    provider: 'ByteDance',
    runs: 'Hot',
    features: ['Precise Editing', 'Seed Control', 'High Fidelity'],
    endpoint: 'bytedance/seededit-3.0',
    resolution: '1024x1024'
  },
  {
    id: 'gpt-image-1',
    name: 'GPT Image-1',
    description: 'OpenAI\'s advanced image understanding and generation',
    thumbnail: 'bulb',
    category: 'image-to-image',
    provider: 'OpenAI',
    runs: 'New',
    features: ['Advanced Understanding', 'Creative Editing', 'AI-Powered'],
    endpoint: 'openai/gpt-image-1',
    resolution: '1024x1024'
  },
  {
    id: 'flux-kontext-pro',
    name: 'FLUX Kontext Pro',
    description: 'Professional image editing with context awareness',
    thumbnail: 'settings',
    category: 'image-to-image',
    provider: 'Black Forest Labs',
    runs: 'Pro',
    features: ['Context Aware', 'Professional', 'High Control'],
    endpoint: 'black-forest-labs/flux-kontext-pro',
    resolution: '1024x1024'
  },
  
  // Background Removal (Specified)
  {
    id: 'remove-bg',
    name: 'Remove Background',
    description: 'Accurate background removal for any image',
    thumbnail: 'cut',
    category: 'background-removal',
    provider: 'LucaTaco',
    runs: 'Popular',
    features: ['Instant Removal', 'High Accuracy', 'Transparent PNG'],
    endpoint: 'lucataco/remove-bg',
    resolution: 'Original'
  }
];

// Model categories
const MODEL_CATEGORIES = [
  { id: 'all', name: 'All Models', icon: 'grid' as const },
  { id: 'video-generation', name: 'Video Generation', icon: 'videocam' as const },
  { id: 'text-to-image', name: 'Text to Image', icon: 'image' as const },
  { id: 'image-to-image', name: 'Image to Image', icon: 'color-wand' as const },
  { id: 'background-removal', name: 'Background Removal', icon: 'cut' as const },
];

export default function AIModelsScreen() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredModels = selectedCategory === 'all' 
    ? AI_MODELS 
    : AI_MODELS.filter(model => model.category === selectedCategory);

  const handleModelSelect = (model: typeof AI_MODELS[0]) => {
    router.push({
      pathname: '/create',
      params: {
        type: model.category,
        modelId: model.id,
        modelName: model.name,
        endpoint: model.endpoint
      }
    });
  };

  const renderModelCard = useCallback((model: typeof AI_MODELS[0], index: number) => {
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
        entering={FadeInDown.delay(index * 100).springify()}
        style={[animatedStyle, styles.modelCard]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => handleModelSelect(model)}
        activeOpacity={1}
      >
        <Card variant="elevated" style={styles.modelCardContent}>
          <View style={styles.modelHeader}>
            <View style={styles.modelIcon}>
              <Ionicons 
                name={model.thumbnail as any} 
                size={Layout.iconSize.lg} 
                color={Colors.primary} 
              />
            </View>
            <View style={styles.modelStats}>
              <Text variant="caption" color="tertiary">{model.provider}</Text>
              <Text variant="caption" color="accent" weight="semiBold">{model.runs}</Text>
            </View>
          </View>

          <View style={styles.modelInfo}>
            <Text variant="h6" color="primary" weight="semiBold" numberOfLines={1}>
              {model.name}
            </Text>
            <Text variant="body2" color="secondary" numberOfLines={2} style={styles.modelDescription}>
              {model.description}
            </Text>
          </View>

          <View style={styles.modelFeatures}>
            {model.features.slice(0, 2).map((feature, idx) => (
              <View key={idx} style={styles.featureTag}>
                <Text variant="caption" color="primary" weight="medium">
                  {feature}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.modelFooter}>
            <View style={styles.modelSpecs}>
              {model.resolution && (
                <Text variant="caption" color="tertiary">
                  {model.resolution}
                </Text>
              )}
              {model.maxDuration && (
                <Text variant="caption" color="tertiary">
                  • {model.maxDuration}
                </Text>
              )}
            </View>
            <View style={styles.useButton}>
              <Text variant="caption" color="accent" weight="semiBold">
                Use Model
              </Text>
            </View>
          </View>
        </Card>
      </AnimatedTouchableOpacity>
    );
  }, []);

  return (
    <LinearGradient
      colors={Colors.gradients.primary}
      style={styles.container}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <Animated.View 
          entering={FadeInDown.delay(100).springify()}
          style={styles.header}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          
          <Text variant="navigationTitle" color="primary" weight="bold">
            AI Models
          </Text>
          
          <View style={styles.placeholder} />
        </Animated.View>

        {/* Description */}
        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.description}>
          <Text variant="body1" color="secondary" style={styles.descriptionText}>
            Choose from our collection of powerful AI models
          </Text>
        </Animated.View>

        {/* Categories */}
        <Animated.View
          entering={FadeInDown.delay(300).springify()}
          style={styles.categoriesContainer}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContent}
          >
            {MODEL_CATEGORIES.map((category, index) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryTab,
                  selectedCategory === category.id && styles.categoryTabActive,
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Ionicons
                  name={category.icon}
                  size={16}
                  color={
                    selectedCategory === category.id
                      ? Colors.primary
                      : Colors.text.secondary
                  }
                />
                <Text
                  variant="body2"
                  color={selectedCategory === category.id ? 'accent' : 'secondary'}
                  weight="medium"
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Models Grid */}
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.modelsGrid}
        >
          {filteredModels.map((model, index) => renderModelCard(model, index))}
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
  placeholder: {
    width: 40,
  },
  description: {
    paddingHorizontal: Layout.screenPadding,
    marginBottom: Spacing.lg,
  },
  descriptionText: {
    textAlign: 'center',
  },
  categoriesContainer: {
    marginBottom: Spacing.lg,
  },
  categoriesContent: {
    paddingHorizontal: Layout.screenPadding,
    gap: Spacing.sm,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Layout.borderRadius.lg,
    backgroundColor: Colors.surface.secondary,
    gap: Spacing.xs,
  },
  categoryTabActive: {
    backgroundColor: Colors.surface.primary,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  content: {
    flex: 1,
  },
  modelsGrid: {
    paddingHorizontal: Layout.screenPadding,
    paddingBottom: Spacing['2xl'],
  },
  modelCard: {
    marginBottom: Spacing.lg,
  },
  modelCardContent: {
    padding: Spacing.lg,
  },
  modelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  modelIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surface.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modelStats: {
    alignItems: 'flex-end',
    gap: Spacing.xs,
  },
  modelInfo: {
    marginBottom: Spacing.md,
    gap: Spacing.xs,
  },
  modelDescription: {
    lineHeight: 20,
  },
  modelFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  featureTag: {
    backgroundColor: Colors.surface.secondary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Layout.borderRadius.sm,
  },
  modelFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modelSpecs: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  useButton: {
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Layout.borderRadius.md,
  },
  bottomSpacing: {
    height: Spacing['4xl'],
  },
}); 