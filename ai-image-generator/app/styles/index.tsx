import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    TextInput,
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

const STYLE_CATEGORIES = [
  {
    id: 'premium',
    name: 'Premium',
    description: 'High-quality premium styles',
    isPremium: true,
  },
  {
    id: 'v3-styles',
    name: 'V3 Styles',
    description: 'Latest generation styles',
    isPremium: false,
  },
  {
    id: 'v2-styles',
    name: 'V2 Styles',
    description: 'Classic style collection',
    isPremium: false,
  },
];

const ART_STYLES = [
  // Free Styles
  {
    id: 'kintsugi-v3-free',
    name: 'Kintsugi v3',
    category: 'v3-styles',
    thumbnail: 'https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=300&h=300&fit=crop',
    isNew: true,
    isPremium: false,
  },
  {
    id: 'warped-blacklight',
    name: 'Warped Blacklight',
    category: 'v3-styles',
    thumbnail: 'https://images.unsplash.com/photo-1553913861-c0fddf2619ee?w=300&h=300&fit=crop',
    isNew: true,
    isPremium: false,
  },
  {
    id: 'dreamland-v3',
    name: 'Dreamland v3',
    category: 'v3-styles',
    thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop',
    isNew: false,
    isPremium: false,
  },
  {
    id: 'surreal-dreams',
    name: 'Surreal Dreams',
    category: 'v3-styles',
    thumbnail: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=300&h=300&fit=crop',
    isNew: true,
    isPremium: false,
  },
  
  // V2 Styles
  {
    id: 'neon-cyber',
    name: 'Neon Cyber',
    category: 'v2-styles',
    thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=300&h=300&fit=crop',
    isNew: false,
    isPremium: false,
  },
  {
    id: 'vintage-film',
    name: 'Vintage Film',
    category: 'v2-styles',
    thumbnail: 'https://images.unsplash.com/photo-1533245274992-8c725c8ac479?w=300&h=300&fit=crop',
    isNew: false,
    isPremium: false,
  },
  {
    id: 'abstract-art',
    name: 'Abstract Art',
    category: 'v2-styles',
    thumbnail: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=300&h=300&fit=crop',
    isNew: false,
    isPremium: false,
  },
  
  // Premium Styles
  {
    id: 'minimalism-v3-premium',
    name: 'Minimalism v3',
    category: 'premium',
    thumbnail: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=300&h=300&fit=crop',
    isNew: true,
    isPremium: true,
  },
  {
    id: 'the-cut-v3',
    name: 'The Cut v3',
    category: 'premium',
    thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop',
    isNew: true,
    isPremium: true,
  },
  {
    id: 'kintsugi-premium',
    name: 'Kintsugi Premium',
    category: 'premium',
    thumbnail: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop',
    isNew: true,
    isPremium: true,
  },
  {
    id: 'oil-painting-master',
    name: 'Oil Painting Master',
    category: 'premium',
    thumbnail: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop',
    isNew: false,
    isPremium: true,
  },
  {
    id: 'hyperrealism-pro',
    name: 'Hyperrealism Pro',
    category: 'premium',
    thumbnail: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=300&h=300&fit=crop',
    isNew: true,
    isPremium: true,
  },
];

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export default function StylesScreen() {
  const [selectedCategory, setSelectedCategory] = useState('premium');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStyles = ART_STYLES.filter(style => {
    const matchesCategory = selectedCategory === 'all' || style.category === selectedCategory;
    const matchesSearch = style.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleStyleSelect = (style: typeof ART_STYLES[0]) => {
    if (style.isPremium) {
      Alert.alert(
        'Premium Style',
        'This style requires a premium subscription. Would you like to upgrade?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Upgrade', 
            onPress: () => router.push('/settings' as any) 
          },
        ]
      );
    } else {
      router.push({
        pathname: '/create' as any,
        params: {
          type: 'text-to-image',
          style: style.id,
          styleName: style.name
        }
      });
    }
  };

  const renderStyleCard = useCallback((style: typeof ART_STYLES[0], index: number) => {
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
        key={style.id}
        style={[styles.styleCard, animatedStyle]}
        entering={FadeInDown.delay(200 + index * 100).springify()}
        onPress={() => handleStyleSelect(style)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <Card variant="elevated" style={styles.styleCardContent}>
          <View style={styles.styleImageContainer}>
            <Image
              source={{ uri: style.thumbnail }}
              style={styles.styleImage}
              contentFit="cover"
            />
            {style.isPremium && (
              <View style={styles.premiumBadge}>
                <Ionicons name="star" size={12} color={Colors.primary} />
                <Text variant="caption" color="accent" weight="bold" style={styles.premiumText}>
                  PRO
                </Text>
              </View>
            )}
          </View>
          
          <View style={styles.styleInfo}>
            <Text variant="body1" color="primary" weight="semiBold" numberOfLines={1}>
              {style.name}
            </Text>
            <Text variant="caption" color="secondary" numberOfLines={1} style={styles.styleDescription}>
              {style.category.replace('-', ' ')} style
            </Text>
            
            <View style={styles.styleFooter}>
              <View style={styles.categoryTag}>
                <Text variant="caption" color="tertiary" weight="medium">
                  {style.category.replace('-', ' ').toUpperCase()}
                </Text>
              </View>
              {style.isNew && (
                <View style={styles.newBadge}>
                  <Ionicons name="sparkles" size={10} color={Colors.primary} />
                  <Text variant="caption" color="primary" style={styles.newText}>
                    NEW!
                  </Text>
                </View>
              )}
            </View>
          </View>
        </Card>
      </AnimatedTouchableOpacity>
    );
  }, []);

  return (
    <LinearGradient colors={Colors.gradients.primary} style={styles.container}>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          
          <Text variant="navigationTitle" color="primary" weight="bold">
            Art Styles
          </Text>
          
          <View style={styles.placeholder} />
        </Animated.View>

        {/* Description */}
        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.description}>
          <Text variant="body1" color="secondary" style={styles.descriptionText}>
            Choose from our curated collection of artistic styles
          </Text>
        </Animated.View>

        {/* Search Bar */}
        <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color={Colors.text.tertiary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search styles..."
              placeholderTextColor={Colors.text.tertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={Colors.text.secondary} />
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>

        {/* Category Tabs */}
        <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.categoriesContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContent}
          >
            {STYLE_CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryTab,
                  selectedCategory === category.id && styles.categoryTabActive,
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                {category.isPremium && (
                  <Ionicons
                    name="star"
                    size={14}
                    color={selectedCategory === category.id ? Colors.primary : Colors.text.secondary}
                  />
                )}
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

        {/* Styles Grid */}
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.stylesGrid}
        >
          {filteredStyles.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="color-palette" size={48} color={Colors.text.tertiary} />
              <Text variant="h6" color="secondary" weight="medium">
                No styles found
              </Text>
              <Text variant="body2" color="tertiary" style={styles.emptyText}>
                Try adjusting your search or category filters
              </Text>
            </View>
          ) : (
            <View style={styles.stylesContainer}>
              {filteredStyles.map((style, index) => renderStyleCard(style, index))}
            </View>
          )}
          
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
  searchContainer: {
    paddingHorizontal: Layout.screenPadding,
    marginBottom: Spacing.lg,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface.secondary,
    borderRadius: Layout.borderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: Colors.text.primary,
    fontSize: 16,
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
  stylesGrid: {
    paddingHorizontal: Layout.screenPadding,
    paddingBottom: Spacing['2xl'],
  },
  stylesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  styleCard: {
    width: '48%',
  },
  styleCardContent: {
    padding: 0,
    overflow: 'hidden',
  },
  styleImageContainer: {
    position: 'relative',
    aspectRatio: 1,
  },
  styleImage: {
    width: '100%',
    height: '100%',
  },
  premiumBadge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface.primary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Layout.borderRadius.sm,
    gap: Spacing.xs,
  },
  premiumText: {
    fontSize: 10,
  },
  styleInfo: {
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  styleDescription: {
    lineHeight: 16,
  },
  styleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  categoryTag: {
    backgroundColor: Colors.surface.secondary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Layout.borderRadius.xs,
  },
  newBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.status.success,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: Layout.borderRadius.xs,
    gap: 2,
  },
  newText: {
    fontSize: 8,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['4xl'],
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