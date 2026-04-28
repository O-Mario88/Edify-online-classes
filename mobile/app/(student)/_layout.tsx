import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, palette, radius, shadows } from '@/theme';
import { PaywallGate } from '@/components/PaywallGate';

/**
 * Student bottom-tab layout. Floating pill-shaped tab bar with the
 * Maple Design System tokens. Five anchors: Home, Learn, Live, Tasks,
 * Profile. Every other route is `href: null` so it's reachable via
 * router.push from the dashboard but absent from the tab bar.
 */

const ICON_MAP: Record<string, [keyof typeof Ionicons.glyphMap, keyof typeof Ionicons.glyphMap]> = {
  index:   ['home',     'home-outline'],
  learn:   ['book',     'book-outline'],
  live:    ['videocam', 'videocam-outline'],
  tasks:   ['list',     'list-outline'],
  profile: ['person',   'person-outline'],
};

const HIDDEN_ROUTES = [
  'practice',
  'mastery',
  'mastery-projects',
  'exam-sim',
  'passport',
  'ai-buddy',
  'mistake-notebook',
  'notifications',
  'progress',
  'certificates',
  'study-plan',
  'ask-teacher',
  'projects',
  'offline',
  'payment',
  'school-match',
  'teacher-feedback',
  'support-tracker',
];

export default function StudentLayout() {
  return (
    <PaywallGate>
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: colors.brand.primary,
        tabBarInactiveTintColor: palette.slate[400],
        tabBarStyle: {
          position: 'absolute',
          left: 16,
          right: 16,
          bottom: 16,
          backgroundColor: colors.surface.raised,
          borderTopWidth: 0,
          borderRadius: radius.sheet,
          height: 68,
          paddingTop: 10,
          paddingBottom: 10,
          ...shadows.lg,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '700', marginTop: 2, letterSpacing: 0.2 },
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
      {HIDDEN_ROUTES.map((name) => (
        <Tabs.Screen key={name} name={name} options={{ href: null }} />
      ))}
    </Tabs>
    </PaywallGate>
  );
}
