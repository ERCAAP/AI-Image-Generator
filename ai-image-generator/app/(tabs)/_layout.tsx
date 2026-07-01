import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Layout, Shadows } from '../../src/constants';

interface TabBarIconProps {
  name: keyof typeof Ionicons.glyphMap;
  focused: boolean;
}

function TabBarIcon({ name, focused }: TabBarIconProps) {
  return (
    <View style={styles.tabBarIcon}>
      <Ionicons 
        name={name} 
        size={24} 
        color={focused ? Colors.primary : Colors.text.tertiary} 
      />
    </View>
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.surface.primary,
          borderTopWidth: 1,
          borderTopColor: Colors.border.primary,
          height: Layout.tabBarHeight + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 12,
          ...Shadows.lg,
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.text.tertiary,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginBottom: -4,
        },
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="discover"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name={focused ? 'home' : 'home-outline'} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="ai-tools"
        options={{
          title: 'AI Tools',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name={focused ? 'sparkles' : 'sparkles-outline'} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Create',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name={focused ? 'camera' : 'camera-outline'} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="creations"
        options={{
          title: 'Creations',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name={focused ? 'folder' : 'folder-outline'} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name={focused ? 'person-circle' : 'person-circle-outline'} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});