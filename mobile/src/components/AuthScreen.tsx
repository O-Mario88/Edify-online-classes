import React from 'react';
import { View, ScrollView, type ScrollViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { BrandBackground } from './BrandBackground';

interface AuthScreenProps extends ScrollViewProps {
  scroll?: boolean;
  /** Vertical placement (0..1) of the warm halo. Defaults to 0.35 — the
   *  region where the hero logo lives on auth screens. */
  haloY?: number;
}

/**
 * Wrapper for pre-auth screens (welcome / sign in / sign up). Adds the
 * branded gradient + halo background, safe-area insets, and an optional
 * scroll container. No tab-bar padding — these screens predate the
 * authenticated chrome.
 */
export const AuthScreen: React.FC<React.PropsWithChildren<AuthScreenProps>> = ({
  children,
  scroll = true,
  haloY,
  ...rest
}) => (
  <View className="flex-1">
    <BrandBackground haloY={haloY} />
    <SafeAreaView className="flex-1" edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />
      {scroll ? (
        <ScrollView
          className="flex-1"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 32 }}
          {...rest}
        >
          {children}
        </ScrollView>
      ) : (
        <View className="flex-1">{children}</View>
      )}
    </SafeAreaView>
  </View>
);
