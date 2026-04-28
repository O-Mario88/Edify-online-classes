import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, palette, radius, shadows } from '@/theme';
import { PaywallGate } from '@/components/PaywallGate';

/**
 * Parent bottom-tab layout. Same floating-pill chrome as the student
 * stack — same tab bar, same icon style, just different routes so
 * the visual identity stays one platform across roles.
 */

const ICON_MAP: Record<string, [keyof typeof Ionicons.glyphMap, keyof typeof Ionicons.glyphMap]> = {
  index:    ['home',          'home-outline'],
  progress: ['trending-up',   'trending-up-outline'],
  reports:  ['document-text', 'document-text-outline'],
  messages: ['chatbubbles',   'chatbubbles-outline'],
  profile:  ['person',        'person-outline'],
};

export default function ParentLayout() {
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
      <Tabs.Screen name="progress" options={{ title: 'Progress' }} />
      <Tabs.Screen name="reports"  options={{ title: 'Reports' }} />
      <Tabs.Screen name="messages" options={{ title: 'Messages' }} />
      <Tabs.Screen name="profile"  options={{ title: 'Profile' }} />
      {[
        'pay',
        'support',
        'apply',
        'remind',
        'attendance',
        'results',
        'weak-topics',
        'notifications',
        'applications',
        'school-match',
        'invitations',
      ].map((name) => (
        <Tabs.Screen key={name} name={name} options={{ href: null }} />
      ))}
    </Tabs>
    </PaywallGate>
  );
}
