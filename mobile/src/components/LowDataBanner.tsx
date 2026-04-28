import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useLowDataMode } from '@/hooks/useLowDataMode';
import { palette } from '@/theme';

/**
 * Discreet pill shown on home / library / live tabs when low-data
 * mode is active (either via explicit preference or detected slow
 * network). Tapping it opens the offline preferences screen so the
 * user can flip the toggle without hunting for it.
 */
export const LowDataBanner: React.FC = () => {
  const router = useRouter();
  const { active, preferenceOn, networkLow } = useLowDataMode();
  if (!active) return null;
  return (
    <Pressable
      onPress={() => router.push('/(student)/offline' as any)}
      accessibilityRole="button"
      accessibilityLabel="Low data mode active — tap to manage"
      className="mx-5 mt-2 flex-row items-center px-3 py-2 rounded-full"
      style={{ backgroundColor: palette.amber[50], alignSelf: 'flex-start' }}
    >
      <Ionicons name="cellular-outline" size={12} color={palette.amber[800]} />
      <Text className="text-[11px] font-bold ml-1.5" style={{ color: palette.amber[900], letterSpacing: 0.5 }}>
        LOW DATA{networkLow && !preferenceOn ? ' · slow connection' : ''}
      </Text>
    </Pressable>
  );
};
