/**
 * Mobile typography. We keep the scale tight (5 sizes) so screens
 * read consistently on small viewports. Use the corresponding
 * NativeWind class where possible.
 */
export const typography = {
  caption: { fontSize: 11, lineHeight: 14, fontWeight: '600' as const },
  small:   { fontSize: 13, lineHeight: 18, fontWeight: '400' as const },
  body:    { fontSize: 15, lineHeight: 22, fontWeight: '400' as const },
  title:   { fontSize: 18, lineHeight: 24, fontWeight: '700' as const },
  heading: { fontSize: 24, lineHeight: 30, fontWeight: '800' as const },
  display: { fontSize: 32, lineHeight: 38, fontWeight: '900' as const },
} as const;
