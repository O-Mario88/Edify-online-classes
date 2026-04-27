/**
 * Maple Design System — spacing.
 *
 * 4-px base scale. Mirrors Tailwind so a NativeWind class like `p-4`
 * (= 16 px) and `spacing[4]` produce the same pixel.
 *
 * Two access patterns:
 *   - Indexed access: `spacing[4]` → 16
 *   - Named scale: `space.md` → 16, paired with `space.gutter` etc.
 */

export const spacing = {
  px: 1,
  0:  0,
  0.5: 2,
  1:  4,
  2:  8,
  3:  12,
  4:  16,
  5:  20,
  6:  24,
  7:  28,
  8:  32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
} as const;

/**
 * Named tokens for screen-level rhythm. Use these on flex layouts or
 * StyleSheet objects where the numeric scale would obscure intent.
 */
export const space = {
  none:   spacing[0],
  /** Tightest gap — between an icon and its label. */
  hair:   spacing[1],
  /** Tag pill internal padding. */
  xs:     spacing[2],
  /** Inside a row of chips. */
  sm:     spacing[3],
  /** Default padding inside a card. */
  md:     spacing[4],
  /** Between cards in a stack. */
  lg:     spacing[5],
  /** Between major sections on a screen. */
  xl:     spacing[7],
  /** Around hero blocks. */
  '2xl':  spacing[10],
  /** Outside-edge gutter on a screen. */
  gutter: spacing[5],
} as const;
