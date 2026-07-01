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

const AI_TOOLS = [
  {
    id: 'object-selection',
    title: 'Object Selection',
    description: 'Select and remove objects from images',
    icon: 'finger-print',
    gradient: ['#FF9500', '#FFB347'] as const,
    image: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=object%20selection%20tool%20interface%20with%20highlighted%20objects&image_size=square',
    route: '/create',
    params: { tool: 'object-selection' }
  },
  {
    id: 'image-upscaler',
    title: 'Image Upscaler',
    description: 'Upscale images to higher resolution',
    icon: 'resize',
    gradient: ['#34C759', '#68D391'] as const,
    image: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=before%20and%20after%20image%20upscaling%20comparison&image_size=square',
    route: '/create',
    params: { tool: 'image-upscaler' }
  },
  {
    id: 'style-transfer',
    title: 'Style Transfer',
    description: 'Apply artistic styles to images',
    icon: 'color-palette',
    gradient: ['#AF52DE', '#DA70D6'] as const,
    image: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=artistic%20style%20transfer%20example%20with%20different%20art%20styles&image_size=square',
    route: '/create',
    params: { tool: 'style-transfer' }
  },
  {
    id: 'face-enhancement',
    title: 'Face Enhancement',
    description: 'Enhance faces in photos',
    icon: 'happy',
    gradient: ['#FF2D92', '#FF69B4'] as const,
    image: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=face%20enhancement%20before%20after%20comparison&image_size=square',
    route: '/create',
    params: { tool: 'face-enhancement' }
  },
  {
    id: 'background-remover',
    title: 'Background Remover',
    description: 'Remove background from images',
    icon: 'layers',
    gradient: ['#FF6B6B', '#FF8E53'] as const,
    image: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=background%20removal%20tool%20with%20transparent%20background&image_size=square',
    route: '/create',
    params: { tool: 'background-remover' }
  },
  {
    id: 'video-generator',
    title: 'Video Generator',
    description: 'Generate videos from text or images',
    icon: 'videocam',
    gradient: ['#6C5CE7', '#A78BFA'] as const,
    image: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=video%20generation%20interface%20with%20timeline&image_size=square',
    route: '/create',
    params: { tool: 'video-generator' }
  }
];

const TOOL_CATEGORIES = [
  { id: 'all', name: 'All Tools', count: AI_TOOLS.length },
  { id: 'image', name: 'Image Tools', count: 5 },
  { id: 'creative', name: 'Creative', count: 3 }
];

export default function AIToolsScreen() {
  const [selectedCategory, setSelectedCategory] = React.useState('all');

  const filteredTools = AI_TOOLS.filter(tool => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'image') return ['background-remover', 'image-upscaler', 'face-enhancement', 'object-selection', 'style-transfer'].includes(tool.id);
    if (selectedCategory === 'creative') return ['video-generator'].includes(tool.id);
    return true;
  });

  const handleToolPress = (tool: typeof AI_TOOLS[0]) => {
    router.push({
      pathname: tool.route as any,
      params: tool.params
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
            AI Tools
          </Text>
        </Animated.View>

        {/* Description */}
        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.description}>
          <Text variant="body1" color="secondary" style={styles.descriptionText}>
            Powerful AI utilities for your creative workflow
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
            {TOOL_CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryTab,
                  selectedCategory === category.id && styles.categoryTabActive,
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Text
                  variant="body2"
                  color={selectedCategory === category.id ? 'accent' : 'secondary'}
                  weight="medium"
                >
                  {category.name}
                </Text>
                <View style={[
                  styles.categoryCount,
                  selectedCategory === category.id && styles.categoryCountActive
                ]}>
                  <Text
                    variant="caption"
                    color={selectedCategory === category.id ? 'primary' : 'tertiary'}
                    weight="semiBold"
                  >
                    {category.count}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Tools Grid */}
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.toolsGrid}
        >
          <View style={styles.gridContainer}>
            {filteredTools.map((tool, index) => (
              <Animated.View
                key={tool.id}
                entering={FadeInDown.delay(400 + index * 100).springify()}
                style={styles.toolCardWrapper}
              >
                <TouchableOpacity
                  style={styles.toolCard}
                  onPress={() => handleToolPress(tool)}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={tool.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.toolGradient}
                  >
                    {/* Tool Image */}
                    <View style={styles.toolImageContainer}>
                      <View style={styles.toolImagePlaceholder}>
                        <Ionicons 
                          name={tool.icon as any} 
                          size={32} 
                          color={Colors.text.primary} 
                        />
                      </View>
                    </View>
                    
                    {/* Tool Content */}
                    <View style={styles.toolContent}>
                      <Text variant="h6" color="primary" weight="bold" style={styles.toolTitle}>
                        {tool.title}
                      </Text>
                      <Text variant="caption" color="primary" style={styles.toolDescription}>
                        {tool.description}
                      </Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            ))}
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
  categoryCount: {
    backgroundColor: Colors.surface.tertiary,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: Layout.borderRadius.sm,
    minWidth: 20,
    alignItems: 'center',
  },
  categoryCountActive: {
    backgroundColor: Colors.primary + '20',
  },
  content: {
    flex: 1,
  },
  toolsGrid: {
    paddingHorizontal: Layout.screenPadding,
    paddingBottom: Spacing['2xl'],
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  toolCardWrapper: {
    width: cardWidth,
    marginBottom: Spacing.lg,
  },
  toolCard: {
    borderRadius: Layout.borderRadius.xl,
    overflow: 'hidden',
    height: 160,
  },
  toolGradient: {
    flex: 1,
    padding: Spacing.md,
    justifyContent: 'space-between',
  },
  toolImageContainer: {
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  toolImagePlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toolContent: {
    gap: Spacing.xs,
  },
  toolTitle: {
    lineHeight: 20,
    textAlign: 'center',
  },
  toolDescription: {
    opacity: 0.9,
    lineHeight: 16,
    textAlign: 'center',
  },
  bottomSpacing: {
    height: Spacing['4xl'],
  },
});