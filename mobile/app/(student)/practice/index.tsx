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
  practiceLabsApi,
  type PracticeLabSummary,
  type PracticeLabAttempt,
} from '@/api/learning.api';

const DIFF_LABEL: Record<string, { bg: string; fg: string }> = {
  easy:   { bg: '#D1FAE5', fg: '#065F46' },
  medium: { bg: '#FEF3C7', fg: '#92400E' },
  hard:   { bg: '#FFE4E6', fg: '#9F1239' },
};

/**
 * Practice Labs — Browse, Try, Submit, Earn-a-badge flow.
 *
 * Two streams: in-progress attempts pinned at the top, then the lab
 * catalogue below. Tap-through to a detail view will land in the
 * follow-up; for now starting an attempt creates one server-side and
 * stays on this list.
 */
export default function PracticeLabsScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const labsQuery = useApiQuery<PracticeLabSummary[]>(
    ['practice-labs'],
    () => practiceLabsApi.list(),
    { staleTime: 60_000 },
  );
  const attemptsQuery = useApiQuery<PracticeLabAttempt[]>(
    ['practice-labs-attempts'],
    () => practiceLabsApi.myAttempts(),
    { staleTime: 60_000 },
  );

  const labs = labsQuery.data ?? [];
  const attempts = attemptsQuery.data ?? [];
  const inProgress = attempts.filter((a) => a.status === 'in_progress');
  const labById = useMemo(() => Object.fromEntries(labs.map((l) => [String(l.id), l])), [labs]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([labsQuery.refetch(), attemptsQuery.refetch()]);
    setRefreshing(false);
  };

  const isLoading = (labsQuery.isLoading && labs.length === 0) || (attemptsQuery.isLoading && attempts.length === 0);

  return (
    <AppScreen onRefresh={onRefresh} refreshing={refreshing}>
      <View className="px-5 pt-6 pb-3">
        <Pressable onPress={() => router.back()} className="mb-2">
          <Text className="text-sm font-semibold text-maple-900">← Back</Text>
        </Pressable>
        <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Practice</Text>
        <Text className="text-2xl font-extrabold text-slate-900">Practice Labs</Text>
        <Text className="text-sm text-slate-600 mt-1">
          Hands-on practice with instant feedback. Earn a badge once you finish.
        </Text>
      </View>

      {isLoading ? (
        <View className="px-5"><LoadingSkeleton height={84} lines={4} /></View>
      ) : labsQuery.isError ? (
        <View className="px-5"><ErrorState onRetry={() => labsQuery.refetch()} /></View>
      ) : (
        <>
          {inProgress.length > 0 && (
            <View className="px-5 mb-4">
              <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">
                Continue
              </Text>
              {inProgress.map((a) => {
                const lab = labById[String(a.lab_id)];
                return (
                  <Pressable
                    key={String(a.id)}
                    accessibilityRole="button"
                    accessibilityLabel={`Continue ${lab?.title ?? 'lab'}`}
                    className="bg-white rounded-2xl p-4 mb-3 flex-row items-center"
                    style={cardShadow}
                  >
                    <View className="w-11 h-11 rounded-2xl bg-emerald-100 items-center justify-center mr-3">
                      <Ionicons name="flask-outline" size={20} color="#065F46" />
                    </View>
                    <View className="flex-1">
                      <Text numberOfLines={1} className="text-sm font-extrabold text-slate-900">
                        {lab?.title ?? 'Practice lab'}
                      </Text>
                      <Text className="text-xs text-slate-500 mt-0.5">In progress · {lab?.subject ?? 'Practice'}</Text>
                    </View>
                    <Ionicons name="play" size={18} color="#0F172A" />
                  </Pressable>
                );
              })}
            </View>
          )}

          <View className="px-5">
            <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">
              Catalogue
            </Text>
            {labs.length === 0 ? (
              <EmptyState
                title="No labs published yet"
                message="Your school will publish guided practice for the topics you're learning. Check back soon."
              />
            ) : (
              labs.map((l) => (
                <LabRow
                  key={String(l.id)}
                  lab={l}
                  onStart={async () => {
                    await practiceLabsApi.start(l.id);
                    await attemptsQuery.refetch();
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

const LabRow: React.FC<{ lab: PracticeLabSummary; onStart: () => void }> = ({ lab, onStart }) => {
  const diff = DIFF_LABEL[(lab.difficulty || 'easy').toString()] || DIFF_LABEL.easy;
  return (
    <View className="bg-white rounded-2xl p-4 mb-3" style={cardShadow}>
      <View className="flex-row items-center mb-1.5">
        <Text className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
          {lab.subject}
        </Text>
        {lab.difficulty && (
          <View
            className="ml-2 px-2 py-0.5 rounded-full"
            style={{ backgroundColor: diff.bg }}
          >
            <Text className="text-[10px] font-bold" style={{ color: diff.fg }}>
              {String(lab.difficulty).toUpperCase()}
            </Text>
          </View>
        )}
        {lab.duration_minutes && (
          <Text className="text-[10px] font-semibold text-slate-400 ml-2">
            {lab.duration_minutes} min
          </Text>
        )}
      </View>
      <Text className="text-base font-extrabold text-slate-900">{lab.title}</Text>
      {!!lab.topic && <Text className="text-xs text-slate-500 mt-1">{lab.topic}</Text>}
      <Pressable
        onPress={onStart}
        accessibilityRole="button"
        accessibilityLabel={`Start ${lab.title}`}
        className="mt-3 self-start px-4 py-2 rounded-full bg-maple-900"
      >
        <Text className="text-xs font-bold text-white">Start lab</Text>
      </Pressable>
    </View>
  );
};
