import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCountry } from '@/hooks/useCountry';
import { CountryPickerSheet } from './CountryPickerSheet';
import { colors, palette, shadows } from '@/theme';

interface Props {
  /** Optional override for the secondary line. Default uses curriculum + exam tracks. */
  body?: string;
}

/**
 * Slim locale strip rendered at the top of role homes. Shows the
 * country flag, curriculum framework, and exam-track preview so the
 * user knows Maple is showing them content from their syllabus. Tap
 * opens the country picker — same one used on auth screens.
 */
export const LocaleStrip: React.FC<Props> = ({ body }) => {
  const { config } = useCountry();
  const [pickerOpen, setPickerOpen] = useState(false);
  const subtitle = body || `${config.curriculum} · ${config.exam_tracks.primary} & ${config.exam_tracks.secondary}`;
  return (
    <>
      <Pressable
        onPress={() => setPickerOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`${config.name}, tap to change`}
        className="mx-5 mt-2 flex-row items-center rounded-2xl px-3 py-2"
        style={{
          alignSelf: 'flex-start',
          backgroundColor: colors.surface.raised,
          ...shadows.xs,
        }}
      >
        <Text style={{ fontSize: 16, marginRight: 8 }}>{config.flag}</Text>
        <View>
          <Text className="text-[10px] font-bold uppercase tracking-wider" style={{ color: colors.text.muted }}>
            {config.name} · {config.code}
          </Text>
          <Text numberOfLines={1} className="text-[11px] font-semibold mt-0.5" style={{ color: palette.slate[700] }}>
            {subtitle}
          </Text>
        </View>
        <Ionicons name="chevron-down" size={14} color={colors.text.soft} style={{ marginLeft: 8 }} />
      </Pressable>
      <CountryPickerSheet visible={pickerOpen} onClose={() => setPickerOpen(false)} />
    </>
  );
};
