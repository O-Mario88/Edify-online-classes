import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { AnimatedMapleLogo } from './AnimatedMapleLogo';
import { BrandBackground } from './BrandBackground';
import { colors, fontSize, fontWeight, letterSpacing, palette } from '@/theme';

/**
 * Branded launch screen. The logo gently breathes (subtle scale +
 * vertical drift) above the warm brand gradient while a thin progress
 * bar fills repeatedly underneath — the brand mark itself signals
 * "we're working." No copy is rendered separately; the wordmark and
 * tagline are baked into the artwork.
 */
export const LaunchScreen: React.FC = () => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.cubic) }),
        withTiming(0, { duration: 0 }),
      ),
      -1,
    );
  }, [progress]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%` as `${number}%`,
  }));

  return (
    <View style={styles.root}>
      <BrandBackground haloY={0.42} />
      <SafeAreaView style={styles.safe}>
        <StatusBar style="dark" />
        <View style={styles.center}>
          <AnimatedMapleLogo size={280} intensity="hero" />
        </View>
        <View style={styles.footer}>
          <View style={styles.barTrack}>
            <Animated.View style={[styles.barFill, barStyle]} />
          </View>
          <Text style={styles.loadingLabel}>loading…</Text>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  footer: {
    paddingBottom: 44,
    paddingHorizontal: 48,
    alignItems: 'center',
  },
  barTrack: {
    width: '70%',
    height: 3,
    backgroundColor: 'rgba(15, 42, 69, 0.12)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: colors.brand.primary,
    borderRadius: 2,
  },
  loadingLabel: {
    marginTop: 14,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold as any,
    color: palette.slate[400],
    letterSpacing: letterSpacing.ui * 3.5,
    textTransform: 'uppercase',
  },
});
