/**
 * Maple mobile colour tokens. Mirrors the web app's #0F2A45 navy brand
 * + intent colours (warning/success/danger/info). Kept narrow on
 * purpose — the design system stays small until we earn the breadth.
 */
export const colors = {
  brand: {
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
  warning: '#F59E0B',
  success: '#10B981',
  danger:  '#EF4444',
  info:    '#6366F1',
  text: {
    primary:   '#0F172A',
    secondary: '#475569',
    muted:     '#94A3B8',
    inverse:   '#FFFFFF',
  },
  surface: {
    canvas:  '#F8FAFC',
    card:    '#FFFFFF',
    sunken:  '#F1F5F9',
    overlay: 'rgba(15, 23, 42, 0.5)',
  },
  border: {
    subtle: '#E2E8F0',
    strong: '#CBD5E1',
  },
} as const;
