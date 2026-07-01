import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
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
import { Button, Card, Text } from '../../src/components/common';
import { Colors, Layout, Spacing } from '../../src/constants';
import { useUserStore } from '../../src/store/userStore';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

// Real Replicate model requirements based on research
const GENERATION_TYPES = [
  { 
    id: 'text-to-image', 
    name: 'Text to Image', 
    icon: 'image', 
    description: 'High-quality images from text',
    models: ['Google Imagen 4', 'NVIDIA Sana'],
    requiresPrompt: true,
    requiresImage: false,
    maxPromptLength: 500
  },
  { 
    id: 'text-to-video', 
    name: 'Text to Video', 
    icon: 'videocam', 
    description: 'Generate videos with audio',
    models: ['Google Veo 3', 'Kling v1.6', 'MiniMax Video'],
    requiresPrompt: true,
    requiresImage: false,
    isNew: true,
    maxPromptLength: 1000,
    hasAudio: true,
    hasDuration: true
  },
  { 
    id: 'image-to-image', 
    name: 'Image to Image', 
    icon: 'color-wand', 
    description: 'Transform and edit images',
    models: ['Runway Gen-4', 'SeedEdit 3.0', 'FLUX Kontext'],
    requiresPrompt: true,
    requiresImage: true,
    maxPromptLength: 300
  },
  { 
    id: 'image-to-video', 
    name: 'Image to Video', 
    icon: 'play-circle', 
    description: 'Animate static images',
    models: ['MiniMax Video', 'Kling v1.6', 'Seedance'],
    requiresPrompt: false,
    requiresImage: true,
    isNew: true,
    hasCharacterRef: true,
    hasDuration: true
  },
  { 
    id: 'background-removal', 
    name: 'Remove Background', 
    icon: 'cut', 
    description: 'Remove image backgrounds instantly',
    models: ['Remove-BG Pro'],
    requiresPrompt: false,
    requiresImage: true,
    isInstant: true
  }
];

// Real model-specific quality options
const QUALITY_OPTIONS = {
  'text-to-image': [
    { id: 'standard', name: 'Standard', resolution: '1024x1024', credits: 1, description: 'High quality images' },
    { id: 'hd', name: 'HD', resolution: '1536x1536', credits: 2, description: 'Ultra-high resolution' }
  ],
  'text-to-video': [
    { id: 'standard', name: '720p Standard', resolution: '720p', credits: 3, description: '5-8 seconds with audio' },
    { id: 'hd', name: '1080p HD', resolution: '1080p', credits: 5, description: '5-8 seconds, premium quality' }
  ],
  'image-to-image': [
    { id: 'standard', name: 'Standard', resolution: '1024x1024', credits: 2, description: 'Professional editing' },
    { id: 'cinematic', name: 'Cinematic', resolution: '1024x1024', credits: 3, description: 'Film-grade quality' }
  ],
  'image-to-video': [
    { id: 'standard', name: '720p Video', resolution: '720p', credits: 4, description: '6-10 seconds animation' },
    { id: 'hd', name: '1080p Video', resolution: '1080p', credits: 6, description: 'High-definition animation' }
  ],
  'background-removal': [
    { id: 'instant', name: 'Instant Removal', resolution: 'Original', credits: 1, description: 'Transparent PNG output' }
  ]
};

// Video duration options for video models
const VIDEO_DURATION_OPTIONS = [
  { id: '5s', name: '5 seconds', credits: 0, description: 'Quick clips' },
  { id: '6s', name: '6 seconds', credits: 1, description: 'Standard length' },
  { id: '8s', name: '8 seconds', credits: 2, description: 'Extended scenes' },
  { id: '10s', name: '10 seconds', credits: 3, description: 'Long-form content', isPremium: true }
];

// Style options with model-specific support
const STYLE_OPTIONS = {
  'text-to-image': [
    { id: 'realistic', name: 'Photorealistic', description: 'Photo-like quality' },
    { id: 'artistic', name: 'Artistic', description: 'Creative interpretation' },
    { id: 'cinematic', name: 'Cinematic', description: 'Film-like aesthetics' },
    { id: 'abstract', name: 'Abstract', description: 'Abstract art style' }
  ],
  'text-to-video': [
    { id: 'cinematic', name: 'Cinematic', description: 'Movie-like quality with audio' },
    { id: 'realistic', name: 'Realistic', description: 'Lifelike motion and physics' },
    { id: 'animation', name: 'Animation', description: 'Animated style with smooth motion' }
  ],
  'image-to-image': [
    { id: 'enhance', name: 'Enhancement', description: 'Improve existing image' },
    { id: 'style-transfer', name: 'Style Transfer', description: 'Apply new artistic style' },
    { id: 'restoration', name: 'Restoration', description: 'Fix and restore quality' }
  ],
  'image-to-video': [
    { id: 'smooth', name: 'Smooth Motion', description: 'Natural, flowing animation' },
    { id: 'dynamic', name: 'Dynamic', description: 'Active, energetic movement' }
  ]
};

