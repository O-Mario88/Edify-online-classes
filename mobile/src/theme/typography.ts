import { Platform } from 'react-native';

/**
 * Maple Design System — typography.
 *
 * Two families:
 *   - sans: system UI font (San Francisco / Roboto). Default for chrome,
 *     buttons, body that reads like an interface.
 *   - serif: editorial — Georgia on iOS, system serif on Android. Used
 *     for lesson titles, chapter headings, and the reader.
 *
 * Sizes follow a tight 8-step scale. Resist adding more — variety in
 * sizes is the fastest way to make a mobile UI feel cluttered.
 */

export const fontFamily = {
  sans: undefined as undefined | string,
  /** Editorial serif. iOS = Georgia (always installed); Android = the
   *  system serif family. */
  serif: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }) as string,
} as const;

/** Modular scale used across the app. */
export const fontSize = {
  xs:    11,
  sm:    13,
  base:  15,
  lg:    17,
  xl:    20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 38,
} as const;

export const fontWeight = {
  regular:   '400',
  medium:    '500',
  semibold:  '600',
  bold:      '700',
  extrabold: '800',
} as const;

/** Letter-spacing presets. UI labels gain a little tracking; body and
 *  serif headings stay tight. */
export const letterSpacing = {
  ui:        0.4,
  tightHead: -0.5,
  body:      0,
} as const;

/** Line-height presets. Reader uses the relaxed scale. */
export const lineHeight = {
  tight:   1.15,
  snug:    1.25,
  normal:  1.4,
  relaxed: 1.6,
} as const;

/**
 * Pre-baked text styles for the most common roles. RN doesn't support
 * "use this style by name" the way CSS does, so consumers spread the
 * object onto a Text style prop.
 */
export const textStyle = {
  caption: {
    fontSize: fontSize.xs, fontWeight: fontWeight.semibold as any,
    letterSpacing: letterSpacing.ui, textTransform: 'uppercase' as const,
  },
  body: {
    fontSize: fontSize.base, lineHeight: fontSize.base * lineHeight.normal,
    fontWeight: fontWeight.regular as any,
  },
  bodyEmph: {
    fontSize: fontSize.base, lineHeight: fontSize.base * lineHeight.normal,
    fontWeight: fontWeight.semibold as any,
  },
  title: {
    fontSize: fontSize.xl, fontWeight: fontWeight.extrabold as any,
    letterSpacing: letterSpacing.tightHead,
  },
  heading: {
    fontSize: fontSize['2xl'], fontWeight: fontWeight.extrabold as any,
    letterSpacing: letterSpacing.tightHead,
  },
  display: {
    fontSize: fontSize['3xl'], fontWeight: fontWeight.extrabold as any,
    letterSpacing: letterSpacing.tightHead,
  },
  serifHead: {
    fontFamily: fontFamily.serif, fontSize: fontSize['2xl'],
    fontWeight: fontWeight.extrabold as any, letterSpacing: letterSpacing.tightHead,
  },
  serifBody: {
    fontFamily: fontFamily.serif, fontSize: fontSize.base,
    lineHeight: fontSize.base * lineHeight.relaxed,
  },
} as const;

/**
 * Backwards-compatible export for code that imports the legacy
 * `typography` object. Prefer `textStyle` going forward.
 */
export const typography = {
  caption: textStyle.caption,
  small:   { fontSize: fontSize.sm, lineHeight: fontSize.sm * lineHeight.normal, fontWeight: fontWeight.regular as any },
  body:    textStyle.body,
  title:   textStyle.title,
  heading: textStyle.heading,
  display: textStyle.display,
} as const;
