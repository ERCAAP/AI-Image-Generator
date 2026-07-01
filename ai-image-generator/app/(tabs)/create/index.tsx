import React from 'react';
import { router } from 'expo-router';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../../src/components/common';
import { Colors, Layout, Spacing } from '../../../src/constants';

const { width } = Dimensions.get('window');
const cardWidth = (width - Layout.screenPadding * 2 - Spacing.md) / 2;

const CREATION_OPTIONS = [
  {
    id: 'text-to-image',
    title: 'Text to Image',
    description: 'Create images from text descriptions',
    icon: 'image',
    gradient: ['#6C5CE7', '#A78BFA'] as const,
    route: '/create',
    params: { type: 'text-to-image' }
  },
  {
    id: 'text-to-video',
    title: 'Text to Video',
    description: 'Generate videos from text',
    icon: 'videocam',
    gradient: ['#FF6B6B', '#FF8E53'] as const,
    route: '/create',
    params: { type: 'text-to-video' }
  },
  {
    id: 'image-to-image',
    title: 'Image to Image',
    description: 'Transform existing images',
    icon: 'color-wand',
    gradient: ['#34C759', '#68D391'] as const,
    route: '/create',
    params: { type: 'image-to-image' }
  },
  {
    id: 'image-to-video',
    title: 'Image to Video',
    description: 'Animate static images',
    icon: 'play-circle',
    gradient: ['#AF52DE', '#DA70D6'] as const,
    route: '/create',
    params: { type: 'image-to-video' }
  }
];

const QUICK_PROMPTS = [
  'A futuristic cityscape at sunset',
  'Portrait of a wise old wizard',
  'Magical forest with glowing trees',
  'Cyberpunk street scene',
  'Abstract geometric art',
  'Vintage car in the rain'
];

export default function CreateScreen() {
  const handleOptionPress = (option: typeof CREATION_OPTIONS[0]) => {
    router.push({
      pathname: option.route as any,
      params: option.params
    });
  };

  const handleQuickPrompt = (prompt: string) => {
    router.push({
      pathname: '/create' as any,
      params: { type: 'text-to-image', prompt }
    });
  };

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
          <Text variant="navigationTitle" color="primary" weight="bold">
            Create
          </Text>
        </Animated.View>

        {/* Description */}
        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.description}>
          <Text variant="body1" color="secondary" style={styles.descriptionText}>
            Choose your creation type and bring your ideas to life
          </Text>
        </Animated.View>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Creation Options */}
          <Animated.View entering={FadeInDown.delay(300).springify()}>
            <Text variant="h6" color="primary" weight="semiBold" style={styles.sectionTitle}>
              Creation Types
            </Text>
            <View style={styles.gridContainer}>
              {CREATION_OPTIONS.map((option, index) => (
                <Animated.View
                  key={option.id}
                  entering={FadeInDown.delay(400 + index * 100).springify()}
                  style={styles.optionCardWrapper}
                >
                  <TouchableOpacity
                    style={styles.optionCard}
                    onPress={() => handleOptionPress(option)}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={option.gradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.optionGradient}
                    >
                      <View style={styles.optionIcon}>
                        <Ionicons 
                          name={option.icon as any} 
                          size={32} 
                          color={Colors.text.primary} 
                        />
                      </View>
                      
                      <View style={styles.optionContent}>
                        <Text variant="h6" color="primary" weight="bold" style={styles.optionTitle}>
                          {option.title}
                        </Text>
                        <Text variant="caption" color="primary" style={styles.optionDescription}>
                          {option.description}
                        </Text>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          </Animated.View>

          {/* Quick Prompts */}
          <Animated.View entering={FadeInDown.delay(800).springify()} style={styles.quickPromptsSection}>
            <Text variant="h6" color="primary" weight="semiBold" style={styles.sectionTitle}>
              Quick Start Prompts
            </Text>
            <View style={styles.promptsContainer}>
              {QUICK_PROMPTS.map((prompt, index) => (
                <Animated.View
                  key={index}
                  entering={FadeInDown.delay(900 + index * 50).springify()}
                >
                  <TouchableOpacity
                    style={styles.promptCard}
                    onPress={() => handleQuickPrompt(prompt)}
                    activeOpacity={0.8}
                  >
                    <Text variant="body2" color="secondary" weight="medium">
                      {prompt}
                    </Text>
                    <Ionicons name="arrow-forward" size={16} color={Colors.text.tertiary} />
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
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
    alignItems: 'center',
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  description: {
    paddingHorizontal: Layout.screenPadding,
    marginBottom: Spacing.lg,
  },
  descriptionText: {
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Layout.screenPadding,
    paddingBottom: Spacing['2xl'],
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
  },
  optionCardWrapper: {
    width: cardWidth,
    marginBottom: Spacing.lg,
  },
  optionCard: {
    borderRadius: Layout.borderRadius.xl,
    overflow: 'hidden',
    height: 160,
  },
  optionGradient: {
    flex: 1,
    padding: Spacing.md,
    justifyContent: 'space-between',
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  optionContent: {
    gap: Spacing.xs,
  },
  optionTitle: {
    lineHeight: 20,
    textAlign: 'center',
  },
  optionDescription: {
    opacity: 0.9,
    lineHeight: 16,
    textAlign: 'center',
  },
  quickPromptsSection: {
    marginTop: Spacing.lg,
  },
  promptsContainer: {
    gap: Spacing.sm,
  },
  promptCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface.secondary,
    padding: Spacing.md,
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border.primary,
  },
  bottomSpacing: {
    height: Spacing['4xl'],
  },
});