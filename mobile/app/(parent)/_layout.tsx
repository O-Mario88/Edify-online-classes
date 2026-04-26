import React from 'react';
import { Tabs } from 'expo-router';
import { Text } from 'react-native';

/**
 * Parent bottom-tab layout — the spec's parent stack:
 *   Home · Progress · Reports · Messages · Profile
 *
 * Same visual language as (student): emoji glyphs, maple-navy active
 * tint, 64pt tab bar. Replace glyphs with proper icons in a polish
 * pass.
 */

const TabIcon: React.FC<{ glyph: string; focused: boolean }> = ({ glyph, focused }) => (
  <Text className={focused ? 'text-2xl' : 'text-xl'} style={{ opacity: focused ? 1 : 0.55 }}>
    {glyph}
  </Text>
);

export default function ParentLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#0F2A45',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E2E8F0',
          borderTopWidth: 1,
          paddingTop: 6,
          paddingBottom: 8,
          height: 64,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Home', tabBarIcon: ({ focused }) => <TabIcon glyph="🏠" focused={focused} /> }}
      />
      <Tabs.Screen
        name="progress"
        options={{ title: 'Progress', tabBarIcon: ({ focused }) => <TabIcon glyph="📈" focused={focused} /> }}
      />
      <Tabs.Screen
        name="reports"
        options={{ title: 'Reports', tabBarIcon: ({ focused }) => <TabIcon glyph="📊" focused={focused} /> }}
      />
      <Tabs.Screen
        name="messages"
        options={{ title: 'Messages', tabBarIcon: ({ focused }) => <TabIcon glyph="💬" focused={focused} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profile', tabBarIcon: ({ focused }) => <TabIcon glyph="👤" focused={focused} /> }}
      />
    </Tabs>
  );
}
