import React, { useMemo, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AppScreen } from '@/components/AppScreen';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { ErrorState } from '@/components/ErrorState';
import { EmptyState } from '@/components/EmptyState';
import { useApiQuery } from '@/hooks/useApiQuery';
import { examSimulatorApi, type MistakeEntry } from '@/api/learning.api';

/**
 * Mistake Notebook — every question the learner got wrong, grouped by
 * subject. "Improved" entries collapse into a small footer counter so
 * the active list stays focused on what still needs work.
 */
export default function MistakeNotebookScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const query = useApiQuery<MistakeEntry[]>(
    ['mistake-notebook'],
    () => examSimulatorApi.mistakes(),
    { staleTime: 60_000 },
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await query.refetch();
    setRefreshing(false);
  };

  const items = query.data ?? [];
  const active = items.filter((m) => !m.improved);
  const improved = items.filter((m) => m.improved);

  const grouped = useMemo(() => {
    const map = new Map<string, MistakeEntry[]>();
    active.forEach((m) => {
      const key = m.subject || 'Other';
      const list = map.get(key) || [];
      list.push(m);
      map.set(key, list);
    });
    return Array.from(map.entries());
  }, [active]);

  return (
    <AppScreen onRefresh={onRefresh} refreshing={refreshing}>
      <View className="px-5 pt-6 pb-3">
        <Pressable onPress={() => router.back()} className="mb-2">
          <Text className="text-sm font-semibold text-maple-900">← Back</Text>
        </Pressable>
        <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Revision</Text>
        <Text className="text-2xl font-extrabold text-slate-900">Mistake Notebook</Text>
        <Text className="text-sm text-slate-600 mt-1">
          Spaced revision keeps mistakes from becoming habits.
        </Text>
      </View>

      {query.isLoading && items.length === 0 ? (
        <View className="px-5"><LoadingSkeleton height={84} lines={3} /></View>
      ) : query.isError ? (
        <View className="px-5"><ErrorState onRetry={() => query.refetch()} /></View>
      ) : grouped.length === 0 && improved.length === 0 ? (
        <View className="px-5">
          <EmptyState
            title="Nothing in the notebook"
            message="Mistakes from your mocks and practice show up here so you can re-attempt them."
          />
        </View>
      ) : (
        <View className="px-5">
          {grouped.map(([subject, entries]) => (
            <View key={subject} className="mb-5">
              <Text className="text-[11px] font-bold uppercase tracking-wider text-amber-700 mb-3">
                {subject} · {entries.length}
              </Text>
              {entries.map((m) => (
                <MistakeCard
                  key={String(m.id)}
                  m={m}
                  onRetry={async () => {
                    await examSimulatorApi.retryMistake(m.id);
                    await query.refetch();
                  }}
                />
              ))}
            </View>
          ))}
          {improved.length > 0 && (
            <View
              className="rounded-2xl p-4 mb-2 flex-row items-center"
              style={{ backgroundColor: '#D1FAE5' }}
            >
              <View className="w-10 h-10 rounded-2xl bg-white items-center justify-center mr-3">
                <Ionicons name="trending-up-outline" size={20} color="#065F46" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-extrabold text-emerald-900">
                  {improved.length} mistake{improved.length === 1 ? '' : 's'} fixed
                </Text>
                <Text className="text-xs text-emerald-800 mt-0.5">
                  Re-solved at least twice. They've left the active list.
                </Text>
              </View>
            </View>
          )}
        </View>
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

const MistakeCard: React.FC<{ m: MistakeEntry; onRetry: () => void }> = ({ m, onRetry }) => (
  <View className="bg-white rounded-2xl p-4 mb-3" style={cardShadow}>
    <Text className="text-sm text-slate-800 leading-relaxed">{m.question_text}</Text>
    <View className="flex-row items-center justify-between mt-3">
      <Text className="text-[11px] text-slate-500">
        {m.topic ? `${m.topic} · ` : ''}{m.source_label || 'Mock'}
      </Text>
      <Pressable
        onPress={onRetry}
        accessibilityRole="button"
        accessibilityLabel="Retry this question"
        className="px-3 py-1.5 rounded-full"
        style={{ backgroundColor: '#FEF3C7' }}
      >
        <Text className="text-[11px] font-bold text-amber-900">Retry similar</Text>
      </Pressable>
    </View>
  </View>
);
