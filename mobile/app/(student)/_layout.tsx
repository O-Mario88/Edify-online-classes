import React from 'react';
import { Tabs } from 'expo-router';
import { Text, View } from 'react-native';

/**
 * Student bottom-tab layout — the spec's Phase-2 tab set:
 *   Home · Learn · Live · Tasks · Profile
 *
 * No icon library yet (we'll add lucide-react-native or similar in a
 * polish pass). Emoji glyphs are temporary but readable.
 */

const TabIcon: React.FC<{ glyph: string; focused: boolean }> = ({ glyph, focused }) => (
  <Text
    className={focused ? 'text-2xl' : 'text-xl'}
    style={{ opacity: focused ? 1 : 0.55 }}
  >
    {glyph}
  </Text>
);

export default function StudentLayout() {
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
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => <TabIcon glyph="🏠" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="learn"
        options={{
          title: 'Learn',
          tabBarIcon: ({ focused }) => <TabIcon glyph="📚" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="live"
        options={{
          title: 'Live',
          tabBarIcon: ({ focused }) => <TabIcon glyph="🎥" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: 'Tasks',
          tabBarIcon: ({ focused }) => <TabIcon glyph="📋" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => <TabIcon glyph="👤" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
