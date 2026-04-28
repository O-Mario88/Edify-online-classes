import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, palette, radius, shadows } from '@/theme';
import { PaywallGate } from '@/components/PaywallGate';

/**
 * Institution (head-teacher / DOS / admin) tab layout. Same floating-
 * pill chrome as student / parent / teacher so the visual identity is
 * one platform across roles. Five anchors: Home / School / Reports /
 * Admissions / Profile.
 *
 * Deep-feature routes (Risk alerts, Teacher delivery, Parent
 * engagement, Application review, Notifications) are reachable via
 * push from the dashboard and hidden from the tab bar with `href: null`.
 */

const ICON_MAP: Record<string, [keyof typeof Ionicons.glyphMap, keyof typeof Ionicons.glyphMap]> = {
  index:       ['home',        'home-outline'],
  school:      ['school',      'school-outline'],
  reports:     ['document-text', 'document-text-outline'],
  admissions:  ['mail-open',   'mail-open-outline'],
  profile:     ['person',      'person-outline'],
};

const HIDDEN_ROUTES = [
  'risk',
  'teacher-delivery',
  'parent-engagement',
  'application-review',
  'notifications',
  'upgrade',
  'students',
  'scholarships',
];

export default function InstitutionLayout() {
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
      <Tabs.Screen name="index"      options={{ title: 'Home' }} />
      <Tabs.Screen name="school"     options={{ title: 'School' }} />
      <Tabs.Screen name="reports"    options={{ title: 'Reports' }} />
      <Tabs.Screen name="admissions" options={{ title: 'Admissions' }} />
      <Tabs.Screen name="profile"    options={{ title: 'Profile' }} />
      {HIDDEN_ROUTES.map((name) => (
        <Tabs.Screen key={name} name={name} options={{ href: null }} />
      ))}
    </Tabs>
    </PaywallGate>
  );
}
