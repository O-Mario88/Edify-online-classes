import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppScreen } from '@/components/AppScreen';
import { PrimaryButton } from '@/components/PrimaryButton';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { ErrorState } from '@/components/ErrorState';
import { EmptyState } from '@/components/EmptyState';
import { useApiQuery } from '@/hooks/useApiQuery';
import { intelligenceApi, type StudyTask } from '@/api/intelligence.api';
import { colors, fontSize, fontWeight, palette, radius, shadows } from '@/theme';

/**
 * Weekly study plan — backed by the intelligence app's study planner.
 * Renders today's tasks first; tap "Done" completes a task and refetches.
 * "Generate plan" CTA available when no plan exists for the current week.
 */
export default function StudentStudyPlan() {
  const [refreshing, setRefreshing] = useState(false);
  const [generating, setGenerating] = useState(false);

  const todayQuery = useApiQuery<StudyTask[]>(
    ['study-plan-today'],
    () => intelligenceApi.studyPlanToday(),
    { staleTime: 60_000 },
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await todayQuery.refetch();
    setRefreshing(false);
  };

  const onGenerate = async () => {
    setGenerating(true);
    try {
      await intelligenceApi.generateStudyPlan();
      await todayQuery.refetch();
    } finally {
      setGenerating(false);
    }
  };

  const onComplete = async (taskId: number) => {
    await intelligenceApi.completeTask(taskId);
    await todayQuery.refetch();
  };

  const tasks = todayQuery.data ?? [];

  return (
    <AppScreen onRefresh={onRefresh} refreshing={refreshing}>
      <View style={{ paddingHorizontal: 20, paddingTop: 18, paddingBottom: 8 }}>
        <Text style={styles.eyebrow}>Study plan</Text>
        <Text style={styles.title}>Today's plan</Text>
        <Text style={styles.subtitle}>
          A short stack of tasks to make today's study session feel finishable.
        </Text>
      </View>

      {todayQuery.isLoading && tasks.length === 0 ? (
        <View style={{ paddingHorizontal: 20 }}><LoadingSkeleton height={120} lines={3} /></View>
      ) : todayQuery.isError ? (
        <View style={{ paddingHorizontal: 20 }}>
          <ErrorState onRetry={() => todayQuery.refetch()} />
        </View>
      ) : tasks.length === 0 ? (
        <View style={{ paddingHorizontal: 20 }}>
          <EmptyState
            title="No plan for today yet"
            message="Generate a fresh weekly plan based on your strongest and weakest subjects."
          />
          <View style={{ marginTop: 12 }}>
            <PrimaryButton
              label={generating ? 'Generating…' : "Generate this week's plan"}
              onPress={onGenerate}
            />
          </View>
        </View>
      ) : (
        <View style={{ paddingHorizontal: 20, gap: 10 }}>
          {tasks.map((t) => (
            <TaskRow key={t.id} task={t} onComplete={() => onComplete(t.id)} />
          ))}
        </View>
      )}
    </AppScreen>
  );
}

const URGENCY_TINT: Record<StudyTask['urgency'], { bg: string; fg: string }> = {
  urgent:   { bg: palette.rose[50],    fg: palette.rose[800]   },
  normal:   { bg: palette.indigo[50],  fg: palette.indigo[700] },
  optional: { bg: palette.slate[100],  fg: palette.slate[700]  },
};

const TYPE_ICON: Record<StudyTask['type'], keyof typeof import('@expo/vector-icons').Ionicons.glyphMap> = {
  revision:     'reload-outline',
  assignment:   'document-text-outline',
  practice:     'flask-outline',
  video:        'play-circle-outline',
  reading:      'book-outline',
  intervention: 'medkit-outline',
  live_session: 'videocam-outline',
  project:      'construct-outline',
};

const TaskRow: React.FC<{ task: StudyTask; onComplete: () => void }> = ({ task, onComplete }) => {
  const tint = URGENCY_TINT[task.urgency] || URGENCY_TINT.normal;
  const completed = task.status === 'completed';
  return (
    <View style={[
      { backgroundColor: colors.surface.raised, borderRadius: radius.card, padding: 14, ...shadows.xs },
      completed && { opacity: 0.55 },
    ]}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: tint.bg, alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
          <Ionicons name={TYPE_ICON[task.type] || 'list-outline'} size={18} color={tint.fg} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: fontSize.sm, fontWeight: fontWeight.bold as any, color: colors.text.primary, textDecorationLine: completed ? 'line-through' : 'none' }}>
            {task.title}
          </Text>
          {!!task.subject && (
            <Text style={{ fontSize: fontSize.xs, color: colors.text.muted, marginTop: 2 }}>
              {task.subject}{task.topic ? ` · ${task.topic}` : ''} · {task.estimated_minutes} min
            </Text>
          )}
        </View>
        {!completed && (
          <Pressable
            onPress={onComplete}
            accessibilityRole="button"
            accessibilityLabel={`Mark ${task.title} complete`}
            style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 9999, backgroundColor: colors.brand.primary }}
          >
            <Text style={{ color: colors.text.onBrand, fontSize: fontSize.xs, fontWeight: fontWeight.bold as any }}>Done</Text>
          </Pressable>
        )}
        {completed && (
          <Ionicons name="checkmark-circle" size={22} color={palette.emerald[700]} />
        )}
      </View>
    </View>
  );
};

const styles = {
  eyebrow: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold as any,
    letterSpacing: 1.4,
    color: colors.text.muted,
    textTransform: 'uppercase' as const,
  },
  title: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.extrabold as any,
    color: colors.text.primary,
    marginTop: 2,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.text.body,
    marginTop: 4,
    lineHeight: fontSize.sm * 1.5,
  },
} as const;
