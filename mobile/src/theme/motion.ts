import { Easing } from 'react-native-reanimated';

/**
 * Maple Design System — motion.
 *
 * Three durations and three easings. The same values back every
 * Reanimated animation in the app so press-feedback / sheet entry /
 * progress-bar fills feel like one product, not seven.
 */

export const duration = {
  /** Tap response. */
  fast:    140,
  /** Slide-in / slide-out for sheets and banners. */
  base:    220,
  /** Progress fills, breathing logo. */
  slow:    420,
  /** Premium hero animations (badge unlock, certificate reveal). */
  reveal:  680,
} as const;

export const easing = {
  /** Standard interface easing — quick out, slow in. */
  standard: Easing.bezier(0.4, 0.0, 0.2, 1),
  /** Decelerated — for sheet entry. */
  decel:    Easing.bezier(0.0, 0.0, 0.2, 1),
  /** Accelerated — for sheet exit / dismiss. */
  accel:    Easing.bezier(0.4, 0.0, 1.0, 1),
} as const;
