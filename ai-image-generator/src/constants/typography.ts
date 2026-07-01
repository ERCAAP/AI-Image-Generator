import { Platform } from 'react-native';
import {
    widthPercentageToDP as wp
} from 'react-native-responsive-screen';
import { isTablet, multiplier } from './spacing';

// Font families with better platform support
export const FontFamily = {
  regular: Platform.select({
    ios: 'SF Pro Display',
    android: 'Roboto',
    default: 'System',
  }),
  medium: Platform.select({
    ios: 'SF Pro Display',
    android: 'Roboto-Medium',
    default: 'System',
  }),
  semiBold: Platform.select({
    ios: 'SF Pro Display',
    android: 'Roboto-Bold',
    default: 'System',
  }),
  bold: Platform.select({
    ios: 'SF Pro Display',
    android: 'Roboto-Bold',
    default: 'System',
  }),
  mono: Platform.select({
    ios: 'SF Mono',
    android: 'monospace',
    default: 'monospace',
  }),
} as const;

// Responsive font sizing system
const responsiveFontSize = (baseSize: number) => {
  if (isTablet) {
    return wp(baseSize * 0.8); // Tablets get slightly smaller relative font sizes
  }
  return wp(baseSize) * multiplier;
};

// Typography scale (responsive)
export const FontSizes = {
  // Display sizes
  display: responsiveFontSize(12), // ~48px
  
  // Heading sizes
  h1: responsiveFontSize(8), // ~32px
  h2: responsiveFontSize(7), // ~28px
  h3: responsiveFontSize(6), // ~24px
  h4: responsiveFontSize(5.5), // ~22px
  h5: responsiveFontSize(5), // ~20px
  h6: responsiveFontSize(4.5), // ~18px
  
  // Body sizes
  body1: responsiveFontSize(4), // ~16px
  body2: responsiveFontSize(3.5), // ~14px
  
  // Smaller sizes
  caption: responsiveFontSize(3), // ~12px
  overline: responsiveFontSize(2.5), // ~10px
  
  // Specialized sizes
  button: responsiveFontSize(4), // ~16px
  input: responsiveFontSize(4), // ~16px
  navigationTitle: responsiveFontSize(5), // ~20px
  creditAmount: responsiveFontSize(4.5), // ~18px
  mono: responsiveFontSize(3.5), // ~14px
} as const;

// Line heights (responsive)
const responsiveLineHeight = (fontSize: number, ratio: number = 1.5) => {
  return fontSize * ratio;
};

export const LineHeights = {
  display: responsiveLineHeight(FontSizes.display, 1.2),
  h1: responsiveLineHeight(FontSizes.h1, 1.3),
  h2: responsiveLineHeight(FontSizes.h2, 1.3),
  h3: responsiveLineHeight(FontSizes.h3, 1.4),
  h4: responsiveLineHeight(FontSizes.h4, 1.4),
  h5: responsiveLineHeight(FontSizes.h5, 1.4),
  h6: responsiveLineHeight(FontSizes.h6, 1.4),
  body1: responsiveLineHeight(FontSizes.body1, 1.5),
  body2: responsiveLineHeight(FontSizes.body2, 1.5),
  caption: responsiveLineHeight(FontSizes.caption, 1.4),
  overline: responsiveLineHeight(FontSizes.overline, 1.4),
  button: responsiveLineHeight(FontSizes.button, 1.2),
  input: responsiveLineHeight(FontSizes.input, 1.3),
  navigationTitle: responsiveLineHeight(FontSizes.navigationTitle, 1.2),
  creditAmount: responsiveLineHeight(FontSizes.creditAmount, 1.3),
  mono: responsiveLineHeight(FontSizes.mono, 1.4),
} as const;

// Font weights
export const FontWeights = {
  light: '300' as const,
  regular: '400' as const,
  medium: '500' as const,
  semiBold: '600' as const,
  bold: '700' as const,
  extraBold: '800' as const,
} as const;

// Letter spacing (responsive)
const responsiveLetterSpacing = (size: number) => {
  return size * 0.02; // 2% of font size
};

export const LetterSpacing = {
  tight: responsiveLetterSpacing(FontSizes.body1) * -1,
  normal: 0,
  wide: responsiveLetterSpacing(FontSizes.body1),
  wider: responsiveLetterSpacing(FontSizes.body1) * 2,
} as const;

