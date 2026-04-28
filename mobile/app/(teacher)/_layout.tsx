import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, palette, radius, shadows } from '@/theme';
import { PaywallGate } from '@/components/PaywallGate';

/**
 * Teacher bottom-tab layout. Same floating-pill chrome as the student
 * and parent stacks so the visual identity stays one platform across
 * roles. Five anchors: Home / Today / Reviews / Earnings / Profile.
 *
 * Deep-feature routes (Quick note, Questions, Grading, Availability,
 * Storefront, Notifications) are reachable via push from the dashboard
 * and hidden from the tab bar with `href: null`.
 */

const ICON_MAP: Record<string, [keyof typeof Ionicons.glyphMap, keyof typeof Ionicons.glyphMap]> = {
  index:    ['home',          'home-outline'],
  today:    ['calendar',      'calendar-outline'],
  reviews:  ['document-text', 'document-text-outline'],
  earnings: ['cash',          'cash-outline'],
  profile:  ['person',        'person-outline'],
};

const HIDDEN_ROUTES = [
  'quick-note',
  'questions',
  'grading',
  'availability',
  'storefront',
  'notifications',
  'review',
  'upgrade',
];

export default function TeacherLayout() {
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
      <Tabs.Screen name="index"    options={{ title: 'Home' }} />
      <Tabs.Screen name="today"    options={{ title: 'Today' }} />
      <Tabs.Screen name="reviews"  options={{ title: 'Reviews' }} />
      <Tabs.Screen name="earnings" options={{ title: 'Earnings' }} />
      <Tabs.Screen name="profile"  options={{ title: 'Profile' }} />
      {HIDDEN_ROUTES.map((name) => (
        <Tabs.Screen key={name} name={name} options={{ href: null }} />
      ))}
    </Tabs>
    </PaywallGate>
  );
}
