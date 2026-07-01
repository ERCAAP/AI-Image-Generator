import { Dimensions, Platform } from 'react-native';
import {
    heightPercentageToDP as hp,
    listenOrientationChange,
    removeOrientationListener,
    widthPercentageToDP as wp
} from 'react-native-responsive-screen';

// Get screen dimensions
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Device type detection for better responsive design
const isTablet = screenWidth >= 768;
const isSmallPhone = screenWidth < 375;
const isMediumPhone = screenWidth >= 375 && screenWidth < 414;
const isLargePhone = screenWidth >= 414 && screenWidth < 768;

// Responsive multipliers based on device type
const getMultiplier = () => {
  if (isTablet) return 1.3;
  if (isLargePhone) return 1.1;
  if (isMediumPhone) return 1.0;
  if (isSmallPhone) return 0.9;
  return 1.0;
};

const multiplier = getMultiplier();

// Base spacing unit (responsive 8px system)
const BASE_UNIT = wp(2) * multiplier; // Responsive base unit

// Responsive spacing system
export const Spacing = {
  xs: BASE_UNIT * 0.5, // ~4px responsive
  sm: BASE_UNIT, // ~8px responsive
  md: BASE_UNIT * 2, // ~16px responsive
  lg: BASE_UNIT * 3, // ~24px responsive
  xl: BASE_UNIT * 4, // ~32px responsive
  '2xl': BASE_UNIT * 6, // ~48px responsive
  '3xl': BASE_UNIT * 8, // ~64px responsive
  '4xl': BASE_UNIT * 12, // ~96px responsive
} as const;

// Responsive layout dimensions
export const Layout = {
  // Screen padding (responsive)
  screenPadding: wp(4) * multiplier,
  screenPaddingVertical: hp(3) * multiplier,
  
  // Component padding (responsive)
  cardPadding: wp(4) * multiplier,
  buttonPadding: wp(4) * multiplier,
  inputPadding: wp(4) * multiplier,
  
  // Component margins (responsive)
  componentMargin: wp(2) * multiplier,
  sectionMargin: wp(8) * multiplier,
  
  // Heights (responsive)
  buttonHeight: hp(6) * multiplier,
  inputHeight: hp(6.5) * multiplier,
  tabBarHeight: hp(isTablet ? 8 : 10),
  headerHeight: hp(isTablet ? 10 : 12),
  cardMinHeight: hp(isTablet ? 12 : 15),
  
  // Widths (responsive)
  maxContentWidth: wp(isTablet ? 85 : 90),
  cardWidth: wp(isTablet ? 80 : 85),
  buttonWidth: wp(isTablet ? 70 : 80),
  modalWidth: wp(isTablet ? 60 : 90),
  
  // Icon sizes (responsive)
  iconSize: {
    xs: wp(3) * multiplier, // ~12px
    sm: wp(4) * multiplier, // ~16px
    md: wp(5) * multiplier, // ~20px
    lg: wp(6) * multiplier, // ~24px
    xl: wp(8) * multiplier, // ~32px
    '2xl': wp(12) * multiplier, // ~48px
  },
  
  // Border radius (responsive)
  borderRadius: {
    xs: wp(1) * multiplier, // ~4px
    sm: wp(2) * multiplier, // ~8px
    md: wp(3) * multiplier, // ~12px
    lg: wp(4) * multiplier, // ~16px
    xl: wp(6) * multiplier, // ~24px
    '2xl': wp(8) * multiplier, // ~32px
    full: wp(50), // Very large radius for circular
  },
  
  // Grid system (responsive)
  grid: {
    columns: isTablet ? 4 : 2,
    gap: wp(2) * multiplier,
    itemWidth: isTablet ? '23%' : '48%',
    itemHeight: hp(isTablet ? 25 : 20),
  },
  
  // Elevation/Shadow
  elevation: {
    none: 0,
    sm: 2,
    md: 4,
    lg: 8,
    xl: 16,
  },
  
  // Z-index layers
  zIndex: {
    base: 0,
    dropdown: 10,
    overlay: 20,
    modal: 30,
    popover: 40,
    tooltip: 50,
    toast: 60,
  },
} as const;

// Responsive safe area helpers
export const SafeArea = {
  top: hp(isTablet ? 4 : 6),
  bottom: hp(isTablet ? 3 : 4),
  horizontal: wp(isTablet ? 6 : 4),
} as const;

// Animation durations (responsive)
export const Animation = {
  fast: isTablet ? 100 : 150,
  normal: isTablet ? 200 : 300,
  slow: isTablet ? 400 : 500,
  verySlow: isTablet ? 800 : 1000,
} as const;

// Device breakpoints
export const Breakpoints = {
  sm: 375, // iPhone SE
  md: 414, // iPhone 11/12/13/14
  lg: 430, // iPhone 14 Pro Max
  xl: 768, // iPad Mini
  '2xl': 1024, // iPad Pro
  '3xl': 1366, // Large tablets
} as const;

// Responsive font scaling
export const FontScale = {
  xs: wp(isTablet ? 2.5 : 3),
  sm: wp(isTablet ? 3 : 3.5),
  md: wp(isTablet ? 3.5 : 4),
  lg: wp(isTablet ? 4 : 4.5),
  xl: wp(isTablet ? 5 : 6),
  '2xl': wp(isTablet ? 6 : 8),
  '3xl': wp(isTablet ? 8 : 10),
} as const;

// Platform-specific adjustments
export const PlatformSpacing = {
  android: {
    statusBarHeight: hp(3),
    navigationBarHeight: hp(7),
  },
  ios: {
    statusBarHeight: hp(4),
    navigationBarHeight: hp(8),
  },
} as const;

// Helper functions for responsive design
export const responsive = {
  // Get responsive width
  width: (percentage: number) => wp(percentage) * multiplier,
  
  // Get responsive height  
  height: (percentage: number) => hp(percentage) * multiplier,
  
  // Get responsive font size
  fontSize: (size: keyof typeof FontScale) => FontScale[size],
  
  // Check if device is tablet
  isTablet: () => isTablet,
  
  // Check if device is small phone
  isSmallDevice: () => isSmallPhone,
  
  // Get platform-specific spacing
  platformSpacing: () => Platform.OS === 'ios' ? PlatformSpacing.ios : PlatformSpacing.android,
  
  // Listen to orientation changes
  listenToOrientationChanges: () => listenOrientationChange,
  removeOrientationListener: () => removeOrientationListener,
};

// Export everything for external use
export {
    hp, isLargePhone, isMediumPhone, isSmallPhone, isTablet, multiplier, screenHeight, screenWidth, wp
};

export type SpacingKey = keyof typeof Spacing;
export type LayoutKey = keyof typeof Layout;
export type SafeAreaKey = keyof typeof SafeArea;
export type FontScaleKey = keyof typeof FontScale;