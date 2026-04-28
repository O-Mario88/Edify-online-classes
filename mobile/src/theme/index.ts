/**
 * Maple Design System — barrel export.
 *
 * Import via `import { colors, space, radius, shadows, textStyle }
 * from '@/theme'`. Component code should reach for the semantic
 * tokens (`colors.brand.primary`, `radius.card`) rather than the raw
 * palette so a future re-skin only changes one file.
 */
export { palette, colors, type ColorToken } from './colors';
export { spacing, space } from './spacing';
export { radius } from './radius';
export { shadows, type Shadow } from './shadows';
export {
  fontFamily,
  fontSize,
  fontWeight,
  letterSpacing,
  lineHeight,
  textStyle,
  typography,
} from './typography';
export { duration, easing } from './motion';
export { paletteForSubject, type SubjectPalette } from './subjectColors';
