import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { AppScreen } from '@/components/AppScreen';
import { LessonCard } from '@/components/LessonCard';
import { SectionHeader } from '@/components/SectionHeader';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { ErrorState } from '@/components/ErrorState';
import { EmptyState } from '@/components/EmptyState';
import { useApiQuery } from '@/hooks/useApiQuery';
import { studentApi, type StudentHomePayload } from '@/api/student.api';

/**
 * Learn tab — content library list. Phase 2 surfaces the recent
 * lessons returned by the home aggregator. Phase 3+ will add subject
 * filters, search, and a separate /mobile/learn-feed/ endpoint with
 * paginated content.
 */
export default function LearnTab() {
  const [refreshing, setRefreshing] = useState(false);
  const homeQuery = useApiQuery<StudentHomePayload>(
    ['student-home'], // share cache with Home tab
    () => studentApi.home(),
    { staleTime: 60_000 },
  );

  const lessons = homeQuery.data?.recent_lessons || [];

  return (
    <AppScreen
      onRefresh={async () => {
        setRefreshing(true);
        await homeQuery.refetch();
        setRefreshing(false);
      }}
      refreshing={refreshing}
    >
      <View className="px-5 pt-6 pb-3">
        <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Library</Text>
        <Text className="text-2xl font-extrabold text-slate-900">Learn</Text>
        <Text className="text-sm text-slate-600 mt-1">Your lessons, notes, videos, and revision material.</Text>
      </View>
      <View className="px-5">
        <SectionHeader title="Recent lessons" description="Pick up where you left off." />
        {homeQuery.isLoading && lessons.length === 0 ? (
          <LoadingSkeleton height={84} lines={4} />
        ) : homeQuery.isError ? (
          <ErrorState onRetry={() => homeQuery.refetch()} />
        ) : lessons.length === 0 ? (
          <EmptyState
            title="No lessons yet"
            message="When your teacher publishes a lesson, it'll appear here. Pull down to refresh."
          />
        ) : (
          lessons.map((l) => <LessonCard key={l.id} lesson={l} />)
        )}
      </View>
    </AppScreen>
  );
}
