import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { AppScreen } from '@/components/AppScreen';
import { AppCard } from '@/components/AppCard';
import { ChildSelector } from '@/components/ChildSelector';
import { SectionHeader } from '@/components/SectionHeader';
import { PassportPreviewCard } from '@/components/PassportPreviewCard';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { ErrorState } from '@/components/ErrorState';
import { EmptyState } from '@/components/EmptyState';
import { useApiQuery } from '@/hooks/useApiQuery';
import { parentApi, type ParentHomePayload } from '@/api/parent.api';
import { useParentStore } from '@/auth/parentStore';

/**
 * Reports tab — exam readiness + passport preview for the selected
 * child. Phase 3 walking-skeleton: surface what already exists in the
 * /mobile/parent-home/ aggregator. Detailed assessment-result drill-
 * down (filterable list of graded submissions) lands in Phase 5 with
 * the rest of the assessment surface.
 */
export default function ParentReports() {
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
  const childFirstName = child?.name?.split(' ')[0] || 'Your child';

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
        <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Evidence</Text>
        <Text className="text-2xl font-extrabold text-slate-900">Reports</Text>
        <Text className="text-sm text-slate-600 mt-1">Exam readiness, passport, and verified achievements.</Text>
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
          <LoadingSkeleton height={140} lines={2} />
        ) : query.isError ? (
          <ErrorState onRetry={() => query.refetch()} />
        ) : !child ? (
          <EmptyState title="No child linked yet" message="Once a child is linked, their reports will show here." />
        ) : (
          <>
            <ExamReadinessCard
              readiness={child.kpis.exam_readiness}
              attendance={child.kpis.attendance}
              completed={child.kpis.assessments_completed}
              maxScore={100}
              childFirstName={childFirstName}
            />
            <PassportPreviewCard passport={child.passport} childFirstName={childFirstName} />
            <View>
              <SectionHeader title="Recent results" description="Your child's latest graded work." />
              <EmptyState
                title="Detailed grade history coming soon"
                message="For now you'll see graded items in the Today hero and the Weekly Brief. Full filterable history lands with the next update."
              />
            </View>
          </>
        )}
      </View>
    </AppScreen>
  );
}

const ExamReadinessCard: React.FC<{
  readiness: number; attendance: number; completed: number; maxScore: number; childFirstName: string;
}> = ({ readiness, attendance, completed, childFirstName }) => {
  const band =
    readiness >= 80 ? { label: 'Strong', tint: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-800' } :
    readiness >= 60 ? { label: 'Moderate', tint: 'bg-amber-50 border-amber-200',   text: 'text-amber-800' } :
                      { label: 'At risk', tint: 'bg-rose-50 border-rose-200',     text: 'text-rose-800' };
  return (
    <View className={`rounded-2xl border p-5 ${band.tint}`}>
      <Text className={`text-[11px] font-bold uppercase tracking-wider ${band.text} mb-1`}>
        Exam readiness · {band.label}
      </Text>
      <Text className="text-3xl font-extrabold text-slate-900 mt-1">{readiness}</Text>
      <Text className="text-sm text-slate-700 leading-relaxed mt-2">
        Based on completed assessments + attendance + practice activity.
      </Text>
      <View className="mt-3 flex-row gap-4">
        <View className="flex-1">
          <Text className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Assessments done</Text>
          <Text className="text-base font-extrabold text-slate-900 mt-0.5">{completed}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Attendance</Text>
          <Text className={`text-base font-extrabold mt-0.5 ${attendance < 75 ? 'text-rose-600' : 'text-emerald-700'}`}>
            {attendance}%
          </Text>
        </View>
      </View>
    </View>
  );
};
