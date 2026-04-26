import React from 'react';
import { View, Text, Pressable } from 'react-native';
import type { RecentLesson } from '@/api/student.api';

interface LessonCardProps {
  lesson: RecentLesson;
  onPress?: () => void;
}

/**
 * Lesson row for the Learn tab + recent-lessons strip on Home.
 * Two lines: title + subject/class/duration. Tappable.
 */
export const LessonCard: React.FC<LessonCardProps> = ({ lesson, onPress }) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={`Open lesson: ${lesson.title}`}
    className="rounded-2xl bg-white border border-slate-200 p-4 mb-2.5"
  >
    <View className="flex-row items-start gap-3">
      <View className="w-10 h-10 rounded-xl bg-indigo-100 items-center justify-center">
        <Text className="text-xl">📖</Text>
      </View>
      <View className="flex-1 min-w-0">
        <Text numberOfLines={2} className="text-sm font-bold text-slate-900 leading-snug">{lesson.title}</Text>
        <Text className="text-xs text-slate-500 mt-1">
          {[lesson.subject, lesson.class_name, lesson.duration_label].filter(Boolean).join(' · ')}
        </Text>
      </View>
    </View>
  </Pressable>
);