// Complete typography styles
export const Typography = {
  display: {
    fontSize: FontSizes.display,
    lineHeight: LineHeights.display,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeights.bold,
    letterSpacing: LetterSpacing.tight,
  },
  h1: {
    fontSize: FontSizes.h1,
    lineHeight: LineHeights.h1,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeights.bold,
    letterSpacing: LetterSpacing.tight,
  },
  h2: {
    fontSize: FontSizes.h2,
    lineHeight: LineHeights.h2,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeights.bold,
    letterSpacing: LetterSpacing.tight,
  },
  h3: {
    fontSize: FontSizes.h3,
    lineHeight: LineHeights.h3,
    fontFamily: FontFamily.semiBold,
    fontWeight: FontWeights.semiBold,
    letterSpacing: LetterSpacing.normal,
  },
  h4: {
    fontSize: FontSizes.h4,
    lineHeight: LineHeights.h4,
    fontFamily: FontFamily.semiBold,
    fontWeight: FontWeights.semiBold,
    letterSpacing: LetterSpacing.normal,
  },
  h5: {
    fontSize: FontSizes.h5,
    lineHeight: LineHeights.h5,
    fontFamily: FontFamily.semiBold,
    fontWeight: FontWeights.semiBold,
    letterSpacing: LetterSpacing.normal,
  },
  h6: {
    fontSize: FontSizes.h6,
    lineHeight: LineHeights.h6,
    fontFamily: FontFamily.medium,
    fontWeight: FontWeights.medium,
    letterSpacing: LetterSpacing.normal,
  },
  body1: {
    fontSize: FontSizes.body1,
    lineHeight: LineHeights.body1,
    fontFamily: FontFamily.regular,
    fontWeight: FontWeights.regular,
    letterSpacing: LetterSpacing.normal,
  },
  body2: {
    fontSize: FontSizes.body2,
    lineHeight: LineHeights.body2,
    fontFamily: FontFamily.regular,
    fontWeight: FontWeights.regular,
    letterSpacing: LetterSpacing.normal,
  },
  caption: {
    fontSize: FontSizes.caption,
    lineHeight: LineHeights.caption,
    fontFamily: FontFamily.regular,
    fontWeight: FontWeights.regular,
    letterSpacing: LetterSpacing.wide,
  },
  overline: {
    fontSize: FontSizes.overline,
    lineHeight: LineHeights.overline,
    fontFamily: FontFamily.medium,
    fontWeight: FontWeights.medium,
    letterSpacing: LetterSpacing.wider,
    textTransform: 'uppercase' as const,
  },
  button: {
    fontSize: FontSizes.button,
    lineHeight: LineHeights.button,
    fontFamily: FontFamily.semiBold,
    fontWeight: FontWeights.semiBold,
    letterSpacing: LetterSpacing.normal,
  },
  input: {
    fontSize: FontSizes.input,
    lineHeight: LineHeights.input,
    fontFamily: FontFamily.regular,
    fontWeight: FontWeights.regular,
    letterSpacing: LetterSpacing.normal,
  },
  navigationTitle: {
    fontSize: FontSizes.navigationTitle,
    lineHeight: LineHeights.navigationTitle,
    fontFamily: FontFamily.semiBold,
    fontWeight: FontWeights.semiBold,
    letterSpacing: LetterSpacing.normal,
  },
  creditAmount: {
    fontSize: FontSizes.creditAmount,
    lineHeight: LineHeights.creditAmount,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeights.bold,
    letterSpacing: LetterSpacing.normal,
  },
  mono: {
    fontSize: FontSizes.mono,
    lineHeight: LineHeights.mono,
    fontFamily: FontFamily.mono,
    fontWeight: FontWeights.regular,
    letterSpacing: LetterSpacing.normal,
  },
} as const;

// Responsive text scaling helper
export const getResponsiveText = (variant: keyof typeof Typography) => {
  return Typography[variant];
};

// Accessibility text sizes
export const AccessibilityTextSizes = {
  extraSmall: FontSizes.caption * 0.8,
  small: FontSizes.caption,
  medium: FontSizes.body2,
  large: FontSizes.body1 * 1.2,
  extraLarge: FontSizes.h6 * 1.3,
} as const;

// Export types
export type FontSizeKey = keyof typeof FontSizes;
export type TypographyVariant = keyof typeof Typography;
export type FontWeight = keyof typeof FontWeights;
export type FontFamily = keyof typeof FontFamily;