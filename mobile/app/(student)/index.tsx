import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { AppScreen } from '@/components/AppScreen';
import { AppCard } from '@/components/AppCard';
import { TodayHero } from '@/components/TodayHero';
import { TaskItem } from '@/components/TaskItem';
import { LiveClassCard } from '@/components/LiveClassCard';
import { AssignmentCard } from '@/components/AssignmentCard';
import { SectionHeader } from '@/components/SectionHeader';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { ErrorState } from '@/components/ErrorState';
import { EmptyState } from '@/components/EmptyState';
import { useApiQuery } from '@/hooks/useApiQuery';
import { studentApi, type StudentHomePayload } from '@/api/student.api';
import { useAuthStore } from '@/auth/authStore';

/**
 * Phase 2 student home. Five blocks, top to bottom:
 *
 *   1. Greeting + tier chip (compact, doesn't dominate)
 *   2. TodayHero card — single highest-priority action
 *   3. KPI strip (4 tiles)
 *   4. Today's Learning Plan list — the daily-coach surface
 *   5. Next live class + first 3 upcoming assignments — drill-into-tab affordances
 *
 * Everything reads from the same /mobile/student-home/ payload so a
 * cold start is one round-trip. Pull-to-refresh re-runs the same fetch.
 */
export default function StudentHome() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [refreshing, setRefreshing] = useState(false);

  const homeQuery = useApiQuery<StudentHomePayload>(
    ['student-home'],
    () => studentApi.home(),
    { staleTime: 60_000 },
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await homeQuery.refetch();
    setRefreshing(false);
  };

  const data = homeQuery.data;
  const firstName = (user?.full_name || data?.user?.full_name || 'there').split(' ')[0];

  return (
    <AppScreen onRefresh={onRefresh} refreshing={refreshing}>
      <View className="px-5 pt-6 pb-3">
        <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Maple</Text>
        <Text className="text-2xl font-extrabold text-slate-900">Hi, {firstName}</Text>
        {data?.access?.tier === 'premium' && (
          <Text className="text-xs font-semibold text-emerald-700 mt-1">
            Premium · {data.access.plan ?? 'plan'} active
          </Text>
        )}
      </View>

      <View className="px-5 space-y-5">
        {homeQuery.isLoading && !data ? (
          <LoadingSkeleton height={140} />
        ) : homeQuery.isError ? (
          <ErrorState onRetry={() => homeQuery.refetch()} />
        ) : data ? (
          <>
            <TodayHero payload={data.today} />
            <KpiStrip kpis={data.kpis} />
            <TodayPlanList tasks={data.today_tasks} />
            {data.next_live_session && (
              <View>
                <SectionHeader
                  title="Next live class"
                  actionLabel="See all"
                  onActionPress={() => router.push('/(student)/live' as any)}
                />
                <LiveClassCard
                  title={data.next_live_session.title}
                  subject={data.next_live_session.subject}
                  scheduledStart={data.next_live_session.scheduled_start}
                  durationMinutes={data.next_live_session.duration_minutes}
                  meetingLink={data.next_live_session.meeting_link}
                />
              </View>
            )}
            {data.upcoming_assignments && data.upcoming_assignments.length > 0 && (
              <View>
                <SectionHeader
                  title="Upcoming work"
                  description="Due in the next two weeks"
                  actionLabel="See all"
                  onActionPress={() => router.push('/(student)/tasks' as any)}
                />
                {data.upcoming_assignments.slice(0, 3).map((a) => (
                  <AssignmentCard key={a.id} assignment={a} />
                ))}
              </View>
            )}
          </>
        ) : null}
      </View>
    </AppScreen>
  );
}

const KpiStrip: React.FC<{ kpis: StudentHomePayload['kpis'] }> = ({ kpis }) => (
  <View className="flex-row flex-wrap -mx-1.5">
    <KpiTile label="Progress" value={`${kpis.overall_progress}%`} accent="text-emerald-700" />
    <KpiTile
      label="Attendance"
      value={`${kpis.attendance}%`}
      accent={kpis.attendance < 75 ? 'text-rose-600' : 'text-emerald-700'}
    />
    <KpiTile label="Readiness" value={`${kpis.exam_readiness}`} accent="text-indigo-700" />
    <KpiTile
      label="Overdue"
      value={`${kpis.overdue_work}`}
      accent={kpis.overdue_work > 0 ? 'text-amber-700' : 'text-emerald-700'}
    />
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

const TodayPlanList: React.FC<{ tasks: StudentHomePayload['today_tasks'] }> = ({ tasks }) => (
  <View>
    <SectionHeader title="Today's Learning Plan" description="Your day, ordered by what matters most." />
    {tasks && tasks.length > 0 ? (
      tasks.map((task) => <TaskItem key={task.id || task.title} task={task} />)
    ) : (
      <EmptyState
        title="Nothing scheduled for today"
        message="Your study plan refreshes daily. Pull down to refresh."
      />
    )}
  </View>
);
