import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { colors, shadows } from '@/theme';

interface Props {
  name: string;
  subject: string;
  /** Hex colour used for the avatar disc — picks up the subject palette. */
  tint?: string;
  onPress?: () => void;
}

/**
 * Compact "Top teacher" chip used in the Library mentors carousel.
 * Avatar disc with the teacher's initials + name + subject. Initials
 * trick gives us a recognisable avatar without uploaded photos and
 * matches the tone of premium e-learning UIs while we wait on real
 * teacher photography.
 */
export const TeacherChip: React.FC<Props> = ({ name, subject, tint = colors.brand.primary, onPress }) => {
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${name}, ${subject}`}
      className="items-center mr-4 w-20"
    >
      <View
        className="w-16 h-16 rounded-full items-center justify-center"
        style={{ backgroundColor: tint, ...shadows.md }}
      >
        <Text className="text-white text-base font-extrabold">{initials || '?'}</Text>
      </View>
      <Text numberOfLines={1} className="text-xs font-bold text-slate-900 mt-2 text-center">
        {name}
      </Text>
      <Text numberOfLines={1} className="text-[10px] text-slate-500 mt-0.5 text-center">
        {subject}
      </Text>
    </Pressable>
  );
};
