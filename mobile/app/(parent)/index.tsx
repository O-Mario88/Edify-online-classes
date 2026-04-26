import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { AppScreen } from '@/components/AppScreen';
import { AppCard } from '@/components/AppCard';
import { TodayHero } from '@/components/TodayHero';
import { ChildSelector } from '@/components/ChildSelector';
import { WeeklyBriefCard } from '@/components/WeeklyBriefCard';
import { PassportPreviewCard } from '@/components/PassportPreviewCard';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { ErrorState } from '@/components/ErrorState';
import { EmptyState } from '@/components/EmptyState';
import { useApiQuery } from '@/hooks/useApiQuery';
import { parentApi, type ParentHomePayload } from '@/api/parent.api';
import { useAuthStore } from '@/auth/authStore';
import { useParentStore } from '@/auth/parentStore';

/**
 * Parent home — the "understand my child's progress in under one
 * minute" screen the spec asks for.
 *
 * Layout, top → bottom:
 *   1. Greeting
 *   2. Today hero (reuses /dashboard/today/'s parent branch)
 *   3. Child selector (only if >1 children)
 *   4. Weekly Brief — narrative + strongest/attendance/trend + focus
 *   5. KPI strip (4 tiles using the canonical learner vocabulary)
 *   6. Teacher Support Summary (questions answered + pending)
 *   7. Passport preview (badges / certificates / projects reviewed)
 *
 * All seven blocks come from one /mobile/parent-home/ round-trip.
 */
export default function ParentHome() {
  const router = useRouter();
  const parentUser = useAuthStore((s) => s.user);
  const selectedChildId = useParentStore((s) => s.selectedChildId);
  const setSelectedChildId = useParentStore((s) => s.setSelectedChildId);
  const [refreshing, setRefreshing] = useState(false);

  const homeQuery = useApiQuery<ParentHomePayload>(
    ['parent-home', selectedChildId],
    () => parentApi.home(selectedChildId ?? undefined),
    { staleTime: 60_000 },
  );

  // Hydrate the selected-child store on first paint so every other tab
  // starts on the same child.
  useEffect(() => {
    if (selectedChildId == null && homeQuery.data?.selected_child) {
      setSelectedChildId(homeQuery.data.selected_child.id);
    }
  }, [homeQuery.data?.selected_child, selectedChildId, setSelectedChildId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await homeQuery.refetch();
    setRefreshing(false);
  };

  const data = homeQuery.data;
  const firstName = (parentUser?.full_name || data?.parent?.full_name || 'there').split(' ')[0];
  const child = data?.selected_child ?? null;
  const childFirstName = child?.name?.split(' ')[0] || 'your child';

  return (
    <AppScreen onRefresh={onRefresh} refreshing={refreshing}>
      <View className="px-5 pt-6 pb-3">
        <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Maple</Text>
        <Text className="text-2xl font-extrabold text-slate-900">Hi, {firstName}</Text>
      </View>

      <View className="px-5 space-y-5">
        {homeQuery.isLoading && !data ? (
          <LoadingSkeleton height={140} lines={3} />
        ) : homeQuery.isError ? (
          <ErrorState onRetry={() => homeQuery.refetch()} />
        ) : data ? (
          <>
            <TodayHero payload={data.today} />

            {data.children.length > 0 ? (
              <ChildSelector
                children={data.children}
                selectedId={child?.id ?? null}
                onSelect={(c) => setSelectedChildId(c.id)}
              />
            ) : (
              <EmptyState
                title="No child linked yet"
                message="Once your child's school links you to their account, you'll see their progress here."
              />
            )}

            {child && (
              <>
                <WeeklyBriefCard brief={child.weekly_brief} childFirstName={childFirstName} />
                <KpiStrip kpis={child.kpis} childFirstName={childFirstName} />
                <TeacherSupportCard
                  answered={child.teacher_support.questions_answered}
                  pending={child.teacher_support.pending_requests}
                />
                <PassportPreviewCard passport={child.passport} childFirstName={childFirstName} />
              </>
            )}
          </>
        ) : null}
      </View>
    </AppScreen>
  );
}

const KpiStrip: React.FC<{ kpis: ParentHomePayload['selected_child']['kpis']; childFirstName: string }> = ({ kpis, childFirstName }) => (
  <View>
    <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
      {childFirstName}'s standing this term
    </Text>
    <View className="flex-row flex-wrap -mx-1.5">
      <KpiTile label="Progress"   value={`${kpis.overall_progress}%`} accent="text-emerald-700" />
      <KpiTile label="Attendance" value={`${kpis.attendance}%`}       accent={kpis.attendance < 75 ? 'text-rose-600' : 'text-emerald-700'} />
      <KpiTile label="Readiness"  value={`${kpis.exam_readiness}`}    accent="text-indigo-700" />
      <KpiTile label="Overdue"    value={`${kpis.overdue_work}`}      accent={kpis.overdue_work > 0 ? 'text-amber-700' : 'text-emerald-700'} />
    </View>
  </View>
);

const KpiTile: React.FC<{ label: string; value: string; accent: string }> = ({ label, value, accent }) => (
  <View className="w-1/2 px-1.5 mb-3">
    <AppCard className="py-4">
      <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{label}</Text>
      <Text className={`text-2xl font-extrabold mt-1 ${accent}`}>{value}</Text>
    </AppCard>
  </View>
);

const TeacherSupportCard: React.FC<{ answered: number; pending: number }> = ({ answered, pending }) => (
  <AppCard>
    <Text className="text-[11px] font-bold uppercase tracking-wider text-teal-700 mb-1">Teacher support</Text>
    <View className="flex-row mt-2">
      <View className="flex-1">
        <Text className="text-2xl font-extrabold text-slate-900">{answered}</Text>
        <Text className="text-xs text-slate-500 mt-0.5">Questions answered</Text>
      </View>
      <View className="flex-1">
        <Text className={`text-2xl font-extrabold ${pending > 0 ? 'text-amber-700' : 'text-slate-900'}`}>{pending}</Text>
        <Text className="text-xs text-slate-500 mt-0.5">Pending requests</Text>
      </View>
    </View>
  </AppCard>
);
