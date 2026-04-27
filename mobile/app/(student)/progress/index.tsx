import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppScreen } from '@/components/AppScreen';
import { AppCard } from '@/components/AppCard';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { ErrorState } from '@/components/ErrorState';
import { EmptyState } from '@/components/EmptyState';
import { useApiQuery } from '@/hooks/useApiQuery';
import { intelligenceApi, type StudentPassportPayload } from '@/api/intelligence.api';
import { colors, fontSize, fontWeight, palette, radius, shadows } from '@/theme';

/**
 * Student weekly progress — long-term growth + recent engagement
 * pulled off the intelligence app's StudentPassport endpoint. No more
 * "coming soon" — every number on this screen is from the DB.
 */
export default function StudentProgress() {
  const [refreshing, setRefreshing] = useState(false);
  const query = useApiQuery<StudentPassportPayload>(
    ['student-passport'],
    () => intelligenceApi.studentPassport(),
    { staleTime: 60_000 },
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await query.refetch();
    setRefreshing(false);
  };

  const data = query.data;

  return (
    <AppScreen onRefresh={onRefresh} refreshing={refreshing}>
      <View style={{ paddingHorizontal: 20, paddingTop: 18, paddingBottom: 8 }}>
        <Text style={styles.eyebrow}>Weekly progress</Text>
        <Text style={styles.title}>Where you are</Text>
        <Text style={styles.subtitle}>
          A read on attendance, mastery moves, and exam-readiness so you know where to push.
        </Text>
      </View>

      {query.isLoading && !data ? (
        <View style={{ paddingHorizontal: 20 }}><LoadingSkeleton height={120} lines={3} /></View>
      ) : query.isError ? (
        <View style={{ paddingHorizontal: 20 }}>
          <ErrorState onRetry={() => query.refetch()} />
        </View>
      ) : data ? (
        <View style={{ paddingHorizontal: 20, gap: 12 }}>
          <KpiRow data={data} />
          <SubjectCard label="Strongest subjects" subjects={data.strongest_subjects} tone="emerald" />
          <SubjectCard label="Most attention needed" subjects={data.weakest_subjects} tone="amber" />
          <BadgesCard badges={data.badges} />
          <TimelineCard timeline={data.timeline} />
        </View>
      ) : (
        <EmptyState
          title="Your growth story starts here"
          message="Complete a lesson or sit an assessment, and we'll start tracking your progress."
        />
      )}
    </AppScreen>
  );
}

const KpiRow: React.FC<{ data: StudentPassportPayload }> = ({ data }) => (
  <View style={{ flexDirection: 'row', gap: 8 }}>
    <Kpi label="Streak" value={`${data.current_streak_days}d`} icon="flame-outline" tint="amber" />
    <Kpi label="Lessons" value={String(data.total_lessons_attended)} icon="book-outline" tint="indigo" />
    <Kpi label="GPA" value={data.overall_gpa.toFixed(1)} icon="ribbon-outline" tint="emerald" />
  </View>
);

const TINTS: Record<string, { bg: string; fg: string }> = {
  amber:   { bg: palette.amber[50],   fg: palette.amber[800]   },
  emerald: { bg: palette.emerald[50], fg: palette.emerald[800] },
  indigo:  { bg: palette.indigo[50],  fg: palette.indigo[700]  },
  navy:    { bg: palette.navy[100],   fg: palette.navy[900]    },
};

const Kpi: React.FC<{ label: string; value: string; icon: keyof typeof Ionicons.glyphMap; tint: keyof typeof TINTS }> = ({ label, value, icon, tint }) => {
  const t = TINTS[tint];
  return (
    <View style={[styles.kpi, { backgroundColor: colors.surface.raised, ...shadows.xs }]}>
      <View style={[styles.kpiIcon, { backgroundColor: t.bg }]}>
        <Ionicons name={icon} size={16} color={t.fg} />
      </View>
      <Text style={styles.kpiValue}>{value}</Text>
      <Text style={styles.kpiLabel}>{label}</Text>
    </View>
  );
};

const SubjectCard: React.FC<{ label: string; subjects: string[]; tone: 'emerald' | 'amber' }> = ({ label, subjects, tone }) => {
  const t = TINTS[tone];
  if (subjects.length === 0) return null;
  return (
    <AppCard>
      <Text style={styles.cardEyebrow}>{label.toUpperCase()}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
        {subjects.slice(0, 4).map((s) => (
          <View key={s} style={[styles.chip, { backgroundColor: t.bg }]}>
            <Text style={[styles.chipLabel, { color: t.fg }]}>{s}</Text>
          </View>
        ))}
      </View>
    </AppCard>
  );
};

const BadgesCard: React.FC<{ badges: StudentPassportPayload['badges'] }> = ({ badges }) => {
  if (!badges || badges.length === 0) return null;
  return (
    <AppCard>
      <Text style={styles.cardEyebrow}>RECENT BADGES</Text>
      <View style={{ marginTop: 10, gap: 10 }}>
        {badges.slice(0, 5).map((b) => (
          <View key={String(b.id)} style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={[styles.kpiIcon, { backgroundColor: palette.amber[50] }]}>
              <Ionicons name="ribbon-outline" size={16} color={palette.amber[800]} />
            </View>
            <Text style={{ flex: 1, marginLeft: 10, fontSize: fontSize.sm, fontWeight: fontWeight.semibold as any, color: colors.text.primary }}>
              {b.name}
            </Text>
            {b.earned_at && (
              <Text style={{ fontSize: fontSize.xs, color: colors.text.muted }}>
                {new Date(b.earned_at).toLocaleDateString()}
              </Text>
            )}
          </View>
        ))}
      </View>
    </AppCard>
  );
};

const TimelineCard: React.FC<{ timeline: StudentPassportPayload['timeline'] }> = ({ timeline }) => {
  if (!timeline || timeline.length === 0) return null;
  return (
    <AppCard>
      <Text style={styles.cardEyebrow}>RECENT MILESTONES</Text>
      <View style={{ marginTop: 10, gap: 8 }}>
        {timeline.slice(-5).reverse().map((t, i) => (
          <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.brand.primary, marginTop: 7, marginRight: 10 }} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: fontSize.sm, color: colors.text.body }}>{t.label}</Text>
              {t.date && (
                <Text style={{ fontSize: fontSize.xs, color: colors.text.muted, marginTop: 2 }}>
                  {new Date(t.date).toLocaleDateString()}
                </Text>
              )}
            </View>
          </View>
        ))}
      </View>
    </AppCard>
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
  kpi: {
    flex: 1,
    borderRadius: radius.card,
    padding: 14,
    alignItems: 'flex-start' as const,
  },
  kpiIcon: {
    width: 30, height: 30, borderRadius: 8,
    alignItems: 'center' as const, justifyContent: 'center' as const,
    marginBottom: 8,
  },
  kpiValue: {
    fontSize: fontSize.xl, fontWeight: fontWeight.extrabold as any,
    color: colors.text.primary,
  },
  kpiLabel: {
    fontSize: fontSize.xs, color: colors.text.muted, marginTop: 2,
  },
  cardEyebrow: {
    fontSize: fontSize.xs - 1,
    fontWeight: fontWeight.bold as any,
    letterSpacing: 1.2,
    color: colors.text.muted,
  },
  chip: {
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 9999,
  },
  chipLabel: {
    fontSize: fontSize.xs, fontWeight: fontWeight.bold as any,
  },
} as const;
