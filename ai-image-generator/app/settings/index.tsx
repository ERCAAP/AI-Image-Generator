import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import {
    Alert,
    Linking,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Text } from '../../src/components/common';
import { Colors, Layout, Spacing } from '../../src/constants';
import { useUserManagement } from '../../src/hooks/useUserManagement';
import { useUserStore } from '../../src/store/userStore';

interface SettingsItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  value?: string;
  showArrow?: boolean;
  showSwitch?: boolean;
  switchValue?: boolean;
  onPress?: () => void;
  onSwitchToggle?: (value: boolean) => void;
  destructive?: boolean;
}

function SettingsItem({
  icon,
  title,
  subtitle,
  value,
  showArrow = true,
  showSwitch = false,
  switchValue = false,
  onPress,
  onSwitchToggle,
  destructive = false,
}: SettingsItemProps) {
  return (
    <TouchableOpacity
      style={styles.settingsItem}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingsContent}>
        <View style={[styles.iconContainer, destructive && styles.destructiveIcon]}>
          <Ionicons
            name={icon}
            size={20}
            color={destructive ? Colors.status.error : Colors.text.secondary}
          />
        </View>
        
        <View style={styles.settingsText}>
          <Text
            variant="body1"
            color={destructive ? 'error' : 'primary'}
          >
            {title}
          </Text>
          {subtitle && (
            <Text variant="caption" color="tertiary">
              {subtitle}
            </Text>
          )}
        </View>
        
        <View style={styles.settingsRight}>
          {value && (
            <Text variant="body2" color="secondary">
              {value}
            </Text>
          )}
          {showArrow && (
            <Ionicons
              name="chevron-forward"
              size={16}
              color={Colors.text.tertiary}
            />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const { currentUser, language } = useUserStore();
  const { logout, getRecoveryData } = useUserManagement();

  const handleRateUs = () => {
    // TODO: Open App Store rating
    Alert.alert(
      'Rate Studişo',
      'Thank you for your support! This will open the App Store.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Rate Now', onPress: () => console.log('Open App Store') },
      ]
    );
  };

  const handlePrivacyPolicy = () => {
    const url = 'https://studiso.app/privacy';
    Linking.openURL(url);
  };

  const handleSupport = () => {
    const url = 'mailto:support@studiso.app?subject=Studişo Support';
    Linking.openURL(url);
  };

  const handleRestorePurchase = () => {
    Alert.alert(
      'Restore Purchase',
      'Checking for previous purchases...',
      [{ text: 'OK' }]
    );
  };

  const handleLanguageChange = () => {
    Alert.alert(
      'Change Language',
      'Select your preferred language',
      [
        { text: 'English', onPress: () => console.log('English selected') },
        { text: 'Türkçe', onPress: () => console.log('Turkish selected') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleDebugInfo = async () => {
    const recoveryData = await getRecoveryData();
    Alert.alert(
      'Debug Information',
      `User ID: ${currentUser?.id || 'Unknown'}\nCredits: ${currentUser?.credits || 0}\nRecovery Methods: ${recoveryData?.recoveryMethods.join(', ') || 'None'}`,
      [{ text: 'OK' }]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out? Your data will be preserved.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/');
          },
        },
      ]
    );
  };

  return (
    <LinearGradient
      colors={Colors.gradients.primary}
      style={styles.container}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          
          <Text variant="navigationTitle" color="primary">
            Settings
          </Text>
          
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* User Info */}
          <Card variant="elevated" style={styles.userCard}>
            <View style={styles.userInfo}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={32} color={Colors.text.secondary} />
              </View>
              <View>
                <Text variant="h5" color="primary">
                  Studişo User
                </Text>
                <Text variant="caption" color="secondary">
                  {currentUser?.credits || 0} credits available
                </Text>
              </View>
            </View>
          </Card>

          {/* General Settings */}
          <View style={styles.section}>
            <Text variant="overline" color="tertiary" style={styles.sectionTitle}>
              General
            </Text>
            
            <Card variant="elevated" style={styles.settingsGroup}>
              <SettingsItem
                icon="language"
                title="Language"
                value={language === 'tr' ? 'Türkçe' : 'English'}
                onPress={handleLanguageChange}
              />
              
              <View style={styles.separator} />
              
              <SettingsItem
                icon="refresh"
                title="Restore Purchase"
                subtitle="Restore previous purchases"
                onPress={handleRestorePurchase}
              />
            </Card>
          </View>

          {/* Support */}
          <View style={styles.section}>
            <Text variant="overline" color="tertiary" style={styles.sectionTitle}>
              Support
            </Text>
            
            <Card variant="elevated" style={styles.settingsGroup}>
              <SettingsItem
                icon="star"
                title="Rate Us"
                subtitle="Help us improve Studişo"
                onPress={handleRateUs}
              />
              
              <View style={styles.separator} />
              
              <SettingsItem
                icon="mail"
                title="Support"
                subtitle="Get help and send feedback"
                onPress={handleSupport}
              />
              
              <View style={styles.separator} />
              
              <SettingsItem
                icon="shield-checkmark"
                title="Privacy Policy"
                subtitle="Learn how we protect your data"
                onPress={handlePrivacyPolicy}
              />
            </Card>
          </View>

          {/* Debug (Development only) */}
          {__DEV__ && (
            <View style={styles.section}>
              <Text variant="overline" color="tertiary" style={styles.sectionTitle}>
                Debug
              </Text>
              
              <Card variant="elevated" style={styles.settingsGroup}>
                <SettingsItem
                  icon="bug"
                  title="Debug Info"
                  subtitle="View user and recovery data"
                  onPress={handleDebugInfo}
                />
              </Card>
            </View>
          )}

          {/* Account */}
          <View style={styles.section}>
            <Card variant="elevated" style={styles.settingsGroup}>
              <SettingsItem
                icon="log-out"
                title="Sign Out"
                subtitle="Your data will be preserved"
                onPress={handleLogout}
                destructive
                showArrow={false}
              />
            </Card>
          </View>

          {/* App Info */}
          <View style={styles.appInfo}>
            <Text variant="caption" color="tertiary" style={styles.appVersion}>
              Studişo v1.0.0
            </Text>
            <Text variant="caption" color="tertiary">
              Made with ❤️ for AI enthusiasts
            </Text>
          </View>

          <View style={styles.bottomSpacing} />
        </ScrollView>
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
  placeholder: {
    width: 40, // Same as back button to center title
  },
  content: {
    flex: 1,
  },
  userCard: {
    marginHorizontal: Layout.screenPadding,
    marginBottom: Spacing.xl,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.surface.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginHorizontal: Layout.screenPadding,
    marginBottom: Spacing.sm,
  },
  settingsGroup: {
    marginHorizontal: Layout.screenPadding,
  },
  settingsItem: {
    paddingVertical: Spacing.md,
  },
  settingsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.surface.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  destructiveIcon: {
    backgroundColor: Colors.status.error + '20',
  },
  settingsText: {
    flex: 1,
    gap: Spacing.xs,
  },
  settingsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border.secondary,
    marginLeft: 48, // Icon width + gap
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    gap: Spacing.xs,
  },
  appVersion: {
    fontWeight: '600',
  },
  bottomSpacing: {
    height: Spacing['2xl'],
  },
}); 