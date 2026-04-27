import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { AppScreen } from '@/components/AppScreen';
import { AppCard } from '@/components/AppCard';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { ErrorState } from '@/components/ErrorState';
import { EmptyState } from '@/components/EmptyState';
import { useApiQuery } from '@/hooks/useApiQuery';
import { parentApi, type ParentHomePayload, type SubjectRow } from '@/api/parent.api';
import { useParentStore } from '@/auth/parentStore';
import { colors, fontSize, fontWeight, palette } from '@/theme';

/**
 * Parent assessment-results — average score per subject from the home
 * aggregator's `subjects` array. Trend (climbing / stable / sliding) is
 * derived from `assessment_trend` on the weekly brief.
 */
export default function ParentResults() {
  const selectedChildId = useParentStore((s) => s.selectedChildId);
  const [refreshing, setRefreshing] = useState(false);
  const query = useApiQuery<ParentHomePayload>(
    ['parent-home', selectedChildId],
    () => parentApi.home(selectedChildId ?? undefined),
    { staleTime: 60_000 },
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await query.refetch();
    setRefreshing(false);
  };

  const child = query.data?.selected_child;
  const subjects = (child?.subjects ?? []) as SubjectRow[];
  const trend = child?.weekly_brief?.assessment_trend || '—';
  const avg = subjects.length > 0
    ? Math.round(subjects.reduce((sum, s) => sum + s.avg_score, 0) / subjects.length)
    : null;

  return (
    <AppScreen onRefresh={onRefresh} refreshing={refreshing}>
      <View style={{ paddingHorizontal: 20, paddingTop: 18 }}>
        <Text style={styles.eyebrow}>Assessment results</Text>
        <Text style={styles.title}>{child ? `${child.name.split(' ')[0]}'s scores` : 'Results'}</Text>
        <Text style={styles.subtitle}>
          Every recorded score per subject this term. Trend shows the direction over the last few sittings.
        </Text>
      </View>

      {query.isLoading && !query.data ? (
        <View style={{ paddingHorizontal: 20, marginTop: 16 }}><LoadingSkeleton height={120} lines={3} /></View>
      ) : query.isError ? (
        <View style={{ paddingHorizontal: 20, marginTop: 16 }}>
          <ErrorState onRetry={() => query.refetch()} />
        </View>
      ) : !child ? (
        <EmptyState title="No child selected" message="Pick a child from the home screen to see results." />
      ) : (
        <View style={{ paddingHorizontal: 20, marginTop: 14, gap: 12 }}>
          <AppCard>
            <Text style={styles.cardEyebrow}>OVERALL</Text>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 6 }}>
              <Text style={styles.bigPct}>{avg !== null ? `${avg}%` : '—'}</Text>
              <Text style={{ marginLeft: 8, fontSize: fontSize.sm, color: colors.text.muted }}>
                · trend {trend}
              </Text>
            </View>
          </AppCard>

          {subjects.length === 0 ? (
            <EmptyState title="No results yet" message="Your child's first scored assessments will land here." />
          ) : (
            <AppCard>
              <Text style={styles.cardEyebrow}>BY SUBJECT</Text>
              <View style={{ marginTop: 10, gap: 12 }}>
                {subjects.map((s) => (
                  <SubjectScoreRow key={s.subject} row={s} />
                ))}
              </View>
            </AppCard>
          )}
        </View>
      )}
    </AppScreen>
  );
}

const SubjectScoreRow: React.FC<{ row: SubjectRow }> = ({ row }) => {
  const score = row.avg_score;
  const tone = score >= 70 ? 'emerald' : score >= 50 ? 'amber' : 'rose';
  const fg = tone === 'emerald' ? palette.emerald[700] : tone === 'amber' ? palette.amber[800] : palette.rose[700];
  const confidenceColor =
    row.confidence === 'High' ? palette.emerald[700] :
    row.confidence === 'Low'  ? palette.rose[700] : palette.amber[800];
  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{ flex: 1, fontSize: fontSize.sm, fontWeight: fontWeight.bold as any, color: colors.text.primary }}>
          {row.subject}
        </Text>
        <Text style={{ fontSize: fontSize.sm, fontWeight: fontWeight.extrabold as any, color: fg }}>
          {score}%
        </Text>
      </View>
      <View style={{ flexDirection: 'row', marginTop: 4 }}>
        <Text style={{ fontSize: fontSize.xs, color: confidenceColor, fontWeight: fontWeight.semibold as any }}>
          {row.confidence} confidence
        </Text>
        <Text style={{ fontSize: fontSize.xs, color: colors.text.muted, marginLeft: 8 }}>
          · {row.weak_topics} weak topic{row.weak_topics === 1 ? '' : 's'}
        </Text>
      </View>
    </View>
  );
};

const styles = {
  eyebrow: { fontSize: fontSize.xs, fontWeight: fontWeight.bold as any, letterSpacing: 1.4, color: colors.text.muted, textTransform: 'uppercase' as const },
  title: { fontSize: fontSize['2xl'], fontWeight: fontWeight.extrabold as any, color: colors.text.primary, marginTop: 2 },
  subtitle: { fontSize: fontSize.sm, color: colors.text.body, marginTop: 4, lineHeight: fontSize.sm * 1.5 },
  cardEyebrow: { fontSize: fontSize.xs - 1, fontWeight: fontWeight.bold as any, letterSpacing: 1.2, color: colors.text.muted },
  bigPct: { fontSize: fontSize['3xl'], fontWeight: fontWeight.extrabold as any, color: colors.text.primary },
} as const;
