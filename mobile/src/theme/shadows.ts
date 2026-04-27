import type { ViewStyle } from 'react-native';

/**
 * Maple Design System — elevation presets.
 *
 * Five levels. Most cards use `sm`. Hero cards (Continue Reading,
 * Today's Plan) use `md`. Modals + sheets use `lg`. The "deep" navy
 * variant is used on dark hero blocks where the slate shadow would
 * disappear.
 *
 * RN ignores some properties on Android (it only honours `elevation`).
 * Each preset includes both so the look matches across platforms.
 */

const sl = {
  shadowColor: '#0F172A',
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0,
  shadowRadius: 0,
  elevation: 0,
} as const;

export const shadows = {
  none: { ...sl } as ViewStyle,

  /** Hairline lift — chips, tab-bar items. */
  xs: {
    ...sl,
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  } as ViewStyle,

  /** Default card. */
  sm: {
    ...sl,
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  } as ViewStyle,

  /** Featured card / hero. */
  md: {
    ...sl,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  } as ViewStyle,

  /** Modal, bottom-sheet, floating tab bar. */
  lg: {
    ...sl,
    shadowOpacity: 0.10,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  } as ViewStyle,

  /** Top-level overlays (force-update gate, share sheet). */
  xl: {
    ...sl,
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  } as ViewStyle,

  /** Variant for dark navy surfaces — slightly stronger so the lift
   *  reads against the dark background. */
  deep: {
    ...sl,
    shadowOpacity: 0.22,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  } as ViewStyle,
} as const;

export type Shadow = keyof typeof shadows;
