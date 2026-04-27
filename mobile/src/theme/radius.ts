/**
 * Maple Design System — corner radii.
 *
 * Six steps. Most surfaces use `card` (16) or `cardLg` (20). Pills and
 * full-circle avatars use `pill`.
 */
export const radius = {
  none:   0,
  xs:     4,
  sm:     8,
  /** Default for inline chips and small buttons. */
  md:     12,
  /** Default card corner. */
  card:   16,
  /** Hero / featured card corner. */
  cardLg: 20,
  /** Hero buttons, full-screen modals. */
  xl:     24,
  '2xl':  28,
  /** Bottom-sheet top corners. */
  sheet:  28,
  /** Pills and circle avatars. */
  pill:   9999,
} as const;
