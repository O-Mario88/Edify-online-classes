import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';

export interface QuickAction {
  key: string;
  label: string;
  /** Emoji glyph rendered as the tile icon disc. */
  glyph: string;
  /** Tint family for the icon disc only — the tile face stays white so
   *  the row reads premium-minimal, not noisy. */
  tint: 'indigo' | 'emerald' | 'rose' | 'amber' | 'purple' | 'blue' | 'orange' | 'teal' | 'pink';
  onPress?: () => void;
  /** Tiny rose badge in the corner ("3" overdue, etc.). */
  badge?: number;
}

interface QuickActionGridProps {
  actions: QuickAction[];
}

const TINT: Record<QuickAction['tint'], string> = {
  indigo:  'bg-indigo-100',
  emerald: 'bg-emerald-100',
  rose:    'bg-rose-100',
  amber:   'bg-amber-100',
  purple:  'bg-purple-100',
  blue:    'bg-blue-100',
  orange:  'bg-orange-100',
  teal:    'bg-teal-100',
  pink:    'bg-pink-100',
};

/**
 * Two-row horizontal grid of premium-minimal action tiles.
 *
 * Each tile is a white card with a small coloured icon disc — colour
 * lives in the disc, not the tile face, so the strip reads calm and
 * scannable. Inspired by the school-app "favourites" board but
 * restrained closer to the planner reference: white cards, soft
 * shadow, breathable spacing.
 */
export const QuickActionGrid: React.FC<QuickActionGridProps> = ({ actions }) => {
  const top = actions.filter((_, i) => i % 2 === 0);
  const bottom = actions.filter((_, i) => i % 2 === 1);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingRight: 12 }}
    >
      <View>
        <View className="flex-row mb-3">
          {top.map((a) => <Tile key={a.key} action={a} />)}
        </View>
        <View className="flex-row">
          {bottom.map((a) => <Tile key={a.key} action={a} />)}
        </View>
      </View>
    </ScrollView>
  );
};

const Tile: React.FC<{ action: QuickAction }> = ({ action }) => (
  <Pressable
    onPress={action.onPress}
    accessibilityRole="button"
    accessibilityLabel={action.label}
    className="w-24 h-24 rounded-2xl bg-white mr-3 p-3 items-start justify-between relative"
    style={{
      elevation: 1,
      shadowColor: '#0F172A',
      shadowOpacity: 0.05,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
    }}
  >
    <View className={`w-10 h-10 rounded-xl ${TINT[action.tint]} items-center justify-center`}>
      <Text className="text-lg">{action.glyph}</Text>
    </View>
    <Text numberOfLines={2} className="text-xs font-bold leading-tight text-slate-800">
      {action.label}
    </Text>
    {(action.badge ?? 0) > 0 && (
      <View className="absolute top-2 right-2 min-w-[18px] h-[18px] rounded-full bg-rose-500 px-1 items-center justify-center">
        <Text className="text-[10px] font-bold text-white">{(action.badge ?? 0) > 9 ? '9+' : action.badge}</Text>
      </View>
    )}
  </Pressable>
);
