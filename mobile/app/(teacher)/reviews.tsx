import React, { useState, useMemo } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AppScreen } from '@/components/AppScreen';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { ErrorState } from '@/components/ErrorState';
import { EmptyState } from '@/components/EmptyState';
import { useApiQuery } from '@/hooks/useApiQuery';
import { teacherApi, type ReviewQueueItem } from '@/api/teacher.api';

type FilterKey = 'all' | 'project' | 'essay' | 'lab_attempt' | 'exam_essay';
const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all',         label: 'All' },
  { key: 'project',     label: 'Projects' },
  { key: 'essay',       label: 'Essays' },
  { key: 'lab_attempt', label: 'Labs' },
  { key: 'exam_essay',  label: 'Exam essays' },
];

const KIND_TINT: Record<string, { bg: string; fg: string; icon: keyof typeof Ionicons.glyphMap }> = {
  project:     { bg: '#FFE4E6', fg: '#9F1239', icon: 'construct-outline' },
  essay:       { bg: '#E0E7FF', fg: '#3730A3', icon: 'create-outline' },
  lab_attempt: { bg: '#D1FAE5', fg: '#065F46', icon: 'flask-outline' },
  exam_essay:  { bg: '#FEF3C7', fg: '#92400E', icon: 'reader-outline' },
};

/**
 * Review queue — pulls every submission waiting for the teacher's
 * input, with filters for the four common kinds. Tapping a row pushes
 * to /(teacher)/review/[id] for the rubric + feedback flow.
 */
export default function TeacherReviewsTab() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterKey>('all');

  const query = useApiQuery<ReviewQueueItem[]>(
    ['teacher-reviews'],
    () => teacherApi.reviewQueue(),
    { staleTime: 60_000 },
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await query.refetch();
    setRefreshing(false);
  };

  const items = query.data ?? [];
  const filtered = useMemo(() => {
    if (filter === 'all') return items;
    return items.filter((i) => i.kind === filter);
  }, [items, filter]);

  // Sort: urgent first, then oldest
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (a.priority === 'urgent' && b.priority !== 'urgent') return -1;
      if (b.priority === 'urgent' && a.priority !== 'urgent') return 1;
      return new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime();
    });
  }, [filtered]);

  return (
    <AppScreen onRefresh={onRefresh} refreshing={refreshing}>
      <View className="px-5 pt-6 pb-3">
        <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Queue</Text>
        <Text className="text-2xl font-extrabold text-slate-900">Review queue</Text>
        <Text className="text-sm text-slate-600 mt-1">
          Oldest first — urgent items pinned to the top.
        </Text>
      </View>

      <View className="pl-5">
        <View className="flex-row" style={{ gap: 8 }}>
          {FILTERS.map((f) => (
            <Pressable
              key={f.key}
              onPress={() => setFilter(f.key)}
              accessibilityRole="tab"
              accessibilityState={{ selected: filter === f.key }}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 7,
                borderRadius: 999,
                backgroundColor: filter === f.key ? '#0F172A' : '#F1F5F9',
              }}
            >
              <Text style={{ fontSize: 11, fontWeight: '800', color: filter === f.key ? '#FFFFFF' : '#64748B' }}>
                {f.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View className="px-5 mt-5">
        {query.isLoading && items.length === 0 ? (
          <LoadingSkeleton height={84} lines={3} />
        ) : query.isError ? (
          <ErrorState onRetry={() => query.refetch()} />
        ) : sorted.length === 0 ? (
          <EmptyState
            title="No items in this filter"
            message="Pull down to refresh, or switch filter to see other kinds of submissions."
          />
        ) : (
          sorted.map((item) => (
            <ReviewRow
              key={String(item.id)}
              item={item}
              onPress={() => router.push(`/(teacher)/review/${item.id}` as any)}
            />
          ))
        )}
      </View>
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

function relativeAge(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 60 * 60 * 1000) return `${Math.max(1, Math.round(ms / 60000))}m`;
  if (ms < 24 * 60 * 60 * 1000) return `${Math.round(ms / (60 * 60 * 1000))}h`;
  return `${Math.round(ms / (24 * 60 * 60 * 1000))}d`;
}

const ReviewRow: React.FC<{ item: ReviewQueueItem; onPress: () => void }> = ({ item, onPress }) => {
  const tint = KIND_TINT[item.kind] || KIND_TINT.essay;
  const urgent = item.priority === 'urgent';
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Review ${item.title}`}
      className="bg-white rounded-2xl p-4 mb-3 flex-row items-center"
      style={cardShadow}
    >
      <View
        className="w-11 h-11 rounded-2xl items-center justify-center mr-3"
        style={{ backgroundColor: tint.bg }}
      >
        <Ionicons name={tint.icon} size={20} color={tint.fg} />
      </View>
      <View className="flex-1 pr-3">
        <View className="flex-row items-center">
          <Text numberOfLines={1} className="text-sm font-extrabold text-slate-900 flex-1 pr-2">
            {item.title}
          </Text>
          {urgent && (
            <View className="px-2 py-0.5 rounded-full" style={{ backgroundColor: '#FEE2E2' }}>
              <Text className="text-[10px] font-bold text-rose-700">URGENT</Text>
            </View>
          )}
        </View>
        <Text numberOfLines={1} className="text-xs text-slate-500 mt-0.5">
          {item.student_name}{item.subject ? ` · ${item.subject}` : ''}
        </Text>
      </View>
      <Text className="text-[11px] font-bold text-slate-400 ml-2">{relativeAge(item.submitted_at)} ago</Text>
    </Pressable>
  );
};
