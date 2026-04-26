import React, { useState, useMemo } from 'react';
import { View, Text } from 'react-native';
import { AppScreen } from '@/components/AppScreen';
import { AssignmentCard } from '@/components/AssignmentCard';
import { SectionHeader } from '@/components/SectionHeader';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { ErrorState } from '@/components/ErrorState';
import { EmptyState } from '@/components/EmptyState';
import { useApiQuery } from '@/hooks/useApiQuery';
import { studentApi, type StudentHomePayload } from '@/api/student.api';

/**
 * Tasks tab — assignments due in the next two weeks. Splits into
 * "overdue" + "due soon" so a learner sees what's blocking first.
 *
 * In Phase 3 we'll add tabs for Practice Labs / Mastery Projects /
 * Mistake Notebook here, plus a status filter (in progress / done).
 */
export default function TasksTab() {
  const [refreshing, setRefreshing] = useState(false);
  const query = useApiQuery<StudentHomePayload>(
    ['student-home'],
    () => studentApi.home(),
    { staleTime: 60_000 },
  );

  const items = query.data?.upcoming_assignments || [];
  const { overdue, due } = useMemo(() => {
    const now = Date.now();
    return {
      overdue: items.filter((a) => new Date(a.close_at).getTime() < now),
      due:     items.filter((a) => new Date(a.close_at).getTime() >= now),
    };
  }, [items]);

  return (
    <AppScreen
      onRefresh={async () => {
        setRefreshing(true);
        await query.refetch();
        setRefreshing(false);
      }}
      refreshing={refreshing}
    >
      <View className="px-5 pt-6 pb-3">
        <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500">My work</Text>
        <Text className="text-2xl font-extrabold text-slate-900">Tasks</Text>
        <Text className="text-sm text-slate-600 mt-1">Assignments and assessments due in the next two weeks.</Text>
      </View>

      <View className="px-5 space-y-5">
        {query.isLoading && items.length === 0 ? (
          <LoadingSkeleton height={96} lines={3} />
        ) : query.isError ? (
          <ErrorState onRetry={() => query.refetch()} />
        ) : items.length === 0 ? (
          <EmptyState
            title="No assignments due"
            message="When a teacher publishes an assessment, it'll show up here."
          />
        ) : (
          <>
            {overdue.length > 0 && (
              <View>
                <SectionHeader title="Overdue" description="Clear these first." />
                {overdue.map((a) => <AssignmentCard key={a.id} assignment={a} />)}
              </View>
            )}
            {due.length > 0 && (
              <View>
                <SectionHeader title="Due soon" />
                {due.map((a) => <AssignmentCard key={a.id} assignment={a} />)}
              </View>
            )}
          </>
        )}
      </View>
    </AppScreen>
  );
}
