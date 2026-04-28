import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LessonCover, SERIF_FONT } from './LessonCover';
import { palette, shadows } from '@/theme';

interface Props {
  title: string;
  subject: string;
  /** "Mr. Okello" / class name etc. */
  byline?: string;
  /** Star rating, e.g. 4.8. */
  rating?: number;
  /** Cohort size, e.g. 8182. */
  studentCount?: number;
  /** Right-pinned badge, e.g. "Free" / "$45" / "Mock". */
  badgeLabel?: string;
  /** Tap-state save flag for the heart icon. */
  saved?: boolean;
  onPress?: () => void;
  onToggleSave?: () => void;
}

const formatStudents = (n: number): string => {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  return String(n);
};

/**
 * Featured course card — a large book-style cover with a metadata
 * footer (rating, students, byline) and a heart toggle for save-for-
 * offline. Used in the horizontal "Featured this week" carousel on the
 * Library and on the home dashboard.
 */
export const FeaturedCourseCard: React.FC<Props> = ({
  title,
  subject,
  byline,
  rating,
  studentCount,
  badgeLabel,
  saved,
  onPress,
  onToggleSave,
}) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={`Open ${title}`}
    className="w-44 mr-3 bg-white rounded-3xl overflow-hidden"
    style={shadows.md}
  >
    <View className="relative">
      <View className="items-center pt-3">
        <LessonCover subject={subject} title={title} size="md" />
      </View>

      {/* Save heart */}
      <Pressable
        onPress={onToggleSave}
        accessibilityRole="button"
        accessibilityLabel={saved ? 'Remove from saved' : 'Save for later'}
        className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white items-center justify-center"
        style={shadows.xs}
      >
        <Ionicons name={saved ? 'heart' : 'heart-outline'} size={14} color={saved ? palette.rose[700] : palette.slate[600]} />
      </Pressable>

      {/* Badge */}
      {!!badgeLabel && (
        <View
          className="absolute bottom-3 right-3 rounded-full px-2.5 py-1"
          style={{ backgroundColor: palette.rose[700] }}
        >
          <Text className="text-[10px] font-bold text-white">{badgeLabel}</Text>
        </View>
      )}
    </View>

    <View className="p-3">
      <Text
        numberOfLines={1}
        className="text-slate-900"
        style={{ fontFamily: SERIF_FONT, fontSize: 14, fontWeight: '800' }}
      >
        {title}
      </Text>
      {!!byline && (
        <Text numberOfLines={1} className="text-[11px] text-slate-500 mt-0.5">{byline}</Text>
      )}
      <View className="flex-row items-center mt-2">
        {typeof rating === 'number' && (
          <>
            <Ionicons name="star" size={11} color={palette.amber[700]} />
            <Text className="text-[11px] font-bold text-slate-700 ml-1">{rating.toFixed(1)}</Text>
          </>
        )}
        {typeof studentCount === 'number' && (
          <Text className="text-[11px] text-slate-400 ml-2">· {formatStudents(studentCount)} students</Text>
        )}
      </View>
    </View>
  </Pressable>
);
