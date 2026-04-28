import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { colors, fontSize, fontWeight, palette, radius, shadows, space } from '@/theme';

export interface QuickAction {
  key: string;
  label: string;
  /** Emoji glyph rendered inside the circular icon disc. */
  glyph: string;
  /** Tint family for the icon disc. */
  tint: 'indigo' | 'emerald' | 'rose' | 'amber' | 'purple' | 'blue' | 'orange' | 'teal' | 'pink';
  onPress?: () => void;
  /** Tiny rose badge in the disc corner ("3" overdue, etc.). */
  badge?: number;
}

interface QuickActionGridProps {
  actions: QuickAction[];
}

const TINT: Record<QuickAction['tint'], { bg: string; fg: string }> = {
  indigo:  { bg: palette.indigo[50],  fg: palette.indigo[700]  },
  emerald: { bg: palette.emerald[50], fg: palette.emerald[800] },
  rose:    { bg: palette.rose[50],    fg: palette.rose[800]    },
  amber:   { bg: palette.amber[50],   fg: palette.amber[800]   },
  purple:  { bg: palette.purple[50],  fg: palette.purple[800]  },
  blue:    { bg: palette.indigo[50],  fg: palette.indigo[700]  },
  orange:  { bg: palette.orange[50],  fg: palette.orange[800]  },
  teal:    { bg: palette.teal[50],    fg: palette.teal[800]    },
  pink:    { bg: palette.rose[50],    fg: palette.rose[800]    },
};

/**
 * Quick-action grid rendered as one elevated card containing the tiles
 * — not as a row of separate floating tiles. Inspired by the "Doctors
 * specialty" pattern: a single white surface holds a row (or grid) of
 * circular icon discs each labelled below. Reads tighter and more
 * premium than the previous floating-tile approach.
 *
 * Layout adapts to the action count:
 *   - 1–4 actions: a single row inside the card
 *   - 5–6 actions: 2 rows × 3 columns inside the card
 *   - 7+: wraps onto extra rows (3-col grid)
 *
 * Pagination dots aren't drawn here — when a future variant adds a
 * "next page of actions" surface, dots can render outside the card.
 */
export const QuickActionGrid: React.FC<QuickActionGridProps> = ({ actions }) => {
  if (actions.length === 0) return null;
  const cols = actions.length <= 4 ? actions.length : 3;
  return (
    <View
      style={{
        backgroundColor: colors.surface.raised,
        borderRadius: radius.cardLg,
        paddingVertical: space.md,
        paddingHorizontal: space.sm,
        ...shadows.sm,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
        }}
      >
        {actions.map((a) => (
          <View
            key={a.key}
            style={{
              width: `${100 / cols}%`,
              paddingVertical: space.xs,
            }}
          >
            <Tile action={a} />
          </View>
        ))}
      </View>
    </View>
  );
};

const Tile: React.FC<{ action: QuickAction }> = ({ action }) => {
  const tint = TINT[action.tint];
  const badge = action.badge ?? 0;
  return (
    <Pressable
      onPress={action.onPress}
      accessibilityRole="button"
      accessibilityLabel={action.label}
      style={({ pressed }) => [
        {
          alignItems: 'center',
          justifyContent: 'flex-start',
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      <View
        style={{
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: tint.bg,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ fontSize: 26 }}>{action.glyph}</Text>
        {badge > 0 && (
          <View
            style={{
              position: 'absolute',
              top: -2,
              right: -2,
              minWidth: 20,
              height: 20,
              borderRadius: 10,
              paddingHorizontal: 6,
              backgroundColor: palette.rose[700],
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 2,
              borderColor: colors.surface.raised,
            }}
          >
            <Text style={{ color: colors.text.onBrand, fontSize: 10, fontWeight: fontWeight.bold as any }}>
              {badge > 9 ? '9+' : badge}
            </Text>
          </View>
        )}
      </View>
      <Text
        numberOfLines={2}
        style={{
          marginTop: 8,
          fontSize: fontSize.xs,
          fontWeight: fontWeight.semibold as any,
          color: colors.text.body,
          textAlign: 'center',
          lineHeight: fontSize.xs * 1.3,
          maxWidth: 76,
        }}
      >
        {action.label}
      </Text>
    </Pressable>
  );
};
