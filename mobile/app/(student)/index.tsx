import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { AppScreen } from '@/components/AppScreen';
import { AppCard } from '@/components/AppCard';
import { TodayHero } from '@/components/TodayHero';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { ErrorState } from '@/components/ErrorState';
import { useApiQuery } from '@/hooks/useApiQuery';
import { studentApi, type StudentHomePayload } from '@/api/student.api';
import { useAuthStore } from '@/auth/authStore';
import { logout } from '@/auth/AuthProvider';
import { useRouter } from 'expo-router';

/**
 * Phase-1 student home. Walking-skeleton: Today hero + KPI strip + a
 * "next live class" card pulled from the new /mobile/student-home/
 * aggregator. Mastery Tracks, Practice Labs, Assignments, etc. land
 * in Phase 2 — this screen is the landing pad they all hang off.
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
      <View className="px-5 pt-6 pb-4 flex-row items-center justify-between">
        <View>
          <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Maple</Text>
          <Text className="text-2xl font-extrabold text-slate-900">Hi, {firstName}</Text>
        </View>
        <Pressable
          onPress={async () => {
            await logout();
            router.replace('/(auth)/welcome');
          }}
          className="px-3 py-2 rounded-lg bg-slate-100"
          accessibilityRole="button"
          accessibilityLabel="Sign out"
        >
          <Text className="text-xs font-semibold text-slate-700">Sign out</Text>
        </Pressable>
      </View>

      <View className="px-5 space-y-4">
        {homeQuery.isLoading && !data ? (
          <LoadingSkeleton height={120} />
        ) : homeQuery.isError ? (
          <ErrorState onRetry={() => homeQuery.refetch()} />
        ) : data ? (
          <>
            <TodayHero payload={data.today} />
            <KpiStrip kpis={data.kpis} />
            {data.next_live_session && <NextLiveCard session={data.next_live_session} />}
            <AccessChip access={data.access} />
          </>
        ) : null}
      </View>
    </AppScreen>
  );
}

const KpiStrip: React.FC<{ kpis: StudentHomePayload['kpis'] }> = ({ kpis }) => (
  <View className="flex-row flex-wrap -mx-1.5">
    <KpiTile label="Progress" value={`${kpis.overall_progress}%`} accent="text-emerald-700" />
    <KpiTile label="Attendance" value={`${kpis.attendance}%`} accent={kpis.attendance < 75 ? 'text-rose-600' : 'text-emerald-700'} />
    <KpiTile label="Readiness" value={`${kpis.exam_readiness}`} accent="text-indigo-700" />
    <KpiTile label="Overdue" value={`${kpis.overdue_work}`} accent={kpis.overdue_work > 0 ? 'text-amber-700' : 'text-emerald-700'} />
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

const NextLiveCard: React.FC<{ session: NonNullable<StudentHomePayload['next_live_session']> }> = ({ session }) => {
  const start = new Date(session.scheduled_start);
  const when = start.toLocaleString(undefined, {
    weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
  return (
    <AppCard>
      <Text className="text-[11px] font-bold uppercase tracking-wider text-indigo-700">Next live class</Text>
      <Text className="text-lg font-bold text-slate-900 mt-1">{session.title}</Text>
      <Text className="text-sm text-slate-600 mt-1">{session.subject} · {when}</Text>
      <Text className="text-xs text-slate-500 mt-2">{session.duration_minutes} min</Text>
    </AppCard>
  );
};

const AccessChip: React.FC<{ access: StudentHomePayload['access'] }> = ({ access }) => {
  const tier = access.tier;
  const label =
    tier === 'premium'       ? `Premium · ${access.plan ?? 'plan'} active` :
    tier === 'institutional' ? 'Through your school' :
                               'Free tier';
  const surface =
    tier === 'premium'       ? 'bg-emerald-50 border-emerald-200' :
    tier === 'institutional' ? 'bg-blue-50 border-blue-200' :
                               'bg-slate-100 border-slate-200';
  return (
    <View className={`rounded-xl border px-4 py-3 ${surface}`}>
      <Text className="text-xs font-semibold text-slate-700">{label}</Text>
    </View>
  );
};
