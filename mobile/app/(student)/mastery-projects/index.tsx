import React, { useMemo, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AppScreen } from '@/components/AppScreen';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { ErrorState } from '@/components/ErrorState';
import { EmptyState } from '@/components/EmptyState';
import { useApiQuery } from '@/hooks/useApiQuery';
import {
  masteryProjectsApi,
  type MasteryProjectSubmission,
  type MasteryProjectSummary,
} from '@/api/learning.api';

const STATUS_TINT: Record<string, { bg: string; fg: string; label: string }> = {
  draft:               { bg: '#FEF3C7', fg: '#92400E', label: 'Draft' },
  submitted:           { bg: '#E0E7FF', fg: '#3730A3', label: 'Awaiting review' },
  reviewed:            { bg: '#D1FAE5', fg: '#065F46', label: 'Reviewed' },
  revisions_requested: { bg: '#FFE4E6', fg: '#9F1239', label: 'Revisions needed' },
};

/**
 * Mastery Projects — projects available to attempt and the learner's
 * own submissions. Submissions show status pills and (when reviewed)
 * the score / feedback inline.
 */
export default function MasteryProjectsScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const projectsQuery = useApiQuery<MasteryProjectSummary[]>(
    ['mastery-projects'],
    () => masteryProjectsApi.list(),
    { staleTime: 60_000 },
  );
  const submissionsQuery = useApiQuery<MasteryProjectSubmission[]>(
    ['mastery-projects-submissions'],
    () => masteryProjectsApi.mySubmissions(),
    { staleTime: 60_000 },
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([projectsQuery.refetch(), submissionsQuery.refetch()]);
    setRefreshing(false);
  };

  const projects = projectsQuery.data ?? [];
  const submissions = submissionsQuery.data ?? [];
  const submittedIds = new Set(submissions.map((s) => String(s.project_id)));
  const browseable = useMemo(() => projects.filter((p) => !submittedIds.has(String(p.id))), [projects, submittedIds]);

  const isLoading = (projectsQuery.isLoading && projects.length === 0)
    || (submissionsQuery.isLoading && submissions.length === 0);

  return (
    <AppScreen onRefresh={onRefresh} refreshing={refreshing}>
      <View className="px-5 pt-6 pb-3">
        <Pressable onPress={() => router.back()} className="mb-2">
          <Text className="text-sm font-semibold text-maple-900">← Back</Text>
        </Pressable>
        <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Projects</Text>
        <Text className="text-2xl font-extrabold text-slate-900">Mastery Projects</Text>
        <Text className="text-sm text-slate-600 mt-1">
          Prove you can apply what you've learnt. Reviewed projects earn a Passport entry.
        </Text>
      </View>

      {isLoading ? (
        <View className="px-5"><LoadingSkeleton height={120} lines={3} /></View>
      ) : projectsQuery.isError ? (
        <View className="px-5"><ErrorState onRetry={() => projectsQuery.refetch()} /></View>
      ) : (
        <>
          {submissions.length > 0 && (
            <View className="px-5 mb-5">
              <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">
                My submissions
              </Text>
              {submissions.map((s) => <SubmissionCard key={String(s.id)} s={s} />)}
            </View>
          )}

          <View className="px-5">
            <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">
              Available projects
            </Text>
            {browseable.length === 0 ? (
              submissions.length > 0 ? (
                <Text className="text-xs text-slate-500 leading-relaxed">
                  You've started every available project. New ones land as your school adds them.
                </Text>
              ) : (
                <EmptyState
                  title="No projects yet"
                  message="When your school publishes Mastery Projects for your level, they'll appear here."
                />
              )
            ) : (
              browseable.map((p) => (
                <ProjectRow
                  key={String(p.id)}
                  p={p}
                  onStart={async () => {
                    await masteryProjectsApi.startSubmission(p.id);
                    await submissionsQuery.refetch();
                  }}
                />
              ))
            )}
          </View>
        </>
      )}
    </AppScreen>
  );
}

const cardShadow = {
  elevation: 1,
  shadowColor: '#0F172A',
  shadowOpacity: 0.05,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 },
} as const;

const SubmissionCard: React.FC<{ s: MasteryProjectSubmission }> = ({ s }) => {
  const tint = STATUS_TINT[s.status] || STATUS_TINT.draft;
  return (
    <View className="bg-white rounded-2xl p-4 mb-3" style={cardShadow}>
      <View className="flex-row items-center mb-1.5">
        <View className="px-2 py-0.5 rounded-full mr-2" style={{ backgroundColor: tint.bg }}>
          <Text className="text-[10px] font-bold" style={{ color: tint.fg }}>{tint.label.toUpperCase()}</Text>
        </View>
        {s.score != null && (
          <Text className="text-[11px] font-bold text-emerald-700 ml-auto">{s.score}%</Text>
        )}
      </View>
      <Text className="text-base font-extrabold text-slate-900">{s.project_title}</Text>
      <Text className="text-[11px] text-slate-500 mt-0.5">
        Updated {new Date(s.updated_at).toLocaleDateString()}
      </Text>
      {s.feedback && (
        <View className="mt-3 pt-3 border-t border-slate-100">
          <Text className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 mb-1">
            Teacher feedback
          </Text>
          <Text numberOfLines={4} className="text-xs text-slate-700 leading-relaxed">{s.feedback}</Text>
        </View>
      )}
    </View>
  );
};

const ProjectRow: React.FC<{ p: MasteryProjectSummary; onStart: () => void }> = ({ p, onStart }) => (
  <View className="bg-white rounded-2xl p-4 mb-3" style={cardShadow}>
    <Text className="text-[10px] font-bold uppercase tracking-wider text-rose-700">{p.subject}</Text>
    <Text className="text-base font-extrabold text-slate-900 mt-1">{p.title}</Text>
    {!!p.rubric_summary && (
      <Text numberOfLines={2} className="text-xs text-slate-600 mt-1 leading-relaxed">{p.rubric_summary}</Text>
    )}
    <View className="flex-row items-center justify-between mt-3">
      {p.due_at ? (
        <Text className="text-[11px] text-slate-500">
          Due {new Date(p.due_at).toLocaleDateString()}
        </Text>
      ) : <View />}
      <Pressable
        onPress={onStart}
        accessibilityRole="button"
        accessibilityLabel={`Start ${p.title}`}
        className="px-4 py-2 rounded-full bg-maple-900"
      >
        <Text className="text-xs font-bold text-white">Start</Text>
      </Pressable>
    </View>
  </View>
);
