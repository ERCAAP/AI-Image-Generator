import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  ActivityIndicator,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewStyle,
} from 'react-native';
import { Colors, Layout, Spacing, responsive } from '../../constants';
import { Text } from './Text';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'gradient' | 'outline' | 'apple';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle | ViewStyle[];
  textStyle?: any;
  fullWidth?: boolean;
  children: React.ReactNode;
}

const getButtonStyle = (
  variant: ButtonVariant, 
  size: ButtonSize, 
  disabled: boolean,
  fullWidth: boolean
): ViewStyle => {
  const baseStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Layout.borderRadius.lg,
    opacity: disabled ? 0.5 : 1,
    width: fullWidth ? '100%' : undefined,
  };

  // Size-specific styles
  switch (size) {
    case 'small':
      baseStyle.paddingHorizontal = responsive.width(4);
      baseStyle.paddingVertical = responsive.height(1.5);
      baseStyle.minHeight = responsive.height(5);
      break;
    case 'medium':
      baseStyle.paddingHorizontal = responsive.width(6);
      baseStyle.paddingVertical = responsive.height(2);
      baseStyle.minHeight = responsive.height(6);
      break;
    case 'large':
      baseStyle.paddingHorizontal = responsive.width(8);
      baseStyle.paddingVertical = responsive.height(2.5);
      baseStyle.minHeight = Layout.buttonHeight;
      break;
  }

  // Variant-specific styles
  switch (variant) {
    case 'apple':
      baseStyle.backgroundColor = Colors.text.primary;
      break;
    case 'primary':
      baseStyle.backgroundColor = Colors.primary;
      break;
    case 'secondary':
      baseStyle.backgroundColor = Colors.surface.secondary;
      baseStyle.borderWidth = 1;
      baseStyle.borderColor = Colors.border.primary;
      break;
    case 'outline':
      baseStyle.backgroundColor = 'transparent';
      baseStyle.borderWidth = 1;
      baseStyle.borderColor = Colors.border.primary;
      break;
    case 'ghost':
      baseStyle.backgroundColor = 'transparent';
      break;
    case 'gradient':
      // Gradient will be handled by LinearGradient component
      baseStyle.backgroundColor = 'transparent';
      break;
  }

  return baseStyle;
};

const getTextColor = (variant: ButtonVariant, disabled: boolean): string => {
  if (disabled) return Colors.text.disabled;
  
  switch (variant) {
    case 'apple':
      return '#FFFFFF'; // White text on black button
    case 'primary':
    case 'gradient':
      return Colors.text.primary;
    case 'secondary':
    case 'outline':
      return Colors.text.primary;
    case 'ghost':
      return Colors.primary;
    default:
      return Colors.text.primary;
  }
};

const getTextSize = (size: ButtonSize): 'body2' | 'button' | 'h6' => {
  switch (size) {
    case 'small':
      return 'body2';
    case 'medium':
      return 'button';
    case 'large':
      return 'h6';
    default:
      return 'button';
  }
};

export function Button({
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
  fullWidth = false,
  children,
  onPress,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const buttonStyle = getButtonStyle(variant, size, isDisabled, fullWidth);
  const textColor = getTextColor(variant, isDisabled);
  const textVariant = getTextSize(size);
  
  const renderContent = () => (
    <>
      {loading ? (
        <ActivityIndicator 
          size={size === 'small' ? 'small' : 'small'} 
          color={textColor}
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <View style={{ marginRight: children ? Spacing.sm : 0 }}>{icon}</View>
          )}
          
          {children && (
            <Text 
              variant={textVariant}
              color={textColor === Colors.text.primary ? 'primary' : 'accent'}
              weight="semiBold"
              style={textStyle}
            >
              {children}
            </Text>
          )}
          
          {icon && iconPosition === 'right' && (
            <View style={{ marginLeft: children ? Spacing.sm : 0 }}>{icon}</View>
          )}
        </>
      )}
    </>
  );

  const handlePress = (event: any) => {
    if (!isDisabled && onPress) {
      onPress(event);
    }
  };

  if (variant === 'gradient') {
    return (
      <TouchableOpacity
        onPress={handlePress}
        disabled={isDisabled}
        activeOpacity={0.8}
        style={[style]}
        {...props}
      >
        <LinearGradient
          colors={isDisabled ? [Colors.surface.secondary, Colors.surface.secondary] : Colors.gradients.button}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={buttonStyle}
        >
          {renderContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={[buttonStyle, style]}
      {...props}
    >
      {renderContent()}
    </TouchableOpacity>
  );
}

// Convenience components
export const PrimaryButton = (props: Omit<ButtonProps, 'variant'>) => (
  <Button variant="primary" {...props} />
);

export const SecondaryButton = (props: Omit<ButtonProps, 'variant'>) => (
  <Button variant="secondary" {...props} />
);

export const GhostButton = (props: Omit<ButtonProps, 'variant'>) => (
  <Button variant="ghost" {...props} />
);

export const GradientButton = (props: Omit<ButtonProps, 'variant'>) => (
  <Button variant="gradient" {...props} />
);

export const SmallButton = (props: Omit<ButtonProps, 'size'>) => (
  <Button size="small" {...props} />
);

export const LargeButton = (props: Omit<ButtonProps, 'size'>) => (
  <Button size="large" {...props} />
);

export default Button;