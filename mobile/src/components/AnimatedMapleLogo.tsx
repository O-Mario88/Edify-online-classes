import React, { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { MapleLogo } from './MapleLogo';

interface Props {
  size?: number;
  /**
   * "calm" — subtle 1.5% scale + 3px drift (auth screens).
   * "hero" — pronounced 3.5% scale + 4px drift (splash/launch).
   */
  intensity?: 'calm' | 'hero';
}

/**
 * Maple brand mark that gently breathes — subtle scale + vertical drift
 * on a 2.8s cycle. Used wherever we want the logo to feel alive
 * (launch screen, auth screens) without competing with content.
 */
export const AnimatedMapleLogo: React.FC<Props> = ({ size = 200, intensity = 'calm' }) => {
  const scale = useSharedValue(1);
  const drift = useSharedValue(0);

  useEffect(() => {
    const peakScale = intensity === 'hero' ? 1.035 : 1.015;
    const peakDrift = intensity === 'hero' ? -4 : -3;
    scale.value = withRepeat(
      withSequence(
        withTiming(peakScale, { duration: 1400, easing: Easing.inOut(Easing.quad) }),
        withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
    );
    drift.value = withRepeat(
      withSequence(
        withTiming(peakDrift, { duration: 1400, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 1400, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
    );
  }, [scale, drift, intensity]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: drift.value }],
  }));

  return (
    <Animated.View style={style}>
      <MapleLogo size={size} />
    </Animated.View>
  );
};
