import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

/**
 * Student bottom-tab layout. Floating pill-shaped tab bar with soft
 * shadow + Ionicons. The bar is detached from the screen edge so the
 * tab strip reads as an interactive control rather than OS-level
 * chrome. Each icon picks a filled / outline variant based on
 * selection so the active tab is visually obvious.
 */

const ICON_MAP: Record<string, [keyof typeof Ionicons.glyphMap, keyof typeof Ionicons.glyphMap]> = {
  index:   ['home',     'home-outline'],
  learn:   ['book',     'book-outline'],
  live:    ['videocam', 'videocam-outline'],
  tasks:   ['list',     'list-outline'],
  profile: ['person',   'person-outline'],
};

export default function StudentLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: '#0F2A45',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarStyle: {
          position: 'absolute',
          left: 16,
          right: 16,
          bottom: 16,
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
          borderRadius: 28,
          height: 68,
          paddingTop: 10,
          paddingBottom: 10,
          elevation: 8,
          shadowColor: '#0F172A',
          shadowOpacity: 0.10,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 6 },
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '700', marginTop: 2 },
        tabBarIcon: ({ focused, color }) => {
          const pair = ICON_MAP[route.name];
          if (!pair) return null;
          return <Ionicons name={focused ? pair[0] : pair[1]} size={focused ? 24 : 22} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="index"   options={{ title: 'Home' }} />
      <Tabs.Screen name="learn"   options={{ title: 'Learn' }} />
      <Tabs.Screen name="live"    options={{ title: 'Live' }} />
      <Tabs.Screen name="tasks"   options={{ title: 'Tasks' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
