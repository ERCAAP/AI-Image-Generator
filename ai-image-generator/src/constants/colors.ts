export const Colors = {
  // Primary Brand Colors
  primary: '#6C5CE7',
  primaryDark: '#5A4FCF',
  primaryLight: '#8B7EED',
  
  // Accent Colors
  accent: '#FF6B6B',
  accentDark: '#FF5252',
  accentLight: '#FF8A80',
  
  // Background Colors (Dark Theme) - Updated to match mockup
  background: {
    primary: '#000000',
    secondary: '#0A0A0A',
    tertiary: '#1A1A1A',
    card: '#1F1F1F',
    overlay: 'rgba(0, 0, 0, 0.85)',
  },
  
  // Gradient Backgrounds - Enhanced for better visual hierarchy
  gradients: {
    primary: ['#000000', '#0A0A0A', '#1A1A1A'],
    secondary: ['#0A0A0A', '#1F1F1F', '#2A2A2A'],
    accent: ['#6C5CE7', '#8B7EED', '#A78BFA'],
    card: ['#0F0F0F', '#1A1A1A'],
    overlay: ['rgba(0, 0, 0, 0.95)', 'rgba(0, 0, 0, 0.7)'],
    button: ['#6C5CE7', '#5A4FCF'],
  },
  
  // Text Colors - Improved contrast for better readability
  text: {
    primary: '#FFFFFF',
    secondary: '#B8B8B8',
    tertiary: '#888888',
    disabled: '#4A4A4A',
    accent: '#6C5CE7',
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
  },
  
  // Surface Colors - Better layering system
  surface: {
    primary: '#111111',
    secondary: '#1A1A1A',
    tertiary: '#2A2A2A',
    elevated: '#333333',
    overlay: 'rgba(255, 255, 255, 0.05)',
  },
  
  // Border Colors - Subtle but visible borders
  border: {
    primary: '#2A2A2A',
    secondary: '#1A1A1A',
    accent: '#6C5CE7',
    focus: '#8B7EED',
    disabled: '#111111',
  },
  
  // Status Colors
  status: {
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    info: '#2196F3',
    processing: '#6C5CE7',
  },
  
  // Button Colors - Enhanced for better interaction
  button: {
    primary: '#6C5CE7',
    primaryPressed: '#5A4FCF',
    secondary: '#1A1A1A',
    secondaryPressed: '#2A2A2A',
    ghost: 'transparent',
    ghostPressed: 'rgba(255, 255, 255, 0.05)',
    disabled: '#0A0A0A',
  },
  
  // Input Colors
  input: {
    background: '#1A1A1A',
    border: '#2A2A2A',
    borderFocus: '#6C5CE7',
    placeholder: '#888888',
    text: '#FFFFFF',
  },
  
  // iOS System Colors (adapted for dark theme)
  system: {
    blue: '#007AFF',
    green: '#34C759',
    orange: '#FF9500',
    red: '#FF3B30',
    yellow: '#FFCC00',
    purple: '#AF52DE',
    pink: '#FF2D92',
    teal: '#5AC8FA',
  },
} as const;

export type ColorKey = keyof typeof Colors;
export type ColorValue = typeof Colors[ColorKey]; 