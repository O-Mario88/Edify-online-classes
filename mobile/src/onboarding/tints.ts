/**
 * Onboarding tour tint palette.
 *
 * Mirrors FeatureLandingScreen's TINTS dict so the two surfaces feel
 * like one system — same disc, same chip, same colour family.
 */
import { palette } from '@/theme';

export type TourTint = 'navy' | 'amber' | 'emerald' | 'indigo' | 'rose';

export const TOUR_TINTS: Record<TourTint, { bg: string; fg: string }> = {
  navy:    { bg: palette.navy[100],   fg: palette.navy[900]    },
  amber:   { bg: palette.amber[50],   fg: palette.amber[800]   },
  emerald: { bg: palette.emerald[50], fg: palette.emerald[800] },
  indigo:  { bg: palette.indigo[50],  fg: palette.indigo[700]  },
  rose:    { bg: palette.rose[50],    fg: palette.rose[800]    },
};
