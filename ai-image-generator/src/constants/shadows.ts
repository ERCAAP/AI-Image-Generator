import { Platform } from 'react-native';

// iOS-style shadows
export const Shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  
  sm: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.18,
      shadowRadius: 1.0,
    },
    android: {
      elevation: 1,
    },
    default: {},
  }),
  
  md: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.23,
      shadowRadius: 2.62,
    },
    android: {
      elevation: 4,
    },
    default: {},
  }),
  
  lg: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.27,
      shadowRadius: 4.65,
    },
    android: {
      elevation: 8,
    },
    default: {},
  }),
  
  xl: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.30,
      shadowRadius: 6.27,
    },
    android: {
      elevation: 12,
    },
    default: {},
  }),
  
  '2xl': Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.34,
      shadowRadius: 8.30,
    },
    android: {
      elevation: 16,
    },
    default: {},
  }),
  
  // Special card shadow
  card: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
    android: {
      elevation: 4,
    },
    default: {},
  }),
  
  // Button shadows
  button: Platform.select({
    ios: {
      shadowColor: '#6C5CE7',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },
    android: {
      elevation: 6,
    },
    default: {},
  }),
  
  // Floating action button
  fab: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
    },
    android: {
      elevation: 8,
    },
    default: {},
  }),
} as const;

export type ShadowKey = keyof typeof Shadows; 