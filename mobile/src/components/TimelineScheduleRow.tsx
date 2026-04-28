import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { paletteForSubject } from '@/theme/subjectColors';

interface TimelineScheduleRowProps {
  /** "09:00 AM" — left column time label. */
  timeLabel: string;
  /** "Period 1" / "Period 2" — secondary label under the time. */
  periodLabel?: string;
  /** Subject string, drives the colour of the right-hand card. */
  subject: string;
  /** Title rendered as the card heading. */
  title: string;
  /** Optional secondary line (chapter, room, teacher). */
  subline?: string;
  /** Optional progress percentage chip (0–100). */
  progress?: number;
  onPress?: () => void;
  /** When true, render a faded "Free Period" panel instead of a subject card. */
  isFree?: boolean;
}

/**
 * A single row in the timeline schedule — time/period on the left, a
 * coloured subject card on the right. Subject colour comes from the
 * palette in theme/subjectColors so a learner builds a visual
 * identity for each subject.
 *
 * "Free Period" rows render the same row shape with a softer panel so
 * the timeline reads as a continuous day, not a list with gaps.
 */
export const TimelineScheduleRow: React.FC<TimelineScheduleRowProps> = ({
  timeLabel,
  periodLabel,
  subject,
  title,
  subline,
  progress,
  onPress,
  isFree = false,
}) => {
  const palette = paletteForSubject(subject);

  return (
    <View className="flex-row mb-2.5">
      {/* Time / period gutter */}
      <View className="w-20 pr-3 pt-2 items-end">
        <Text className="text-[11px] font-bold text-slate-500">{timeLabel}</Text>
        {!!periodLabel && (
          <Text className="text-[10px] text-slate-400 mt-0.5">{periodLabel}</Text>
        )}
      </View>

      {/* Subject / free-period card */}
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${timeLabel} ${title}`}
        disabled={isFree}
        className={`flex-1 rounded-2xl border ${isFree ? 'bg-slate-50 border-slate-200' : `${palette.bg} ${palette.border}`} px-4 py-3`}
      >
        <View className="flex-row items-start gap-3">
          <View className={`w-10 h-10 rounded-xl ${isFree ? 'bg-white' : 'bg-white/70'} items-center justify-center`}>
            <Text className="text-xl">{isFree ? '☕' : palette.glyph}</Text>
          </View>
          <View className="flex-1 min-w-0">
            <Text
              numberOfLines={1}
              className={`text-base font-extrabold ${isFree ? 'text-slate-500' : palette.accent}`}
            >
              {isFree ? 'Free period' : title}
            </Text>
            {!isFree && !!subline && (
              <Text numberOfLines={1} className="text-[11px] text-slate-700 mt-0.5">{subline}</Text>
            )}
            {!isFree && typeof progress === 'number' && (
              <View className="mt-1 flex-row items-center">
                <Text className="text-[11px] font-bold text-slate-700">{Math.round(progress)}% complete</Text>
              </View>
            )}
          </View>
        </View>
      </Pressable>
    </View>
  );
};
