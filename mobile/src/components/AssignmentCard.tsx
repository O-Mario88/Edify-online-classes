import React from 'react';
import { View, Text, Pressable } from 'react-native';
import type { UpcomingAssignment } from '@/api/student.api';

interface AssignmentCardProps {
  assignment: UpcomingAssignment;
  onPress?: () => void;
}

/**
 * Upcoming assignment row. Surfaces title + topic + due-in countdown
 * + max score, with a rose tint when the close-at is within 24h so a
 * learner can prioritise.
 */
export const AssignmentCard: React.FC<AssignmentCardProps> = ({ assignment, onPress }) => {
  const close = new Date(assignment.close_at);
  const minsLeft = Math.round((close.getTime() - Date.now()) / 60_000);
  const isImminent = minsLeft >= 0 && minsLeft <= 60 * 24;
  const isOverdue = minsLeft < 0;

  const dueLabel = (() => {
    if (isOverdue) return 'Overdue';
    if (minsLeft < 60) return `Due in ${minsLeft} min`;
    if (minsLeft < 60 * 24) return `Due in ${Math.floor(minsLeft / 60)}h`;
    return `Due ${close.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}`;
  })();

  const tint =
    isOverdue   ? 'bg-rose-50 border-rose-200' :
    isImminent  ? 'bg-amber-50 border-amber-200' :
                  'bg-white border-slate-200';
  const dueColor =
    isOverdue   ? 'text-rose-700' :
    isImminent  ? 'text-amber-700' :
                  'text-slate-500';

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Assignment: ${assignment.title}, ${dueLabel}`}
      className={`rounded-2xl border ${tint} p-4 mb-2.5`}
    >
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1 min-w-0">
          <Text className="text-[10px] uppercase tracking-wider font-bold text-slate-500">{assignment.type || 'Assessment'}</Text>
          <Text numberOfLines={2} className="text-sm font-bold text-slate-900 leading-snug mt-0.5">{assignment.title}</Text>
          {!!assignment.topic && (
            <Text className="text-xs text-slate-600 mt-1">{assignment.topic}</Text>
          )}
        </View>
        <View className="items-end">
          <Text className={`text-xs font-bold ${dueColor}`}>{dueLabel}</Text>
          {assignment.max_score > 0 && (
            <Text className="text-[10px] text-slate-500 mt-0.5">/ {assignment.max_score}</Text>
          )}
        </View>
      </View>
    </Pressable>
  );
};
