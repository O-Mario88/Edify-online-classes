/**
 * Maple Design System — colour tokens.
 *
 * Two layers:
 *
 *   1. PALETTE — raw scales (greys, navy, bronze, statuses). Use these
 *      only when nothing semantic fits.
 *   2. SEMANTIC tokens (brand / surface / text / border / status /
 *      subject) — what UI code should reach for. When the brand
 *      evolves we change the mapping here; consumers don't care.
 *
 * Hex values match the Tailwind config so a class like `bg-maple-900`
 * and `colors.brand.primary` produce the same pixel.
 */

// ── Palette ────────────────────────────────────────────────────────

export const palette = {
  white: '#FFFFFF',
  black: '#000000',

  /** Maple navy — primary brand. Mirrors tailwind.config.js maple.*. */
  navy: {
    50:  '#F0F4F8',
    100: '#D9E2EC',
    200: '#BCCCDC',
    300: '#9FB3C8',
    400: '#829AB1',
    500: '#627D98',
    600: '#486581',
    700: '#334E68',
    800: '#1F3A5F',
    900: '#0F2A45',
  },

  /** Bronze — secondary accent (logo mark, halo highlights, premium pills). */
  bronze: {
    50:  '#FBF5EE',
    100: '#F4E6D6',
    200: '#E8C9A4',
    300: '#DDB078',
    400: '#C99352',
    500: '#B86E3C',
    600: '#9A5A30',
    700: '#7C4724',
    800: '#5E351A',
    900: '#3F2310',
  },

  /** Cool slate scale — body text, dividers, neutrals. */
  slate: {
    50:  '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
  },

  /** Status families — soft 50/100 backgrounds, strong 700/800 inks. */
  emerald:  { 50: '#D1FAE5', 100: '#A7F3D0', 700: '#047857', 800: '#065F46', 900: '#064E3B' },
  amber:    { 50: '#FEF3C7', 100: '#FDE68A', 700: '#B45309', 800: '#92400E', 900: '#78350F' },
  rose:     { 50: '#FFE4E6', 100: '#FECDD3', 700: '#BE123C', 800: '#9F1239', 900: '#881337' },
  indigo:   { 50: '#E0E7FF', 100: '#C7D2FE', 700: '#3730A3', 800: '#312E81', 900: '#312E81' },
  teal:     { 50: '#CCFBF1', 100: '#99F6E4', 700: '#0F766E', 800: '#115E59', 900: '#134E4A' },
  orange:   { 50: '#FFEDD5', 100: '#FED7AA', 700: '#C2410C', 800: '#9A3412', 900: '#7C2D12' },
  purple:   { 50: '#EDE9FE', 100: '#DDD6FE', 700: '#6D28D9', 800: '#5B21B6', 900: '#4C1D95' },

  /** Brand canvas — soft cool-blue gradient base, slightly tinted away
   *  from neutral so cards lift with subtle elevation against it. */
  canvas: '#EEF1F6',
} as const;

// ── Semantic tokens ────────────────────────────────────────────────

export const colors = {
  brand: {
    /** Maple navy — buttons, hero cards, primary CTAs. */
    primary:     palette.navy[900],
    /** Pressed / hover state on primary. */
    primaryDeep: palette.navy[800],
    /** Bronze halo highlights, premium / verified pills. */
    accent:      palette.bronze[200],
    /** Text on bronze backgrounds. */
    accentInk:   palette.bronze[800],
    /** Bronze deep — for amber-warning emphasis. */
    accentDeep:  palette.bronze[500],
  },
  surface: {
    canvas:    palette.canvas,
    raised:    palette.white,
    sunken:    palette.slate[50],
    inverse:   palette.navy[900],
    overlay:   'rgba(15, 23, 42, 0.55)',
  },
  text: {
    primary:   palette.slate[900],
    body:      palette.slate[800],
    muted:     palette.slate[500],
    soft:      palette.slate[400],
    onBrand:   palette.white,
    onAccent:  palette.navy[900],
    link:      palette.navy[900],
  },
  border: {
    soft:      palette.slate[100],
    default:   palette.slate[200],
    strong:    palette.slate[300],
  },
  status: {
    success:   { bg: palette.emerald[50], fg: palette.emerald[800] },
    warning:   { bg: palette.amber[50],   fg: palette.amber[800]   },
    danger:    { bg: palette.rose[50],    fg: palette.rose[800]    },
    info:      { bg: palette.indigo[50],  fg: palette.indigo[700]  },
  },
  /**
   * Third-party brand colours we have to render verbatim (share
   * buttons, payment-method chips). Keep narrow — Maple owns the rest.
   */
  partner: {
    whatsapp: '#25D366',
  },
  /**
   * Subject palette used by LessonCover and the match cards. Pulled
   * here so the cover SVG, the match-lane chip, and any future
   * subject-tinted surface read from one source.
   */
  subject: {
    maths:     { bg: palette.indigo[50],  fg: palette.indigo[700] },
    science:   { bg: palette.emerald[50], fg: palette.emerald[800] },
    english:   { bg: palette.rose[50],    fg: palette.rose[800]   },
    history:   { bg: palette.amber[50],   fg: palette.amber[800]  },
    geography: { bg: palette.teal[50],    fg: palette.teal[800]   },
    art:       { bg: palette.purple[50],  fg: palette.purple[800] },
    ict:       { bg: palette.slate[100],  fg: palette.slate[800]  },
  },
} as const;

export type ColorToken = typeof colors;
