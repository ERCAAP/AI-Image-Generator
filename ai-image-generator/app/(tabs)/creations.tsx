import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useState } from 'react';
import {
    Dimensions,
    FlatList,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
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

const { width } = Dimensions.get('window');
const imageSize = (width - Layout.screenPadding * 2 - Spacing.md) / 2;

// Mock data - will be replaced with real data
const MOCK_CREATIONS = [
  {
    id: '1',
    imageUrl: 'https://picsum.photos/400/400?random=1',
    prompt: 'A magical forest with glowing mushrooms',
    model: 'DALL-E 3',
    createdAt: Date.now() - 86400000,
    status: 'completed',
  },
  {
    id: '2',
    imageUrl: 'https://picsum.photos/400/400?random=2',
    prompt: 'Cyberpunk city at night with neon lights',
    model: 'Midjourney',
    createdAt: Date.now() - 172800000,
    status: 'completed',
  },
  {
    id: '3',
    imageUrl: 'https://picsum.photos/400/400?random=3',
    prompt: 'Portrait of a wise old wizard',
    model: 'Stable Diffusion',
    createdAt: Date.now() - 259200000,
    status: 'completed',
  },
  {
    id: '4',
    imageUrl: 'https://picsum.photos/400/400?random=4',
    prompt: 'Ocean waves crashing on rocks at sunset',
    model: 'DALL-E 3',
    createdAt: Date.now() - 345600000,
    status: 'completed',
  },
];

const FILTER_OPTIONS = [
  { id: 'all', title: 'All', icon: 'apps' },
  { id: 'recent', title: 'Recent', icon: 'time' },
  { id: 'favorites', title: 'Favorites', icon: 'heart' },
  { id: 'processing', title: 'Processing', icon: 'hourglass' },
];

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export default function CreationsScreen() {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const renderCreationItem = useCallback(({ item, index }: { item: any; index: number }) => {
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

    if (viewMode === 'grid') {
      return (
        <AnimatedTouchableOpacity 
          style={[styles.gridItem, animatedStyle]}
          entering={FadeInDown.delay(200 + index * 50).springify()}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        >
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.gridImage}
            contentFit="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.gridOverlay}
          >
            <Text variant="caption" color="primary" numberOfLines={2} style={styles.gridPrompt}>
              {item.prompt}
            </Text>
            <View style={styles.gridMeta}>
              <Text variant="overline" color="secondary">
                {formatDate(item.createdAt)}
              </Text>
              <Text variant="overline" color="accent">
                {item.model}
              </Text>
            </View>
          </LinearGradient>
        </AnimatedTouchableOpacity>
      );
    }

    return (
      <Animated.View 
        entering={FadeInRight.delay(200 + index * 50).springify()}
      >
        <Card variant="elevated" style={styles.listItem}>
          <TouchableOpacity style={styles.listContent} activeOpacity={0.8}>
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.listImage}
              contentFit="cover"
            />
            <View style={styles.listInfo}>
              <Text variant="body1" color="primary" numberOfLines={2} weight="medium">
                {item.prompt}
              </Text>
              <View style={styles.listMeta}>
                <Text variant="caption" color="secondary">
                  {item.model} • {formatDate(item.createdAt)}
                </Text>
                <View style={styles.statusBadge}>
                  <Text variant="caption" color="success" weight="semiBold">
                    {item.status}
                  </Text>
                </View>
              </View>
            </View>
            <TouchableOpacity style={styles.listAction}>
              <Ionicons name="ellipsis-horizontal" size={20} color={Colors.text.secondary} />
            </TouchableOpacity>
          </TouchableOpacity>
        </Card>
      </Animated.View>
    );
  }, [viewMode]);

  const renderEmptyState = () => (
    <Animated.View entering={FadeInUp.delay(300).springify()} style={styles.emptyContainer}>
      <Card variant="outlined" style={styles.emptyCard}>
        <View style={styles.emptyContent}>
          <Ionicons name="images" size={64} color={Colors.text.tertiary} />
          <Text variant="h5" color="secondary" weight="semiBold" style={styles.emptyTitle}>
            No creations yet
          </Text>
          <Text variant="body2" color="tertiary" style={styles.emptySubtitle}>
            Start creating amazing images with AI
          </Text>
          <TouchableOpacity style={styles.createButton}>
            <LinearGradient
              colors={Colors.gradients.button}
              style={styles.createButtonGradient}
            >
              <Ionicons name="add" size={20} color={Colors.text.primary} />
              <Text variant="button" color="primary" weight="semiBold">
                Create Now
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </Card>
    </Animated.View>
  );

  return (
    <LinearGradient colors={Colors.gradients.primary} style={styles.container}>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.header}>
          <View style={styles.headerContent}>
            <Text variant="h2" color="primary" weight="bold">
              My Creations
            </Text>
            <Text variant="body2" color="secondary">
              {MOCK_CREATIONS.length} images created
            </Text>
          </View>
          
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={[styles.viewModeButton, viewMode === 'grid' && styles.viewModeButtonActive]}
              onPress={() => setViewMode('grid')}
            >
              <Ionicons 
                name="grid" 
                size={20} 
                color={viewMode === 'grid' ? Colors.primary : Colors.text.secondary} 
              />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.viewModeButton, viewMode === 'list' && styles.viewModeButtonActive]}
              onPress={() => setViewMode('list')}
            >
              <Ionicons 
                name="list" 
                size={20} 
                color={viewMode === 'list' ? Colors.primary : Colors.text.secondary} 
              />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Filter Tabs */}
        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.filtersContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersContent}
          >
            {FILTER_OPTIONS.map((filter) => (
              <TouchableOpacity
                key={filter.id}
                style={[
                  styles.filterTab,
                  selectedFilter === filter.id && styles.filterTabActive,
                ]}
                onPress={() => setSelectedFilter(filter.id)}
              >
                <Ionicons
                  name={filter.icon as any}
                  size={16}
                  color={
                    selectedFilter === filter.id
                      ? Colors.primary
                      : Colors.text.secondary
                  }
                />
                <Text
                  variant="body2"
                  color={selectedFilter === filter.id ? 'accent' : 'secondary'}
                  weight="medium"
                >
                  {filter.title}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Content */}
        <View style={styles.content}>
          {MOCK_CREATIONS.length === 0 ? (
            renderEmptyState()
          ) : (
            <FlatList
              data={MOCK_CREATIONS}
              renderItem={renderCreationItem}
              keyExtractor={(item) => item.id}
              numColumns={viewMode === 'grid' ? 2 : 1}
              key={viewMode} // Force re-render when view mode changes
              columnWrapperStyle={viewMode === 'grid' ? styles.gridRow : undefined}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          )}
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  headerContent: {
    flex: 1,
    gap: Spacing.xs,
  },
  headerActions: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  viewModeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewModeButtonActive: {
    backgroundColor: Colors.surface.primary,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  filtersContainer: {
    marginBottom: Spacing.lg,
  },
  filtersContent: {
    paddingHorizontal: Layout.screenPadding,
    gap: Spacing.sm,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Layout.borderRadius.lg,
    backgroundColor: Colors.surface.secondary,
    gap: Spacing.xs,
  },
  filterTabActive: {
    backgroundColor: Colors.surface.primary,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  content: {
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: Layout.screenPadding,
    paddingBottom: Spacing['2xl'],
  },
  gridRow: {
    justifyContent: 'space-between',
  },
  separator: {
    height: Spacing.md,
  },
  gridItem: {
    width: imageSize,
    height: imageSize,
    borderRadius: Layout.borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: Colors.surface.secondary,
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  gridOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  gridPrompt: {
    lineHeight: 16,
  },
  gridMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listItem: {
    marginBottom: Spacing.md,
  },
  listContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.md,
  },
  listImage: {
    width: 60,
    height: 60,
    borderRadius: Layout.borderRadius.md,
    backgroundColor: Colors.surface.secondary,
  },
  listInfo: {
    flex: 1,
    gap: Spacing.sm,
  },
  listMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    backgroundColor: Colors.status.success + '20',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Layout.borderRadius.sm,
  },
  listAction: {
    padding: Spacing.sm,
  },
  emptyContainer: {
    flex: 1,
    paddingHorizontal: Layout.screenPadding,
  },
  emptyCard: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing['2xl'],
  },
  emptyContent: {
    alignItems: 'center',
    gap: Spacing.lg,
    maxWidth: 280,
  },
  emptyTitle: {
    textAlign: 'center',
  },
  emptySubtitle: {
    textAlign: 'center',
    lineHeight: 20,
  },
  createButton: {
    marginTop: Spacing.md,
    borderRadius: Layout.borderRadius.lg,
    overflow: 'hidden',
  },
  createButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
}); 