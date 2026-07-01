import React from 'react';
import { Text as RNText, TextProps as RNTextProps, TextStyle } from 'react-native';
import { Colors } from '../../constants/colors';
import { Typography, TypographyVariant, getResponsiveText } from '../../constants/typography';

type ColorVariant = 
  | 'primary' 
  | 'secondary' 
  | 'tertiary' 
  | 'accent' 
  | 'success' 
  | 'warning' 
  | 'error' 
  | 'disabled';

interface TextProps extends Omit<RNTextProps, 'style'> {
  variant?: TypographyVariant;
  color?: ColorVariant;
  style?: TextStyle | TextStyle[];
  align?: 'left' | 'center' | 'right' | 'justify';
  weight?: 'light' | 'regular' | 'medium' | 'semiBold' | 'bold' | 'extraBold';
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  uppercase?: boolean;
  lowercase?: boolean;
  responsive?: boolean; // Enable responsive scaling
}

const getTextColor = (color: ColorVariant): string => {
  switch (color) {
    case 'primary':
      return Colors.text.primary;
    case 'secondary':
      return Colors.text.secondary;
    case 'tertiary':
      return Colors.text.tertiary;
    case 'accent':
      return Colors.text.accent;
    case 'success':
      return Colors.text.success;
    case 'warning':
      return Colors.text.warning;
    case 'error':
      return Colors.text.error;
    case 'disabled':
      return Colors.text.disabled;
    default:
      return Colors.text.primary;
  }
};

const getFontWeight = (weight?: TextProps['weight']): string => {
  switch (weight) {
    case 'light':
      return '300';
    case 'regular':
      return '400';
    case 'medium':
      return '500';
    case 'semiBold':
      return '600';
    case 'bold':
      return '700';
    case 'extraBold':
      return '800';
    default:
      return '400';
  }
};

export function Text({
  variant = 'body1',
  color = 'primary',
  align = 'left',
  weight,
  italic = false,
  underline = false,
  strikethrough = false,
  uppercase = false,
  lowercase = false,
  responsive = true,
  style,
  children,
  ...props
}: TextProps) {
  // Get base typography style
  const baseStyle = responsive ? getResponsiveText(variant) : Typography[variant];
  
  // Build computed style
  const computedStyle: TextStyle = {
    ...baseStyle,
    color: getTextColor(color),
    textAlign: align,
    fontStyle: italic ? 'italic' : 'normal',
    textDecorationLine: (() => {
      const decorations: Array<'underline' | 'line-through'> = [];
      if (underline) decorations.push('underline');
      if (strikethrough) decorations.push('line-through');
      return decorations.length > 0 ? decorations.join(' ') as TextStyle['textDecorationLine'] : 'none';
    })(),
    textTransform: (() => {
      if (uppercase) return 'uppercase';
      if (lowercase) return 'lowercase';
      return variant === 'overline' ? 'uppercase' : 'none';
    })(),
  };

  // Override font weight if specified
  if (weight) {
    computedStyle.fontWeight = getFontWeight(weight) as TextStyle['fontWeight'];
  }

  // Combine with custom styles
  const finalStyle = [computedStyle, style].filter(Boolean);

  return (
    <RNText style={finalStyle} {...props}>
      {children}
    </RNText>
  );
}

// Convenience components for common text variants
export const Heading1 = (props: Omit<TextProps, 'variant'>) => (
  <Text variant="h1" {...props} />
);

export const Heading2 = (props: Omit<TextProps, 'variant'>) => (
  <Text variant="h2" {...props} />
);

export const Heading3 = (props: Omit<TextProps, 'variant'>) => (
  <Text variant="h3" {...props} />
);

export const Heading4 = (props: Omit<TextProps, 'variant'>) => (
  <Text variant="h4" {...props} />
);

export const Heading5 = (props: Omit<TextProps, 'variant'>) => (
  <Text variant="h5" {...props} />
);

export const Heading6 = (props: Omit<TextProps, 'variant'>) => (
  <Text variant="h6" {...props} />
);

export const Body = (props: Omit<TextProps, 'variant'>) => (
  <Text variant="body1" {...props} />
);

export const BodySmall = (props: Omit<TextProps, 'variant'>) => (
  <Text variant="body2" {...props} />
);

export const Caption = (props: Omit<TextProps, 'variant'>) => (
  <Text variant="caption" {...props} />
);

export const Overline = (props: Omit<TextProps, 'variant'>) => (
  <Text variant="overline" {...props} />
);

export const ButtonText = (props: Omit<TextProps, 'variant'>) => (
  <Text variant="button" {...props} />
);

export const MonoText = (props: Omit<TextProps, 'variant'>) => (
  <Text variant="mono" {...props} />
);

// Display text with enhanced styling
export const DisplayText = (props: Omit<TextProps, 'variant'>) => (
  <Text variant="display" {...props} />
);

// Navigation title with proper styling
export const NavigationTitle = (props: Omit<TextProps, 'variant'>) => (
  <Text variant="navigationTitle" {...props} />
);

// Credit amount with special styling
export const CreditAmount = (props: Omit<TextProps, 'variant'>) => (
  <Text variant="creditAmount" {...props} />
);

export default Text; 