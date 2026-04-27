import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '@/theme';

export interface SubjectChip {
  key: string;
  label: string;
  /** Ionicons glyph used as the chip icon. */
  icon: keyof typeof Ionicons.glyphMap;
  /** Tinted background colour for the icon disc. */
  tintBg: string;
  /** Foreground colour for the icon glyph. */
  tintFg: string;
}

interface Props {
  chips: SubjectChip[];
  selectedKey?: string | null;
  onSelect?: (key: string) => void;
}

/**
 * Horizontal subject filter — pill chips with a tinted icon disc on
 * the left of each. Active chip fills in navy with white text; inactive
 * chips are white-on-slate. Matches the categories row pattern from
 * modern e-learning UIs.
 */
export const SubjectChips: React.FC<Props> = ({ chips, selectedKey, onSelect }) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={{ paddingRight: 20 }}
  >
    {chips.map((c) => {
      const active = c.key === selectedKey;
      return (
        <Pressable
          key={c.key}
          onPress={() => onSelect?.(c.key)}
          accessibilityRole="tab"
          accessibilityLabel={c.label}
          accessibilityState={{ selected: active }}
          className="flex-row items-center mr-3 rounded-full pl-1.5 pr-4 py-1.5"
          style={{
            backgroundColor: active ? colors.brand.primary : colors.surface.raised,
            ...(active ? {} : shadows.xs),
          }}
        >
          <View
            className="w-7 h-7 rounded-full items-center justify-center mr-2"
            style={{ backgroundColor: active ? 'rgba(255,255,255,0.18)' : c.tintBg }}
          >
            <Ionicons name={c.icon} size={14} color={active ? colors.text.onBrand : c.tintFg} />
          </View>
          <Text
            className="text-xs"
            style={{
              fontWeight: '700',
              color: active ? colors.text.onBrand : colors.text.primary,
            }}
          >
            {c.label}
          </Text>
        </Pressable>
      );
    })}
  </ScrollView>
);