// Aspect ratio options
const ASPECT_RATIO_OPTIONS = [
  { id: '16:9', name: '16:9', description: 'Landscape (YouTube)' },
  { id: '9:16', name: '9:16', description: 'Portrait (TikTok)' },
  { id: '1:1', name: '1:1', description: 'Square (Instagram)' },
  { id: '4:3', name: '4:3', description: 'Classic format' }
];

export default function CreateScreen() {
  const { credits } = useUserStore();
  const params = useLocalSearchParams();
  
  // Get initial type from params or default to text-to-image
  const initialType = (params.type as string) || 'text-to-image';
  const initialPrompt = (params.prompt as string) || '';
  const modelId = params.modelId as string;
  const modelName = params.modelName as string;
  const endpoint = params.endpoint as string;
  
  const [creationType, setCreationType] = useState(initialType);
  const [prompt, setPrompt] = useState(initialPrompt);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedCharacterRef, setSelectedCharacterRef] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState('');
  const [selectedQuality, setSelectedQuality] = useState('standard');
  const [videoDuration, setVideoDuration] = useState('5s');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [isGenerating, setIsGenerating] = useState(false);

  // Get current generation type config
  const currentType = GENERATION_TYPES.find(t => t.id === creationType);
  const isVideoGeneration = creationType.includes('video');
  const isBackgroundRemoval = creationType === 'background-removal';
  const needsImage = currentType?.requiresImage || false;
  const needsPrompt = currentType?.requiresPrompt || false;
  const hasCharacterRef = currentType?.hasCharacterRef || false;

  // Get available options for current type
  const availableQualityOptions = QUALITY_OPTIONS[creationType as keyof typeof QUALITY_OPTIONS] || [];
  const availableStyleOptions = STYLE_OPTIONS[creationType as keyof typeof STYLE_OPTIONS] || [];
  
  // Set default style when type changes
  React.useEffect(() => {
    if (availableStyleOptions.length > 0 && !selectedStyle) {
      setSelectedStyle(availableStyleOptions[0].id);
    }
  }, [creationType, availableStyleOptions]);

  // Calculate total credits needed
  const getCreditsNeeded = () => {
    const qualityOption = availableQualityOptions.find(q => q.id === selectedQuality);
    const durationOption = VIDEO_DURATION_OPTIONS.find(d => d.id === videoDuration);
    
    let baseCredits = qualityOption?.credits || 1;
    if (isVideoGeneration && durationOption) {
      baseCredits += durationOption.credits;
    }
    
    return baseCredits;
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const takePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const pickCharacterRef = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4], // Portrait for character reference
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedCharacterRef(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick character reference');
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
  };

  const clearCharacterRef = () => {
    setSelectedCharacterRef(null);
  };

  const handleGenerate = async () => {
    const creditsNeeded = getCreditsNeeded();
    
    if (credits < creditsNeeded) {
      Alert.alert(
        'Insufficient Credits',
        `You need ${creditsNeeded} credits for this generation. Current balance: ${credits}`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Get Credits', onPress: () => router.push('/settings' as any) }
        ]
      );
      return;
    }

    if (needsPrompt && !prompt.trim()) {
      Alert.alert('Missing Prompt', 'Please enter a description for your generation.');
      return;
    }

    if (needsImage && !selectedImage) {
      Alert.alert('Missing Image', 'Please select an image for this generation type.');
      return;
    }

    setIsGenerating(true);
    
    try {
      // Here you would integrate with actual Replicate API using the researched endpoints
      const generationData = {
        type: creationType,
        prompt: prompt.trim(),
        image: selectedImage,
        characterRef: selectedCharacterRef,
        style: selectedStyle,
        quality: selectedQuality,
        duration: isVideoGeneration ? videoDuration : undefined,
        aspectRatio: aspectRatio,
        endpoint: endpoint || getDefaultEndpoint(creationType),
        credits: creditsNeeded
      };
      
      const outputType = isVideoGeneration ? 'video' : 'image';
      const outputFormat = isBackgroundRemoval ? 'PNG with transparency' : 
                          isVideoGeneration ? 'MP4 with audio' : 'High-quality image';
      
      Alert.alert(
        'Generation Started!',
        `Your ${currentType?.name.toLowerCase()} generation has been queued.\n\n` +
        `${modelName ? `Model: ${modelName}\n` : ''}` +
        `Output: ${outputFormat}\n` +
        `Resolution: ${availableQualityOptions.find(q => q.id === selectedQuality)?.resolution}\n` +
        `${isVideoGeneration ? `Duration: ${videoDuration}\n` : ''}` +
        `Credits used: ${creditsNeeded}`,
        [
          { text: 'View Progress', onPress: () => router.push('/(tabs)/creations' as any) },
          { text: 'Create Another', onPress: () => {
            setPrompt('');
            setSelectedImage(null);
            setSelectedCharacterRef(null);
          }}
        ]
      );
      
    } catch (error) {
      Alert.alert('Generation Failed', 'Please try again later.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Get default endpoint for model type
  const getDefaultEndpoint = (type: string) => {
    const endpoints: Record<string, string> = {
      'text-to-image': 'google/imagen-4',
      'text-to-video': 'google/veo-3',
      'image-to-image': 'runwayml/gen4-image',
      'image-to-video': 'minimax/video-01',
      'background-removal': 'lucataco/remove-bg'
    };
    return endpoints[type] || 'google/imagen-4';
  };

  // Validation for current configuration
  const canGenerate = () => {
    if (needsPrompt && !prompt.trim()) return false;
    if (needsImage && !selectedImage) return false;
    if (credits < getCreditsNeeded()) return false;
    return true;
  };

  const renderTypeSelector = useCallback(() => {
    const currentTypeConfig = GENERATION_TYPES.find(t => t.id === currentType);
    
    return (
      <View style={styles.sectionContent}>
        <View style={styles.sectionHeader}>
          <Text variant="h5" color="primary" weight="bold">
            Generation Type
          </Text>
          <Text variant="body2" color="secondary">
            Select your AI creation method
          </Text>
        </View>
        
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.typeScrollContainer}
        >
          {GENERATION_TYPES.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.typeCard,
                currentType === type.id && styles.typeCardActive
              ]}
              onPress={() => setCreationType(type.id)}
            >
              <View style={[
                styles.typeIcon,
                currentType === type.id && styles.typeIconActive
              ]}>
                <Ionicons 
                  name={type.icon as any} 
                  size={24} 
                  color={currentType === type.id ? Colors.primary : Colors.text.secondary} 
                />
              </View>
              <Text 
                variant="body2" 
                color={currentType === type.id ? 'accent' : 'secondary'} 
                weight="medium"
                style={styles.typeName}
              >
                {type.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {currentTypeConfig && (
          <View style={styles.typeInfo}>
            <Text variant="body2" color="secondary" style={styles.typeDescription}>
              {currentTypeConfig.description}
            </Text>
            
            <View style={styles.typeFeatures}>
              {currentTypeConfig.requiresPrompt && (
                <View style={styles.featureTag}>
                  <Ionicons name="text" size={12} color={Colors.primary} />
                  <Text variant="caption" color="primary" weight="medium">
                    Text Input
                  </Text>
                </View>
              )}
              {currentTypeConfig.requiresImage && (
                <View style={styles.featureTag}>
                  <Ionicons name="image" size={12} color={Colors.primary} />
                  <Text variant="caption" color="primary" weight="medium">
                    Image Input
                  </Text>
                </View>
              )}
              {currentTypeConfig.isInstant && (
                <View style={styles.featureTag}>
                  <Ionicons name="flash" size={12} color={Colors.accent} />
                  <Text variant="caption" color="accent" weight="medium">
                    Instant
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}
      </View>
    );
  }, [currentType]);

  const renderPromptInput = useCallback(() => {
    const currentTypeConfig = GENERATION_TYPES.find(t => t.id === currentType);
    const maxLength = currentTypeConfig?.maxPromptLength || 500;
    
    return (
      <View style={styles.sectionContent}>
        <View style={styles.sectionHeader}>
          <Text variant="h6" color="primary" weight="semiBold">
            Prompt
          </Text>
          <Text variant="caption" color="tertiary">
            {prompt.length}/{maxLength}
          </Text>
        </View>
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.promptInput}
            placeholder={getPromptPlaceholder(currentType)}
            placeholderTextColor={Colors.input.placeholder}
            value={prompt}
            onChangeText={setPrompt}
            multiline
            maxLength={maxLength}
            textAlignVertical="top"
          />
        </View>
        
        {prompt.length > maxLength * 0.8 && (
          <Text variant="caption" color="warning" style={styles.characterWarning}>
            Approaching character limit
          </Text>
        )}
      </View>
    );
  }, [currentType, prompt]);

  const getPromptPlaceholder = (type: any) => {
    switch (type.id) {
      case 'text-to-video':
        return "A cinematic scene with dialogue: 'Hello world!' - include audio, camera movements, and detailed scene description...";
      case 'text-to-image':
        return "A photorealistic image of... with detailed lighting, composition, and style...";
      case 'image-to-image':
        return "Transform this image to... describe the desired changes and style...";
      default:
        return "Describe what you want to create...";
    }
  };

  const renderImageUpload = useCallback(() => {
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
      <View style={styles.sectionContent}>
        <View style={styles.sectionHeader}>
          <Text variant="h6" color="primary" weight="semiBold">
            {hasCharacterRef ? 'Input Image & Character Reference' : 'Input Image'}
          </Text>
          <Text variant="body2" color="secondary">
            Upload your source image
          </Text>
        </View>
        
        <View style={styles.uploadGrid}>
          {/* Main Image Upload */}
          <AnimatedTouchableOpacity
            style={[styles.uploadCard, animatedStyle]}
            entering={FadeInDown.delay(100).springify()}
            onPress={pickImage}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={1}
          >
            {selectedImage ? (
              <Image source={{ uri: selectedImage }} style={styles.uploadImage} contentFit="cover" />
            ) : (
              <View style={styles.uploadPlaceholder}>
                <Ionicons name="image" size={32} color={Colors.text.tertiary} />
                <Text variant="body2" color="secondary" weight="medium">
                  Upload Image
                </Text>
                <Text variant="caption" color="tertiary">
                  Tap to select
                </Text>
              </View>
            )}
            
            {selectedImage && (
              <TouchableOpacity style={styles.removeButton} onPress={clearImage}>
                <Ionicons name="close" size={16} color={Colors.text.primary} />
              </TouchableOpacity>
            )}
          </AnimatedTouchableOpacity>

          {/* Character Reference Upload (if needed) */}
          {hasCharacterRef && (
            <AnimatedTouchableOpacity
              style={[styles.uploadCard, animatedStyle]}
              entering={FadeInDown.delay(200).springify()}
              onPress={pickCharacterRef}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              activeOpacity={1}
            >
              {selectedCharacterRef ? (
                <Image source={{ uri: selectedCharacterRef }} style={styles.uploadImage} contentFit="cover" />
              ) : (
                <View style={styles.uploadPlaceholder}>
                  <Ionicons name="person" size={32} color={Colors.text.tertiary} />
                  <Text variant="body2" color="secondary" weight="medium">
                    Character Ref
                  </Text>
                  <Text variant="caption" color="tertiary">
                    Optional
                  </Text>
                </View>
              )}
              
              {selectedCharacterRef && (
                <TouchableOpacity style={styles.removeButton} onPress={clearCharacterRef}>
                  <Ionicons name="close" size={16} color={Colors.text.primary} />
                </TouchableOpacity>
              )}
            </AnimatedTouchableOpacity>
          )}
        </View>
      </View>
    );
  }, [selectedImage, selectedCharacterRef, hasCharacterRef]);

  const renderStyleSelector = () => {
    if (availableStyleOptions.length === 0) return null;

    return (
      <View style={styles.styleContainer}>
        <Text variant="h6" color="primary" weight="semiBold" style={styles.sectionTitle}>
          Style & Effects
        </Text>
        <View style={styles.stylesGrid}>
          {availableStyleOptions.map((style) => (
            <TouchableOpacity
              key={style.id}
              style={[
                styles.styleButton,
                selectedStyle === style.id && styles.styleButtonActive
              ]}
              onPress={() => setSelectedStyle(style.id)}
            >
              <Text 
                variant="body2" 
                color={selectedStyle === style.id ? 'primary' : 'secondary'}
                weight="medium"
              >
                {style.name}
              </Text>
              <Text 
                variant="caption" 
                color="tertiary"
                numberOfLines={1}
              >
                {style.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderQualitySelector = useCallback(() => {
    const options = QUALITY_OPTIONS[currentType] || [];
    
    return (
      <View style={styles.sectionContent}>
        <View style={styles.sectionHeader}>
          <Text variant="h6" color="primary" weight="semiBold">
            Quality & Settings
          </Text>
          <Text variant="body2" color="secondary">
            Choose your output preferences
          </Text>
        </View>
        
        <View style={styles.optionsGrid}>
          {options.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionCard,
                selectedQuality === option.id && styles.optionCardActive
              ]}
              onPress={() => setSelectedQuality(option.id)}
            >
              <View style={styles.optionHeader}>
                <Text 
                  variant="body1" 
                  color={selectedQuality === option.id ? 'accent' : 'primary'} 
                  weight="semiBold"
                >
                  {option.name}
                </Text>
                <View style={[
                  styles.creditsBadge,
                  selectedQuality === option.id && styles.creditsBadgeActive
                ]}>
                  <Ionicons name="diamond" size={12} color={selectedQuality === option.id ? Colors.primary : Colors.text.secondary} />
                  <Text 
                    variant="caption" 
                    color={selectedQuality === option.id ? 'accent' : 'secondary'} 
                    weight="bold"
                  >
                    {option.credits}
                  </Text>
                </View>
              </View>
              
              <Text variant="caption" color="secondary" style={styles.optionResolution}>
                {option.resolution}
              </Text>
              <Text variant="caption" color="tertiary" style={styles.optionDescription}>
                {option.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Aspect Ratio (for video) */}
        {isVideoGeneration && (
          <View style={styles.aspectRatioSection}>
            <Text variant="body1" color="primary" weight="medium" style={styles.aspectRatioTitle}>
              Aspect Ratio
            </Text>
            <View style={styles.aspectRatioGrid}>
              {ASPECT_RATIO_OPTIONS.map((ratio) => (
                <TouchableOpacity
                  key={ratio.id}
                  style={[
                    styles.aspectRatioCard,
                    aspectRatio === ratio.id && styles.aspectRatioCardActive
                  ]}
                  onPress={() => setAspectRatio(ratio.id)}
                >
                  <Text 
                    variant="body2" 
                    color={aspectRatio === ratio.id ? 'accent' : 'secondary'} 
                    weight="medium"
                  >
                    {ratio.name}
                  </Text>
                  <Text variant="caption" color="tertiary">
                    {ratio.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>
    );
  }, [currentType, selectedQuality, aspectRatio, isVideoGeneration]);

  const renderGenerateButton = useCallback(() => {
    const creditsNeeded = getCreditsNeeded();
    const canAfford = credits >= creditsNeeded;
    const buttonText = isBackgroundRemoval 
      ? `Remove Background (${creditsNeeded} credits)` 
      : `Generate ${isVideoGeneration ? 'Video' : 'Image'} (${creditsNeeded} credits)`;

    return (
      <View style={styles.generateSection}>
        <View style={styles.generateSummary}>
          <View style={styles.summaryRow}>
            <Text variant="body2" color="secondary">Total Cost:</Text>
            <View style={styles.creditsDisplay}>
              <Ionicons name="diamond" size={16} color={Colors.primary} />
              <Text variant="h6" color="accent" weight="bold">
                {creditsNeeded} credits
              </Text>
            </View>
          </View>
          
          <View style={styles.summaryRow}>
            <Text variant="body2" color="secondary">Your Balance:</Text>
            <Text variant="body2" color={canAfford ? "success" : "error"} weight="medium">
              {credits} credits
            </Text>
          </View>
        </View>

        <Button
          variant="gradient"
          size="large"
          fullWidth
          loading={isGenerating}
          disabled={!canGenerate || !canAfford}
          onPress={handleGenerate}
          style={styles.generateButton}
        >
          {buttonText}
        </Button>
        
        {!canAfford && (
          <Text variant="caption" color="error" style={styles.errorText}>
            Insufficient credits. You need {creditsNeeded - credits} more credits.
          </Text>
        )}
      </View>
    );
  }, [credits, isGenerating, canGenerate, isBackgroundRemoval, isVideoGeneration]);

  return (
    <LinearGradient colors={Colors.gradients.primary} style={styles.container}>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          
          <Text variant="navigationTitle" color="primary" weight="bold">
            Create
          </Text>
          
          <View style={styles.creditsContainer}>
            <Ionicons name="diamond" size={16} color={Colors.primary} />
            <Text variant="body1" color="primary" weight="bold">
              {credits}
            </Text>
          </View>
        </Animated.View>

        <KeyboardAvoidingView style={styles.content} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            
            <Animated.View entering={FadeInDown.delay(200).springify()}>
              <Card variant="elevated" style={styles.section}>
                {renderTypeSelector()}
              </Card>
            </Animated.View>

            {(needsPrompt || !isBackgroundRemoval) && (
              <Animated.View entering={FadeInDown.delay(300).springify()}>
                <Card variant="elevated" style={styles.section}>
                  {renderPromptInput()}
                </Card>
              </Animated.View>
            )}

            {(needsImage || hasCharacterRef) && (
              <Animated.View entering={FadeInDown.delay(400).springify()}>
                <Card variant="elevated" style={styles.section}>
                  {renderImageUpload()}
                </Card>
              </Animated.View>
            )}

            <Animated.View entering={FadeInDown.delay(500).springify()}>
              <Card variant="elevated" style={styles.section}>
                {renderQualitySelector()}
              </Card>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(600).springify()}>
              {renderGenerateButton()}
            </Animated.View>

            <View style={styles.bottomSpacing} />
          </ScrollView>
        </KeyboardAvoidingView>
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
  scrollView: {
    flex: 1,
  },
  section: {
    marginHorizontal: Layout.screenPadding,
    marginBottom: Spacing.lg,
  },
  sectionContent: {
    gap: Spacing.md,
  },
  sectionHeader: {
    gap: Spacing.xs,
  },
  typeScrollContainer: {
    paddingVertical: Spacing.xs,
    gap: Spacing.sm,
  },
  typeCard: {
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Layout.borderRadius.lg,
    backgroundColor: Colors.surface.secondary,
    minWidth: 100,
    gap: Spacing.sm,
  },
  typeCardActive: {
    backgroundColor: Colors.surface.primary,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  typeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surface.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeIconActive: {
    backgroundColor: Colors.primary + '20',
  },
  typeName: {
    textAlign: 'center',
  },
  typeInfo: {
    gap: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.surface.secondary,
    borderRadius: Layout.borderRadius.md,
  },
  typeDescription: {
    lineHeight: 20,
  },
  typeFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  featureTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface.tertiary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Layout.borderRadius.sm,
    gap: Spacing.xs,
  },
  inputContainer: {
    borderRadius: Layout.borderRadius.lg,
    backgroundColor: Colors.input.background,
    borderWidth: 1,
    borderColor: Colors.input.border,
    overflow: 'hidden',
  },
  promptInput: {
    padding: Spacing.md,
    color: Colors.input.text,
    fontSize: 16,
    minHeight: 100,
    maxHeight: 150,
  },
  characterWarning: {
    textAlign: 'right',
  },
  uploadGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  uploadCard: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: Layout.borderRadius.lg,
    backgroundColor: Colors.surface.secondary,
    overflow: 'hidden',
    position: 'relative',
  },
  uploadImage: {
    width: '100%',
    height: '100%',
  },
  uploadPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
  },
  removeButton: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionsGrid: {
    gap: Spacing.sm,
  },
  optionCard: {
    padding: Spacing.md,
    backgroundColor: Colors.surface.secondary,
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border.primary,
  },
  optionCardActive: {
    backgroundColor: Colors.surface.primary,
    borderColor: Colors.primary,
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  creditsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface.tertiary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Layout.borderRadius.sm,
    gap: Spacing.xs,
  },
  creditsBadgeActive: {
    backgroundColor: Colors.primary + '20',
  },
  optionResolution: {
    marginBottom: Spacing.xs,
  },
  optionDescription: {
    lineHeight: 16,
  },
  aspectRatioSection: {
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
  aspectRatioTitle: {
    marginBottom: Spacing.xs,
  },
  aspectRatioGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  aspectRatioCard: {
    flex: 1,
    minWidth: '48%',
    padding: Spacing.md,
    backgroundColor: Colors.surface.secondary,
    borderRadius: Layout.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border.primary,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  aspectRatioCardActive: {
    backgroundColor: Colors.surface.primary,
    borderColor: Colors.primary,
  },
  generateSection: {
    marginHorizontal: Layout.screenPadding,
    gap: Spacing.md,
  },
  generateSummary: {
    backgroundColor: Colors.surface.secondary,
    padding: Spacing.md,
    borderRadius: Layout.borderRadius.lg,
    gap: Spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  creditsDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  generateButton: {
    marginTop: Spacing.sm,
  },
  errorText: {
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  bottomSpacing: {
    height: Spacing['4xl'],
  },
}); 