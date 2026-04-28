import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppScreen } from '@/components/AppScreen';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { ErrorState } from '@/components/ErrorState';
import { EmptyState } from '@/components/EmptyState';
import { useApiQuery } from '@/hooks/useApiQuery';
import { api } from '@/api/client';
import { colors, fontSize, fontWeight, palette, radius, shadows } from '@/theme';

interface ProjectSubmission {
  id: number | string;
  project: {
    id: number | string;
    slug: string;
    title: string;
    subject?: { name: string };
    topic?: { name: string };
  };
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'revision_requested' | string;
  submitted_at: string | null;
  reviewed_at: string | null;
  artifacts?: Array<{ id: number | string; kind?: string; name?: string }>;
  reviews?: Array<{
    id: number | string;
    score: number | string;
    feedback?: string;
    status: string;
  }>;
  revision_count?: number;
}

const arr = <T,>(d: any): T[] => (Array.isArray(d) ? d : (d?.results || []));

const STATUS_TINT: Record<string, { bg: string; fg: string; label: string }> = {
  draft:              { bg: palette.slate[200],  fg: palette.slate[700],  label: 'Draft' },
  submitted:          { bg: palette.indigo[50],  fg: palette.indigo[700], label: 'Submitted' },
  under_review:       { bg: palette.amber[50],   fg: palette.amber[800],  label: 'Under review' },
  revision_requested: { bg: palette.amber[50],   fg: palette.amber[800],  label: 'Revise' },
  approved:           { bg: palette.emerald[50], fg: palette.emerald[800], label: 'Approved' },
};

/**
 * Mastery projects — list of the student's own submissions across the
 * project library. Status pill drives the call to action: draft → keep
 * editing on web, revision_requested → reviewer feedback, approved → 🎉.
 */
export default function StudentProjects() {
  const [refreshing, setRefreshing] = useState(false);

  const query = useApiQuery<ProjectSubmission[]>(
    ['student-mastery-projects'],
    async () => {
      const r = await api.get<any>('/mastery-projects/submissions/my/');
      return r.error ? { data: null, error: r.error } : { data: arr<ProjectSubmission>(r.data), error: null };
    },
    { staleTime: 60_000 },
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await query.refetch();
    setRefreshing(false);
  };

  const items = query.data ?? [];
  const counts = {
    inFlight: items.filter((s) => ['draft', 'submitted', 'under_review', 'revision_requested'].includes(s.status)).length,
    approved: items.filter((s) => s.status === 'approved').length,
  };

  return (
    <AppScreen onRefresh={onRefresh} refreshing={refreshing}>
      <View style={{ paddingHorizontal: 20, paddingTop: 18 }}>
        <Text style={styles.eyebrow}>Projects</Text>
        <Text style={styles.title}>Your project work</Text>
        <Text style={styles.subtitle}>
          {counts.inFlight} in flight · {counts.approved} approved. Each submission ships with rubric feedback.
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
          title="No project submissions yet"
          message="When a teacher assigns a project, your draft will appear here. The web admin has the full project library."
        />
      ) : (
        <View style={{ paddingHorizontal: 20, marginTop: 14, gap: 10 }}>
          {items.map((s) => <SubmissionRow key={String(s.id)} submission={s} />)}
        </View>
      )}
    </AppScreen>
  );
}

const SubmissionRow: React.FC<{ submission: ProjectSubmission }> = ({ submission }) => {
  const tint = STATUS_TINT[submission.status] || STATUS_TINT.draft;
  const review = submission.reviews?.[submission.reviews.length - 1];
  return (
    <View style={{ backgroundColor: colors.surface.raised, borderRadius: radius.card, padding: 14, ...shadows.xs }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
        <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: palette.amber[50], alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
          <Ionicons name="construct-outline" size={18} color={palette.amber[800]} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: fontSize.sm, fontWeight: fontWeight.bold as any, color: colors.text.primary }} numberOfLines={2}>
            {submission.project?.title || 'Untitled project'}
          </Text>
          <Text style={{ fontSize: fontSize.xs, color: colors.text.muted, marginTop: 2 }} numberOfLines={1}>
            {submission.project?.subject?.name || ''}
            {submission.project?.topic?.name ? ` · ${submission.project.topic.name}` : ''}
          </Text>
        </View>
        <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 9999, backgroundColor: tint.bg }}>
          <Text style={{ fontSize: fontSize.xs - 1, fontWeight: fontWeight.bold as any, color: tint.fg, letterSpacing: 0.5 }}>
            {tint.label.toUpperCase()}
          </Text>
        </View>
      </View>

      {!!review && (
        <View style={{ marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.border.soft }}>
          <Text style={{ fontSize: fontSize.xs - 1, fontWeight: fontWeight.bold as any, letterSpacing: 1.2, color: colors.text.muted }}>
            REVIEWER FEEDBACK · score {review.score}
          </Text>
          {!!review.feedback && (
            <Text style={{ fontSize: fontSize.sm, color: colors.text.body, marginTop: 4, lineHeight: fontSize.sm * 1.5 }} numberOfLines={3}>
              {review.feedback}
            </Text>
          )}
        </View>
      )}

      {(submission.artifacts?.length ?? 0) > 0 && (
        <Text style={{ fontSize: fontSize.xs, color: colors.text.muted, marginTop: 8 }}>
          {submission.artifacts!.length} artifact{submission.artifacts!.length === 1 ? '' : 's'} attached
        </Text>
      )}
    </View>
  );
};

const styles = {
  eyebrow: { fontSize: fontSize.xs, fontWeight: fontWeight.bold as any, letterSpacing: 1.4, color: colors.text.muted, textTransform: 'uppercase' as const },
  title: { fontSize: fontSize['2xl'], fontWeight: fontWeight.extrabold as any, color: colors.text.primary, marginTop: 2 },
  subtitle: { fontSize: fontSize.sm, color: colors.text.body, marginTop: 4, lineHeight: fontSize.sm * 1.5 },
} as const;
