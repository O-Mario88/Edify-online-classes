import React from 'react';
import { View, Text, Pressable } from 'react-native';
import type { TodayTask } from '@/api/student.api';

const TYPE_META: Record<string, { label: string; icon: string; tint: string }> = {
  lesson:                    { label: 'Lesson',         icon: '📖', tint: 'bg-indigo-50 border-indigo-200' },
  note:                      { label: 'Note',           icon: '📝', tint: 'bg-indigo-50 border-indigo-200' },
  video:                     { label: 'Video',          icon: '▶️',  tint: 'bg-purple-50 border-purple-200' },
  assessment:                { label: 'Assessment',     icon: '📋', tint: 'bg-amber-50 border-amber-200' },
  practice_lab:              { label: 'Practice lab',   icon: '🧪', tint: 'bg-emerald-50 border-emerald-200' },
  mastery_project:           { label: 'Project',        icon: '🎯', tint: 'bg-rose-50 border-rose-200' },
  live_class:                { label: 'Live class',     icon: '🎥', tint: 'bg-blue-50 border-blue-200' },
  exam_practice:             { label: 'Exam practice',  icon: '📚', tint: 'bg-slate-50 border-slate-200' },
  teacher_support:           { label: 'Teacher support',icon: '🤝', tint: 'bg-teal-50 border-teal-200' },
  mistake_notebook_revision: { label: 'Mistake review', icon: '🧠', tint: 'bg-orange-50 border-orange-200' },
  custom:                    { label: 'Task',           icon: '✓',  tint: 'bg-slate-50 border-slate-200' },
};

interface TaskItemProps {
  task: TodayTask;
  onPress?: () => void;
}

/**
 * One row in Today's Learning Plan. Shows type icon + label, title,
 * subject, time estimate, and a completed checkmark when done.
 *
 * Mobile-first: 64pt min-height, generous tap target, single-line
 * truncate so cards never reflow on a long subject name.
 */
export const TaskItem: React.FC<TaskItemProps> = ({ task, onPress }) => {
  const meta = TYPE_META[task.type] || TYPE_META.custom;
  const done = task.completed;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${meta.label}: ${task.title}`}
      className={`rounded-2xl border ${meta.tint} px-4 py-3 mb-2.5 ${done ? 'opacity-60' : ''}`}
    >
      <View className="flex-row items-start gap-3">
        <View className="w-10 h-10 rounded-xl bg-white items-center justify-center">
          <Text className="text-xl">{done ? '✅' : meta.icon}</Text>
        </View>
        <View className="flex-1 min-w-0">
          <Text className="text-[10px] uppercase tracking-wider font-bold text-slate-500">{meta.label}</Text>
          <Text
            numberOfLines={2}
            className={`text-sm font-bold mt-0.5 leading-snug ${done ? 'text-slate-500 line-through' : 'text-slate-900'}`}
          >
            {task.title}
          </Text>
          <Text className="text-xs text-slate-600 mt-0.5">
            {task.subject}
            {task.duration_minutes ? ` · ${task.duration_minutes} min` : ''}
          </Text>
        </View>
      </View>
    </Pressable>
  );
};
