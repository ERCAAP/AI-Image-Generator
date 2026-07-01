import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { View, ViewProps, ViewStyle } from 'react-native';
import { Colors, Layout, Shadows } from '../../constants';

type CardVariant = 'elevated' | 'outlined' | 'filled' | 'gradient';

interface CardProps extends Omit<ViewProps, 'style'> {
  variant?: CardVariant;
  padding?: number;
  children: React.ReactNode;
  style?: ViewStyle;
}

export function Card({
  variant = 'elevated',
  padding = Layout.cardPadding,
  children,
  style,
  ...props
}: CardProps) {

  const baseStyle: ViewStyle = {
    borderRadius: Layout.borderRadius.lg,
    padding: padding,
  };

  const variantStyles: Record<CardVariant, ViewStyle> = {
    elevated: {
      backgroundColor: Colors.surface.primary,
      ...Shadows.card,
    },
    outlined: {
      backgroundColor: Colors.surface.primary,
      borderWidth: 1,
      borderColor: Colors.border.primary,
    },
    filled: {
      backgroundColor: Colors.surface.secondary,
    },
    gradient: {
      // Gradient will be handled by LinearGradient wrapper
    },
  };

  const cardStyle = [baseStyle, variantStyles[variant], style];

  if (variant === 'gradient') {
    return (
      <LinearGradient
        colors={Colors.gradients.card}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={cardStyle}
        {...props}
      >
        {children}
      </LinearGradient>
    );
  }

  return (
    <View style={cardStyle} {...props}>
      {children}
    </View>
  );
} 