import React, { useEffect } from 'react';
import { Text, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { colors, fontSize, fontWeight, duration } from '@/theme';

/**
 * Slim banner shown across the top of authenticated screens when the
 * device drops offline. Slides down on disconnect, slides up on
 * reconnect. Stays out of the way for users on a steady connection.
 */
export const OfflineBanner: React.FC = () => {
  const { isOnline } = useNetworkStatus();
  const translateY = useSharedValue(-40);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (!isOnline) {
      translateY.value = withTiming(0, { duration: duration.base });
      opacity.value = withTiming(1, { duration: duration.base });
    } else {
      translateY.value = withTiming(-40, { duration: duration.base });
      opacity.value = withTiming(0, { duration: duration.base });
    }
  }, [isOnline, translateY, opacity]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.bar, style]}
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
    >
      <Ionicons name="cloud-offline-outline" size={14} color={colors.text.onBrand} />
      <Text style={styles.text}>You're offline. Saved items are still available.</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 6,
    paddingBottom: 6,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.text.primary,
    zIndex: 1000,
  },
  text: {
    color: colors.text.onBrand,
    fontSize: fontSize.xs + 1,
    fontWeight: fontWeight.bold as any,
    marginLeft: 6,
  },
});
