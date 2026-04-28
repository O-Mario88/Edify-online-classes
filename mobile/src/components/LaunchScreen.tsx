import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { AnimatedMapleLogo } from './AnimatedMapleLogo';
import { BrandBackground } from './BrandBackground';

interface LaunchScreenProps {
  /** Optional callback fired when the splash choreography completes
   *  (≈ 5 s after mount). When set, the screen runs the zoom-out
   *  exit animation; without it, the logo just breathes idly. */
  onComplete?: () => void;
}

/**
 * Branded splash screen. Just the Maple mark, centred on the warm
 * brand gradient — no progress bar, no copy, no auth chrome. The
 * choreography is:
 *
 *   t = 0      — logo at scale 0.6, opacity 0
 *   t = 0–500  — zoom-in to scale 1.0 + fade to 1
 *   t = 500–4500 — hold steady (logo's own breathing animation runs)
 *   t = 4500–5000 — zoom-out: scale 1.0 → 1.3 → 0 with fade
 *   t = 5000   — onComplete() fires; root layout swaps to the homepage
 *
 * If `onComplete` isn't passed, only the entrance animation runs and
 * the logo idles — used for the brief auth-refresh state where the
 * splash is shown but the unmount is driven by the auth gate, not a
 * timer.
 */
export const LaunchScreen: React.FC<LaunchScreenProps> = ({ onComplete }) => {
  const scale = useSharedValue(0.6);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (onComplete) {
      // Full splash choreography: enter, hold, slow zoom-and-fade exit.
      // Total duration ≈ 5.4 s — entrance 700 ms, hold 3.3 s, exit 1.4 s.
      // The exit is intentionally slow so the splash dissolves rather
      // than snaps; the homepage fades in underneath as the logo scales.
      scale.value = withSequence(
        withTiming(1.0, { duration: 700, easing: Easing.out(Easing.cubic) }),
        withDelay(3300, withTiming(1.18, { duration: 800, easing: Easing.inOut(Easing.cubic) })),
        withTiming(1.05, { duration: 600, easing: Easing.in(Easing.quad) }, (finished) => {
          if (finished && onComplete) runOnJS(onComplete)();
        }),
      );
      opacity.value = withSequence(
        withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) }),
        withDelay(3300, withTiming(1, { duration: 200 })),
        withTiming(0, { duration: 1200, easing: Easing.in(Easing.cubic) }),
      );
    } else {
      // Idle mode (auth-refresh splash): just the entrance, then hold.
      scale.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) });
      opacity.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) });
    }
  }, [onComplete, scale, opacity]);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View style={styles.root}>
      <BrandBackground haloY={0.5} />
      <SafeAreaView style={styles.safe}>
        <StatusBar style="dark" />
        <View style={styles.center}>
          <Animated.View style={logoStyle}>
            <AnimatedMapleLogo size={280} intensity={onComplete ? 'calm' : 'hero'} />
          </Animated.View>
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
});
