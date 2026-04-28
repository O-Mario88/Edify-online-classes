import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppScreen } from '@/components/AppScreen';
import { AppCard } from '@/components/AppCard';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { ErrorState } from '@/components/ErrorState';
import { EmptyState } from '@/components/EmptyState';
import { useApiQuery } from '@/hooks/useApiQuery';
import { parentApi, type ParentHomePayload } from '@/api/parent.api';
import { useParentStore } from '@/auth/parentStore';
import { colors, fontSize, fontWeight, palette } from '@/theme';

/**
 * Parent attendance — per-subject attendance % derived from the parent
 * home aggregator's per-child subject snapshot. Same data source as the
 * dashboard so the numbers always agree.
 */
export default function ParentAttendance() {
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
  const subjects = child?.subjects ?? [];
  const overall = child?.kpis?.attendance ?? null;

  return (
    <AppScreen onRefresh={onRefresh} refreshing={refreshing}>
      <View style={{ paddingHorizontal: 20, paddingTop: 18 }}>
        <Text style={styles.eyebrow}>Attendance</Text>
        <Text style={styles.title}>{child ? `${child.name.split(' ')[0]}'s attendance` : 'Attendance'}</Text>
        <Text style={styles.subtitle}>
          Per-subject totals for this term — marked by the teacher, not auto-stamped.
        </Text>
      </View>

      {query.isLoading && !query.data ? (
        <View style={{ paddingHorizontal: 20, marginTop: 16 }}><LoadingSkeleton height={120} lines={3} /></View>
      ) : query.isError ? (
        <View style={{ paddingHorizontal: 20, marginTop: 16 }}>
          <ErrorState onRetry={() => query.refetch()} />
        </View>
      ) : !child ? (
        <EmptyState title="No child selected" message="Pick a child from the home screen to see attendance." />
      ) : (
        <View style={{ paddingHorizontal: 20, marginTop: 14, gap: 12 }}>
          {overall !== null && (
            <AppCard>
              <Text style={styles.cardEyebrow}>OVERALL</Text>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 6 }}>
                <Text style={styles.bigPct}>{overall}%</Text>
                <Text style={{ marginLeft: 8, fontSize: fontSize.sm, color: colors.text.muted }}>
                  attended this term
                </Text>
              </View>
            </AppCard>
          )}
          {subjects.length === 0 ? (
            <EmptyState title="Nothing recorded yet" message="Your child's first attended classes will appear here." />
          ) : (
            <AppCard>
              <Text style={styles.cardEyebrow}>BY SUBJECT</Text>
              <View style={{ marginTop: 10, gap: 10 }}>
                {subjects.map((s) => (
                  <SubjectAttendanceRow key={s.subject} subject={s.subject} pct={s.completion} />
                ))}
              </View>
            </AppCard>
          )}
        </View>
      )}
    </AppScreen>
  );
}

const SubjectAttendanceRow: React.FC<{ subject: string; pct: number }> = ({ subject, pct }) => {
  const tone = pct >= 85 ? 'emerald' : pct >= 70 ? 'amber' : 'rose';
  const fg = tone === 'emerald' ? palette.emerald[700] : tone === 'amber' ? palette.amber[800] : palette.rose[700];
  const bg = tone === 'emerald' ? palette.emerald[50] : tone === 'amber' ? palette.amber[50] : palette.rose[50];
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <View style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name="checkmark-outline" size={16} color={fg} />
      </View>
      <Text style={{ flex: 1, marginLeft: 10, fontSize: fontSize.sm, fontWeight: fontWeight.semibold as any, color: colors.text.primary }}>
        {subject}
      </Text>
      <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 9999, backgroundColor: bg }}>
        <Text style={{ fontSize: fontSize.xs, fontWeight: fontWeight.bold as any, color: fg }}>{pct}%</Text>
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
  cardEyebrow: {
    fontSize: fontSize.xs - 1,
    fontWeight: fontWeight.bold as any,
    letterSpacing: 1.2,
    color: colors.text.muted,
  },
  bigPct: {
    fontSize: fontSize['3xl'],
    fontWeight: fontWeight.extrabold as any,
    color: colors.text.primary,
  },
} as const;
