import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { AppScreen } from '@/components/AppScreen';
import { ChildSelector } from '@/components/ChildSelector';
import { SubjectProgressRow } from '@/components/SubjectProgressRow';
import { SectionHeader } from '@/components/SectionHeader';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { ErrorState } from '@/components/ErrorState';
import { EmptyState } from '@/components/EmptyState';
import { useApiQuery } from '@/hooks/useApiQuery';
import { parentApi, type ParentHomePayload } from '@/api/parent.api';
import { useParentStore } from '@/auth/parentStore';

/**
 * Parent Progress tab — subject-by-subject grid for the selected
 * child. Reuses the parent-home aggregator's `subjects` field so we
 * don't pay for a second round-trip.
 */
export default function ParentProgress() {
  const selectedChildId = useParentStore((s) => s.selectedChildId);
  const setSelectedChildId = useParentStore((s) => s.setSelectedChildId);
  const [refreshing, setRefreshing] = useState(false);

  const query = useApiQuery<ParentHomePayload>(
    ['parent-home', selectedChildId],
    () => parentApi.home(selectedChildId ?? undefined),
    { staleTime: 60_000 },
  );

  const data = query.data;
  const child = data?.selected_child ?? null;
  const subjects = child?.subjects || [];

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
        <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Subjects</Text>
        <Text className="text-2xl font-extrabold text-slate-900">Progress</Text>
        <Text className="text-sm text-slate-600 mt-1">Where {child?.name?.split(' ')[0] || 'your child'} is strong, and where they need help.</Text>
      </View>

      <View className="px-5 space-y-5">
        {data && data.children.length > 0 && (
          <ChildSelector
            children={data.children}
            selectedId={child?.id ?? null}
            onSelect={(c) => setSelectedChildId(c.id)}
          />
        )}

        {query.isLoading && !data ? (
          <LoadingSkeleton height={120} lines={3} />
        ) : query.isError ? (
          <ErrorState onRetry={() => query.refetch()} />
        ) : !child ? (
          <EmptyState title="No child linked yet" message="Once a child is linked, their subjects will show here." />
        ) : subjects.length === 0 ? (
          <EmptyState
            title="No subject data yet"
            message="Once your child completes lessons or assessments, you'll see subject-by-subject progress here."
          />
        ) : (
          <View>
            <SectionHeader title="Subject performance" description="Tap and hold any row to learn more." />
            {subjects.map((s, i) => <SubjectProgressRow key={`${s.subject}-${i}`} subject={s} />)}
          </View>
        )}
      </View>
    </AppScreen>
  );
}
