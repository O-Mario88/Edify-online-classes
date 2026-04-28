import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AppScreen } from '@/components/AppScreen';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { ErrorState } from '@/components/ErrorState';
import { EmptyState } from '@/components/EmptyState';
import { useApiQuery } from '@/hooks/useApiQuery';
import { teacherApi, type PendingGrade } from '@/api/teacher.api';
import { colors, fontSize, fontWeight, palette, radius, shadows } from '@/theme';

/**
 * Pending submissions that need a grade. Tap a row to open the existing
 * mentor-review detail screen at /(teacher)/review/[id]. When the
 * dedicated assessment grader ships we'll route to that instead — same
 * list, deeper destination.
 */
export default function TeacherGrading() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const query = useApiQuery<PendingGrade[]>(
    ['teacher-pending-grading'],
    () => teacherApi.pendingGrading(),
    { staleTime: 60_000 },
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await query.refetch();
    setRefreshing(false);
  };

  const items = query.data ?? [];

  return (
    <AppScreen onRefresh={onRefresh} refreshing={refreshing}>
      <View style={{ paddingHorizontal: 20, paddingTop: 18 }}>
        <Text style={styles.eyebrow}>Grading</Text>
        <Text style={styles.title}>Needs your mark</Text>
        <Text style={styles.subtitle}>
          Submissions waiting for a score. Tap any row to open the rubric and grade it.
        </Text>
      </View>

      {query.isLoading && items.length === 0 ? (
        <View style={{ paddingHorizontal: 20, marginTop: 16 }}><LoadingSkeleton height={120} lines={3} /></View>
      ) : query.isError ? (
        <View style={{ paddingHorizontal: 20, marginTop: 16 }}>
          <ErrorState onRetry={() => query.refetch()} />
        </View>
      ) : items.length === 0 ? (
        <EmptyState
          title="Inbox zero"
          message="Nothing waiting for a grade right now. New submissions will appear here as students hand in work."
        />
      ) : (
        <View style={{ paddingHorizontal: 20, marginTop: 14, gap: 10 }}>
          {items.map((g) => (
            <Pressable
              key={String(g.id)}
              onPress={() => router.push(`/(teacher)/review/${g.id}` as any)}
              accessibilityRole="button"
              accessibilityLabel={`Grade ${g.assessment_title} for ${g.student_name}`}
              style={({ pressed }) => [
                {
                  backgroundColor: colors.surface.raised,
                  borderRadius: radius.card,
                  padding: 14,
                  flexDirection: 'row',
                  alignItems: 'center',
                  opacity: pressed ? 0.92 : 1,
                  ...shadows.xs,
                },
              ]}
            >
              <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: palette.emerald[50], alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                <Ionicons name="document-text-outline" size={18} color={palette.emerald[800]} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: fontSize.sm, fontWeight: fontWeight.bold as any, color: colors.text.primary }}>
                  {g.assessment_title}
                </Text>
                <Text style={{ fontSize: fontSize.xs, color: colors.text.muted, marginTop: 2 }}>
                  {g.student_name} · submitted {new Date(g.submitted_at).toLocaleDateString()}
                  {g.question_count ? ` · ${g.question_count} q` : ''}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.text.soft} />
            </Pressable>
          ))}
        </View>
      )}
    </AppScreen>
  );
}

const styles = {
  eyebrow: { fontSize: fontSize.xs, fontWeight: fontWeight.bold as any, letterSpacing: 1.4, color: colors.text.muted, textTransform: 'uppercase' as const },
  title: { fontSize: fontSize['2xl'], fontWeight: fontWeight.extrabold as any, color: colors.text.primary, marginTop: 2 },
  subtitle: { fontSize: fontSize.sm, color: colors.text.body, marginTop: 4, lineHeight: fontSize.sm * 1.5 },
} as const;
