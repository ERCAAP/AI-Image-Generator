import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated';

/**
 * Configure Reanimated logger to reduce warnings in development
 * This helps clean up the console output by disabling strict mode warnings
 */
export const configureReanimated = () => {
  try {
    configureReanimatedLogger({
      level: ReanimatedLogLevel.warn,
      strict: false, // Disable strict mode to reduce warnings
    });
    console.log('✅ Reanimated logger configured');
  } catch (error) {
    console.warn('⚠️ Failed to configure Reanimated logger:', error);
  }
};